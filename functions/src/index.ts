import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Import function modules
import { stripeWebhook, createCheckoutSession } from './stripe';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe endpoints
app.post('/stripe/webhook', stripeWebhook);
app.post('/stripe/create-checkout-session', createCheckoutSession);

// Export the Express app as a single Cloud Function
export const api = functions.https.onRequest(app);

// QR code scan tracking
export const trackQRScan = functions.https.onCall(async (data, context) => {
  try {
    const { qrCodeId, metadata } = data;
    
    // Log the scan event
    await admin.firestore().collection('analytics').add({
      qrCodeId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: context.rawRequest.ip,
      userAgent: context.rawRequest.headers['user-agent'],
      ...metadata,
    });

    // Update scan count on QR code
    const qrRef = admin.firestore().collection('qrcodes').doc(qrCodeId);
    await qrRef.update({
      scans: admin.firestore.FieldValue.increment(1),
      lastScanned: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking QR scan:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track scan');
  }
});

// Reset monthly usage counters
export const resetMonthlyUsage = functions.pubsub.schedule('0 0 1 * *').onRun(async (_context) => {
  const batch = admin.firestore().batch();
  
  const usersSnapshot = await admin.firestore().collection('users').get();
  
  usersSnapshot.docs.forEach((doc) => {
    const userRef = admin.firestore().collection('users').doc(doc.id);
    batch.update(userRef, {
      'usageStats.qrCodesThisMonth': 0,
      'usageStats.lastResetDate': admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Reset monthly usage for ${usersSnapshot.size} users`);
  
  return null;
});