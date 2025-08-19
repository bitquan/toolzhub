import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const env: Record<string, any> = (import.meta as any)?.env || {};

interface AnalyticsEvent {
  userId?: string;
  route: string;
  qrType?: string;
  timestamp: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private dailyDocId: string;

  constructor() {
    this.dailyDocId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track route visits with enhanced filtering
  async trackRoute(
    route: string,
    userId?: string,
    metadata?: {
      sessionId?: string;
      isTestTraffic?: boolean;
      timestamp?: number;
    }
  ): Promise<void> {
    try {
      // Skip tracking if marked as test traffic in production
      if (metadata?.isTestTraffic && !env.DEV) {
        return;
      }

      // Sanitize route for use as Firestore field name
      const sanitizedRoute =
        route.replace(/[~*/[\]]/g, '_').replace(/^_+|_+$/g, '') || 'root';

      const analyticsRef = doc(db, 'analytics', this.dailyDocId);

      // Track both total and unique visits
      const uniqueKey = `unique_${sanitizedRoute}`;
      const totalKey = `total_${sanitizedRoute}`;

      // Get existing document or create new one
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        const data = analyticsDoc.data();
        const existingUniqueUsers = data.uniqueUsers?.[sanitizedRoute] || [];

        // Only increment unique count if user hasn't visited this route today
        const shouldIncrementUnique =
          userId && !existingUniqueUsers.includes(userId);

        const updateData: any = {
          [`routes.${totalKey}`]: increment(1),
          lastUpdated: serverTimestamp(),
        };

        if (shouldIncrementUnique) {
          updateData[`routes.${uniqueKey}`] = increment(1);
          updateData[`uniqueUsers.${sanitizedRoute}`] = [
            ...existingUniqueUsers,
            userId,
          ];
        }

        await updateDoc(analyticsRef, updateData);
      } else {
        // Create new document
        const newData: any = {
          date: this.dailyDocId,
          routes: {
            [totalKey]: 1,
            [uniqueKey]: userId ? 1 : 0,
          },
          uniqueUsers: userId
            ? {
                [sanitizedRoute]: [userId],
              }
            : {},
          qrTypes: {},
          qrGenerated: 0,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        };

        await setDoc(analyticsRef, newData);
      }

      // Also track in user-specific analytics if userId provided
      if (userId) {
        const userAnalyticsRef = doc(
          db,
          'user_analytics',
          `${userId}_${this.dailyDocId}`
        );
        const userDoc = await getDoc(userAnalyticsRef);

        if (userDoc.exists()) {
          await updateDoc(userAnalyticsRef, {
            [`routes.${sanitizedRoute}`]: increment(1),
            lastUpdated: serverTimestamp(),
          });
        } else {
          await setDoc(userAnalyticsRef, {
            userId,
            date: this.dailyDocId,
            routes: {
              [sanitizedRoute]: 1,
            },
            qrTypes: {},
            qrGenerated: 0,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error tracking route:', error);
    }
  }

  // Track QR code generation with filtering
  async trackQRGeneration(
    qrType: string,
    userId?: string,
    metadata?: {
      sessionId?: string;
      isTestTraffic?: boolean;
      timestamp?: number;
    }
  ): Promise<void> {
    try {
      // Skip tracking if marked as test traffic in production
      if (metadata?.isTestTraffic && !env.DEV) {
        return;
      }

      const analyticsRef = doc(db, 'analytics', this.dailyDocId);

      // Get existing document or create new one
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        // Update existing document
        await updateDoc(analyticsRef, {
          [`qrTypes.${qrType}`]: increment(1),
          qrGenerated: increment(1),
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Create new document
        await setDoc(analyticsRef, {
          date: this.dailyDocId,
          routes: {},
          qrTypes: {
            [qrType]: 1,
          },
          qrGenerated: 1,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }

      // Also track in user-specific analytics if userId provided
      if (userId) {
        const userAnalyticsRef = doc(
          db,
          'user_analytics',
          `${userId}_${this.dailyDocId}`
        );
        const userDoc = await getDoc(userAnalyticsRef);

        if (userDoc.exists()) {
          await updateDoc(userAnalyticsRef, {
            [`qrTypes.${qrType}`]: increment(1),
            qrGenerated: increment(1),
            lastUpdated: serverTimestamp(),
          });
        } else {
          await setDoc(userAnalyticsRef, {
            userId,
            date: this.dailyDocId,
            routes: {},
            qrTypes: {
              [qrType]: 1,
            },
            qrGenerated: 1,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }

        // Update user's overall usage
        const userRef = doc(db, 'users', userId);
        const userDocument = await getDoc(userRef);

        if (userDocument.exists()) {
          const currentUsage = userDocument.data()?.usage?.qrGenerated || 0;
          await updateDoc(userRef, {
            'usage.qrGenerated': currentUsage + 1,
            'usage.lastQRDate': serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error tracking QR generation:', error);
    }
  }

  // Track custom events
  async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      const eventRef = doc(
        db,
        'events',
        `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );

      await setDoc(eventRef, {
        eventName,
        properties,
        userId,
        timestamp: serverTimestamp(),
        date: this.dailyDocId,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Batch track multiple events (for performance)
  async batchTrackEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      // Group events by type for efficient updates
      const routeCounts: Record<string, number> = {};
      const qrTypeCounts: Record<string, number> = {};

      events.forEach((event) => {
        routeCounts[event.route] = (routeCounts[event.route] || 0) + 1;
        if (event.qrType) {
          qrTypeCounts[event.qrType] = (qrTypeCounts[event.qrType] || 0) + 1;
        }
      });

      const analyticsRef = doc(db, 'analytics', this.dailyDocId);
      const updateData: Record<string, any> = {
        lastUpdated: serverTimestamp(),
      };

      // Add route updates
      Object.entries(routeCounts).forEach(([route, count]) => {
        updateData[`routes.${route}`] = increment(count);
      });

      // Add QR type updates
      Object.entries(qrTypeCounts).forEach(([qrType, count]) => {
        updateData[`qrTypes.${qrType}`] = increment(count);
        updateData.qrGenerated = increment(count);
      });

      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        await updateDoc(analyticsRef, updateData);
      } else {
        await setDoc(analyticsRef, {
          date: this.dailyDocId,
          routes: routeCounts,
          qrTypes: qrTypeCounts,
          qrGenerated: Object.values(qrTypeCounts).reduce(
            (sum, count) => sum + count,
            0
          ),
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error batch tracking events:', error);
    }
  }

  // Reset analytics data (admin only)
  async resetAnalytics(dateId?: string): Promise<void> {
    try {
      const docId = dateId || this.dailyDocId;
      const analyticsRef = doc(db, 'analytics', docId);

      // Reset to initial state
      await setDoc(analyticsRef, {
        date: docId,
        routes: {},
        qrTypes: {},
        qrGenerated: 0,
        uniqueUsers: {},
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error resetting analytics:', error);
      throw error;
    }
  }

  // Clear all analytics data (admin only)
  async clearAllAnalytics(): Promise<void> {
    try {
      const analyticsCollection = collection(db, 'analytics');
      const querySnapshot = await getDocs(analyticsCollection);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing all analytics:', error);
      throw error;
    }
  }

  // Get analytics data for admin dashboard
  async getAnalyticsData(): Promise<any> {
    try {
      const analyticsRef = doc(db, 'analytics', this.dailyDocId);
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        return analyticsDoc.data();
      } else {
        return {
          routes: {},
          qrTypes: {},
          qrGenerated: 0,
          lastUpdated: null,
        };
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
