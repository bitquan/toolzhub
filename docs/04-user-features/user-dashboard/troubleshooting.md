# User Dashboard Troubleshooting Guide

## Common Issues and Solutions

### 1. Dashboard Loading Issues

#### Dashboard Shows Mock/Static Data

**Symptoms**: Dashboard displays sample data instead of user's real QR codes

**Causes**:

- Firebase integration not implemented
- User data not properly fetched
- Authentication state issues

**Solutions**:

```bash
# Check Firebase connection
# Visit: http://localhost:4000/firestore
# Verify user data exists in Firestore

# Check browser console for errors
# Look for: "Error fetching user data" or authentication errors
```

**Implementation Fix**:

```typescript
// Replace mock data in Dashboard.tsx
const [stats] = useState({
  totalQRCodes: 3, // ❌ Static data
  qrCodesThisMonth: 2, // ❌ Static data
  totalScans: 147, // ❌ Static data
});

// With real Firebase data
const { qrCodes, usageStats, analytics } = useUserDashboard();
const stats = {
  totalQRCodes: qrCodes.length,
  qrCodesThisMonth: usageStats.qrCodesThisMonth,
  totalScans: analytics.totalScans,
};
```

#### "User not found" or Authentication Errors

**Symptoms**: Dashboard redirects to login or shows authentication errors

**Diagnostic Steps**:

1. Check authentication state in browser dev tools
2. Verify Firebase Auth configuration
3. Check user session persistence

**Solutions**:

```typescript
// Check auth state in browser console
console.log('Auth state:', firebase.auth().currentUser);

// Verify user in AuthContext
const { user, loading } = useAuth();
console.log('User state:', user, 'Loading:', loading);
```

### 2. Usage Tracking Issues

#### Incorrect Usage Counts

**Symptoms**: Usage statistics don't match actual QR codes created

**Common Causes**:

- Usage stats not updated when QR codes created
- Monthly reset not working properly
- Multiple clients updating simultaneously

**Solutions**:

```typescript
// Verify usage update in createQRCode function
const createQRCode = async (qrData) => {
  // Create QR code
  const qrRef = await addDoc(collection(db, 'qrcodes'), qrData);

  // ✅ Don't forget to update usage stats
  await updateDoc(doc(db, 'users', userId), {
    'usageStats.qrCodesThisMonth': increment(1),
    'usageStats.totalQRCodes': increment(1),
  });
};
```

#### Monthly Reset Not Working

**Symptoms**: Usage counts don't reset at beginning of month

**Fixes**:

```bash
# Check Firebase Functions deployment
firebase deploy --only functions

# Check function logs
firebase functions:log --only resetMonthlyUsage

# Manual reset for testing
node scripts/manual-monthly-reset.js
```

### 3. Plan Detection Issues

#### Wrong Plan Display (Free/Pro)

**Symptoms**: Dashboard shows incorrect plan status

**Diagnostic Steps**:

```typescript
// Check user subscription data
const user = firebase.auth().currentUser;
const userDoc = await getDoc(doc(db, 'users', user.uid));
console.log('Subscription:', userDoc.data()?.subscription);

// Verify plan detection logic
const isPro = user?.subscription?.plan === 'pro';
const isActive = user?.subscription?.status === 'active';
```

**Common Issues**:

- Subscription status not updated after Stripe webhook
- Plan field missing in user document
- Case sensitivity in plan comparison

**Solutions**:

```typescript
// Robust plan detection
const getPlanStatus = (subscription) => {
  if (!subscription) return { plan: 'free', active: false };

  return {
    plan: subscription.plan?.toLowerCase() || 'free',
    active: ['active', 'trialing'].includes(subscription.status?.toLowerCase()),
  };
};
```

### 4. Real-time Data Sync Issues

#### Data Not Updating in Real-time

**Symptoms**: Dashboard doesn't reflect changes immediately

**Causes**:

- Firestore listeners not set up
- Component not re-rendering on data changes
- Listener cleanup issues

**Solutions**:

```typescript
// Set up proper Firestore listeners
useEffect(() => {
  if (!user?.uid) return;

  const unsubscribeQRCodes = onSnapshot(
    query(collection(db, 'qrcodes'), where('userId', '==', user.uid)),
    (snapshot) => {
      const qrCodes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQRCodes(qrCodes);
    },
    (error) => console.error('QR codes listener error:', error)
  );

  const unsubscribeUser = onSnapshot(
    doc(db, 'users', user.uid),
    (snapshot) => {
      const userData = snapshot.data();
      setUsageStats(userData?.usageStats);
    },
    (error) => console.error('User listener error:', error)
  );

  // ✅ Critical: Cleanup listeners
  return () => {
    unsubscribeQRCodes();
    unsubscribeUser();
  };
}, [user?.uid]);
```

### 5. QR Code Creation Issues

#### "Monthly limit reached" Error (Free Users)

**Symptoms**: Free users can't create QR codes even when under limit

**Diagnostic Steps**:

```typescript
// Check actual usage vs displayed usage
const checkUsage = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const usageStats = userDoc.data()?.usageStats;

  console.log('Stored usage:', usageStats.qrCodesThisMonth);

  // Count actual QR codes this month
  const currentMonth = new Date().toISOString().substring(0, 7);
  const qrCodes = await getDocs(
    query(
      collection(db, 'qrcodes'),
      where('userId', '==', userId),
      where('createdAt', '>=', new Date(currentMonth + '-01'))
    )
  );

  console.log('Actual QR codes this month:', qrCodes.size);
};
```

**Common Fixes**:

```typescript
// Reset usage if discrepancy found
if (actualCount !== storedCount) {
  await updateDoc(doc(db, 'users', userId), {
    'usageStats.qrCodesThisMonth': actualCount,
  });
}
```

#### QR Code Creation Fails Silently

**Symptoms**: Create button doesn't work, no error shown

**Debug Steps**:

```typescript
// Add comprehensive error handling
const createQRCode = async (qrData) => {
  try {
    console.log('Creating QR code:', qrData);

    // Check authentication
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.uid);
    if (!usageCheck.allowed) {
      throw new Error(usageCheck.reason);
    }

    // Create QR code
    const result = await addDoc(collection(db, 'qrcodes'), {
      userId: user.uid,
      ...qrData,
      createdAt: serverTimestamp(),
    });

    console.log('QR code created:', result.id);
    return result.id;
  } catch (error) {
    console.error('QR code creation error:', error);

    // Show user-friendly error
    if (error.code === 'permission-denied') {
      setError('Permission denied. Please check your account status.');
    } else if (error.message.includes('limit')) {
      setError('Monthly limit reached. Upgrade to Pro for unlimited QR codes.');
    } else {
      setError('Failed to create QR code. Please try again.');
    }

    throw error;
  }
};
```

### 6. Performance Issues

#### Slow Dashboard Loading

**Symptoms**: Dashboard takes long time to load user data

**Optimization Steps**:

```typescript
// 1. Implement pagination for QR codes
const fetchQRCodesPaginated = async (userId, limit = 10) => {
  const q = query(
    collection(db, 'qrcodes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );
  return getDocs(q);
};

// 2. Use caching for frequently accessed data
const getCachedUserData = (userId) => {
  const cacheKey = `user_${userId}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 60000) {
      // 1 minute cache
      return data;
    }
  }

  return null;
};

// 3. Lazy load non-critical data
const LazyAnalytics = lazy(() => import('./AnalyticsSection'));
```

#### Memory Leaks

**Symptoms**: Browser becomes slow with prolonged dashboard use

**Fixes**:

```typescript
// Ensure all listeners are cleaned up
useEffect(() => {
  const unsubscribes = [];

  // Add all listeners to array
  unsubscribes.push(setupQRCodesListener());
  unsubscribes.push(setupUsageStatsListener());
  unsubscribes.push(setupAnalyticsListener());

  return () => {
    // Cleanup all listeners
    unsubscribes.forEach((unsubscribe) => unsubscribe?.());
  };
}, [user?.uid]);

// Cleanup intervals and timeouts
useEffect(() => {
  const interval = setInterval(refreshData, 30000);
  return () => clearInterval(interval);
}, []);
```

### 7. Upgrade Flow Issues

#### Stripe Integration Problems

**Symptoms**: Upgrade button doesn't work or fails

**Debug Steps**:

```bash
# Check Stripe configuration
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Check Firebase Functions logs
firebase functions:log --only api

# Test Stripe webhook endpoint
curl -X POST http://localhost:5001/your-project/us-central1/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

**Common Issues**:

- Stripe keys not configured
- Webhook URL not set correctly
- Customer creation failing

### 8. Data Consistency Issues

#### QR Codes Count Mismatch

**Symptoms**: Dashboard shows different count than actual QR codes

**Data Integrity Check**:

```typescript
const auditUserData = async (userId) => {
  // Get user stats
  const userDoc = await getDoc(doc(db, 'users', userId));
  const storedStats = userDoc.data()?.usageStats;

  // Count actual QR codes
  const qrCodesSnapshot = await getDocs(
    query(collection(db, 'qrcodes'), where('userId', '==', userId))
  );

  const actualCount = qrCodesSnapshot.size;
  const storedCount = storedStats?.totalQRCodes || 0;

  console.log('Data audit:', {
    stored: storedCount,
    actual: actualCount,
    difference: actualCount - storedCount,
  });

  // Fix discrepancy
  if (actualCount !== storedCount) {
    await updateDoc(doc(db, 'users', userId), {
      'usageStats.totalQRCodes': actualCount,
    });
  }
};
```

### 9. Browser-Specific Issues

#### Safari Authentication Issues

**Symptoms**: Dashboard not working in Safari

**Solutions**:

- Check Safari privacy settings
- Disable "Prevent cross-site tracking"
- Clear Safari cache and cookies

#### Mobile Responsiveness Issues

**Symptoms**: Dashboard layout broken on mobile

**CSS Fixes**:

```css
/* Ensure proper mobile layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 10. Emergency Recovery Procedures

#### Complete Dashboard Reset

```bash
# 1. Clear all cached data
localStorage.clear();
sessionStorage.clear();

# 2. Force refresh Firebase connection
firebase.auth().signOut();
# Then sign back in

# 3. Clear browser cache
# Chrome: Settings > Privacy > Clear browsing data

# 4. Reset Firebase emulator data (development)
firebase emulators:start --import=./fresh-data
```

#### Data Recovery

```typescript
// Recover user data from backup
const recoverUserData = async (userId, backupDate) => {
  try {
    // Restore from daily backup
    const backupRef = doc(db, 'backups', `${userId}_${backupDate}`);
    const backupDoc = await getDoc(backupRef);

    if (backupDoc.exists()) {
      const backupData = backupDoc.data();

      // Restore user document
      await setDoc(doc(db, 'users', userId), backupData.user);

      // Restore QR codes
      const batch = writeBatch(db);
      backupData.qrCodes.forEach((qrCode) => {
        const qrRef = doc(collection(db, 'qrcodes'));
        batch.set(qrRef, qrCode);
      });
      await batch.commit();

      console.log('Data recovery completed');
    }
  } catch (error) {
    console.error('Data recovery failed:', error);
  }
};
```

### 11. Debugging Tools

#### Dashboard Debug Panel (Development)

```typescript
const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { usageStats, qrCodes } = useUserDashboard();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div>User: {user?.email}</div>
      <div>Plan: {user?.subscription?.plan || 'free'}</div>
      <div>QR Codes: {qrCodes.length}</div>
      <div>Usage: {usageStats?.qrCodesThisMonth}/5</div>
      <div>Auth State: {user ? 'Authenticated' : 'Not authenticated'}</div>
    </div>
  );
};
```

#### Console Debugging Commands

```javascript
// Check dashboard state in browser console
window.debugDashboard = () => {
  console.log('Auth state:', firebase.auth().currentUser);
  console.log('Firestore cache:', firebase.firestore().app);
  console.log('Local storage:', localStorage);
};

// Test data fetching
window.testDataFetch = async (userId) => {
  const userDoc = await firebase
    .firestore()
    .collection('users')
    .doc(userId)
    .get();
  console.log('User data:', userDoc.data());
};
```
