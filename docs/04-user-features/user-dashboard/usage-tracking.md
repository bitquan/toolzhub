# Usage Tracking Documentation

## Monthly Usage Limits and Reset Logic

### Overview

The usage tracking system manages QR code creation limits for Free plan users, implements monthly resets, and provides real-time usage monitoring with Firebase integration.

## 1. Usage Statistics Structure

### User Usage Data Model

```typescript
interface UserUsageStats {
  // Monthly tracking
  qrCodesThisMonth: number;
  lastResetDate: Timestamp;

  // All-time tracking
  totalQRCodes: number;
  totalScans: number;

  // Historical data (Pro feature)
  monthlyHistory?: Array<{
    month: string; // "2025-08"
    qrCodesCreated: number;
    totalScans: number;
  }>;
}

// Firestore structure: /users/{userId}
{
  usageStats: {
    qrCodesThisMonth: 3,
    lastResetDate: timestamp,
    totalQRCodes: 15,
    totalScans: 234,
    monthlyHistory: [
      { month: "2025-07", qrCodesCreated: 5, totalScans: 123 },
      { month: "2025-06", qrCodesCreated: 7, totalScans: 89 }
    ]
  }
}
```

## 2. Monthly Reset System

### Firebase Cloud Function for Monthly Reset

```typescript
// functions/src/index.ts
export const resetMonthlyUsage = functions.pubsub
  .schedule('0 0 1 * *') // First day of every month at midnight UTC
  .onRun(async (context) => {
    const batch = admin.firestore().batch();
    const usersRef = admin.firestore().collection('users');

    // Get all users
    const usersSnapshot = await usersRef.get();

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const currentStats = userData.usageStats || {};

      // Archive current month's data
      const currentMonth = new Date().toISOString().substring(0, 7); // "2025-08"
      const previousMonth = getPreviousMonth(currentMonth);

      const monthlyHistory = currentStats.monthlyHistory || [];
      monthlyHistory.push({
        month: previousMonth,
        qrCodesCreated: currentStats.qrCodesThisMonth || 0,
        totalScans: currentStats.totalScans || 0,
      });

      // Reset monthly counters
      batch.update(userDoc.ref, {
        'usageStats.qrCodesThisMonth': 0,
        'usageStats.lastResetDate':
          admin.firestore.FieldValue.serverTimestamp(),
        'usageStats.monthlyHistory': monthlyHistory.slice(-12), // Keep last 12 months
      });
    });

    await batch.commit();
    console.log(`Reset monthly usage for ${usersSnapshot.size} users`);

    return null;
  });
```

### Client-Side Reset Detection

```typescript
const checkForMonthlyReset = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  if (!userData) return;

  const lastResetDate = userData.usageStats?.lastResetDate?.toDate();
  const currentDate = new Date();

  // Check if we're in a new month since last reset
  if (
    !lastResetDate ||
    lastResetDate.getMonth() !== currentDate.getMonth() ||
    lastResetDate.getFullYear() !== currentDate.getFullYear()
  ) {
    // Client-side reset (backup for cloud function)
    await updateDoc(doc(db, 'users', userId), {
      'usageStats.qrCodesThisMonth': 0,
      'usageStats.lastResetDate': serverTimestamp(),
    });

    console.log('Monthly usage reset for user:', userId);
  }
};
```

## 3. Usage Tracking Implementation

### QR Code Creation Tracking

```typescript
const createQRCode = async (userId: string, qrData: QRCodeData) => {
  try {
    // Check current usage before creating
    const canCreate = await checkUsageLimit(userId);
    if (!canCreate.allowed) {
      throw new Error(canCreate.reason);
    }

    // Create QR code
    const qrCodeRef = await addDoc(collection(db, 'qrcodes'), {
      userId,
      ...qrData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update usage statistics atomically
    await updateDoc(doc(db, 'users', userId), {
      'usageStats.qrCodesThisMonth': increment(1),
      'usageStats.totalQRCodes': increment(1),
    });

    return qrCodeRef.id;
  } catch (error) {
    console.error('Error creating QR code:', error);
    throw error;
  }
};
```

### Usage Limit Validation

```typescript
const checkUsageLimit = async (
  userId: string
): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  if (!userData) {
    throw new Error('User not found');
  }

  const isPro = userData.subscription?.plan === 'pro';
  const currentUsage = userData.usageStats?.qrCodesThisMonth || 0;
  const monthlyLimit = isPro ? Infinity : 5;

  if (!isPro && currentUsage >= monthlyLimit) {
    return {
      allowed: false,
      reason: `Monthly limit of ${monthlyLimit} QR codes reached. Upgrade to Pro for unlimited codes.`,
      current: currentUsage,
      limit: monthlyLimit,
    };
  }

  return {
    allowed: true,
    current: currentUsage,
    limit: monthlyLimit,
  };
};
```

## 4. Real-time Usage Monitoring

### Usage Context Provider

```typescript
// contexts/UsageContext.tsx
interface UsageContextType {
  usageStats: UserUsageStats | null;
  loading: boolean;
  error: string | null;
  canCreateQR: boolean;
  refreshUsage: () => Promise<void>;
  checkLimit: () => Promise<UsageLimitCheck>;
}

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UserUsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time usage listener
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        const userData = snapshot.data();
        if (userData) {
          setUsageStats(
            userData.usageStats || {
              qrCodesThisMonth: 0,
              totalQRCodes: 0,
              totalScans: 0,
              lastResetDate: null,
            }
          );
        }
      },
      (error) => {
        console.error('Usage stats listener error:', error);
        setError(error.message);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  const canCreateQR = useMemo(() => {
    if (!user || !usageStats) return false;

    const isPro = user.subscription?.plan === 'pro';
    const currentUsage = usageStats.qrCodesThisMonth || 0;

    return isPro || currentUsage < 5;
  }, [user, usageStats]);

  return (
    <UsageContext.Provider
      value={{
        usageStats,
        loading,
        error,
        canCreateQR,
        refreshUsage,
        checkLimit,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
};
```

## 5. Dashboard Usage Display

### Usage Progress Component

```typescript
const UsageProgress: React.FC = () => {
  const { user } = useAuth();
  const { usageStats } = useUsage();

  const isPro = user?.subscription?.plan === 'pro';
  const currentUsage = usageStats?.qrCodesThisMonth || 0;
  const monthlyLimit = isPro ? Infinity : 5;
  const percentage = isPro
    ? 0
    : Math.min((currentUsage / monthlyLimit) * 100, 100);

  if (isPro) {
    return (
      <div className="card p-4 border-primary-200 bg-primary-50">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-primary-600 mr-2" />
          <div>
            <h3 className="font-medium text-primary-900">Unlimited QR Codes</h3>
            <p className="text-sm text-primary-700">
              {usageStats?.qrCodesThisMonth || 0} created this month
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Monthly Usage</h3>
        <span
          className={`text-sm font-medium ${
            percentage >= 100
              ? 'text-red-600'
              : percentage >= 80
              ? 'text-yellow-600'
              : 'text-gray-600'
          }`}
        >
          {currentUsage}/{monthlyLimit}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            percentage >= 100
              ? 'bg-red-500'
              : percentage >= 80
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {percentage >= 100 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-red-600">Monthly limit reached</p>
          <button
            onClick={() => navigate('/pricing')}
            className="text-xs btn-primary py-1 px-3"
          >
            Upgrade
          </button>
        </div>
      ) : percentage >= 80 ? (
        <p className="text-xs text-yellow-600">
          {monthlyLimit - currentUsage} QR codes remaining
        </p>
      ) : (
        <p className="text-xs text-gray-600">
          {monthlyLimit - currentUsage} QR codes remaining this month
        </p>
      )}
    </div>
  );
};
```

## 6. Historical Usage Tracking

### Monthly Usage History (Pro Feature)

```typescript
const UsageHistory: React.FC = () => {
  const { user } = useAuth();
  const { usageStats } = useUsage();

  const isPro = user?.subscription?.plan === 'pro';
  const monthlyHistory = usageStats?.monthlyHistory || [];

  if (!isPro) {
    return (
      <div className="card p-6 text-center">
        <Crown className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900 mb-1">Usage History</h3>
        <p className="text-sm text-gray-600 mb-3">
          Track your monthly usage patterns with Pro
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary text-sm"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-medium text-gray-900 mb-4">Usage History</h3>
      <div className="space-y-3">
        {monthlyHistory.slice(-6).map((month, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-sm font-medium text-gray-900">
              {formatMonthYear(month.month)}
            </span>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {month.qrCodesCreated} QR codes
              </div>
              <div className="text-xs text-gray-600">
                {month.totalScans} scans
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 7. Usage Alerts and Notifications

### Usage Warning System

```typescript
const UsageWarnings: React.FC = () => {
  const { user } = useAuth();
  const { usageStats, canCreateQR } = useUsage();

  const isPro = user?.subscription?.plan === 'pro';
  const currentUsage = usageStats?.qrCodesThisMonth || 0;
  const monthlyLimit = 5;
  const percentage = (currentUsage / monthlyLimit) * 100;

  if (isPro || percentage < 80) return null;

  return (
    <div
      className={`rounded-lg p-4 mb-6 ${
        percentage >= 100
          ? 'bg-red-50 border border-red-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {percentage >= 100 ? (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              percentage >= 100 ? 'text-red-800' : 'text-yellow-800'
            }`}
          >
            {percentage >= 100
              ? 'Monthly Limit Reached'
              : 'Approaching Monthly Limit'}
          </h3>
          <p
            className={`text-sm mt-1 ${
              percentage >= 100 ? 'text-red-700' : 'text-yellow-700'
            }`}
          >
            {percentage >= 100
              ? `You've used all ${monthlyLimit} of your monthly QR codes.`
              : `You've used ${currentUsage} of ${monthlyLimit} monthly QR codes.`}{' '}
            Upgrade to Pro for unlimited codes.
          </p>
          <div className="mt-3">
            <button
              onClick={() => navigate('/pricing')}
              className={`text-sm font-medium ${
                percentage >= 100
                  ? 'text-red-800 hover:text-red-900'
                  : 'text-yellow-800 hover:text-yellow-900'
              }`}
            >
              Upgrade to Pro →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 8. Usage Analytics and Insights

### Usage Patterns Analysis (Pro Feature)

```typescript
const UsageInsights: React.FC = () => {
  const { user } = useAuth();
  const { usageStats } = useUsage();

  const isPro = user?.subscription?.plan === 'pro';
  const monthlyHistory = usageStats?.monthlyHistory || [];

  if (!isPro || monthlyHistory.length < 3) return null;

  const insights = calculateUsageInsights(monthlyHistory);

  return (
    <div className="card p-6">
      <h3 className="font-medium text-gray-900 mb-4">Usage Insights</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Average QR codes per month
          </span>
          <span className="font-medium text-gray-900">
            {insights.avgPerMonth}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Most productive month</span>
          <span className="font-medium text-gray-900">
            {insights.bestMonth}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total scans generated</span>
          <span className="font-medium text-gray-900">
            {insights.totalScans}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Scan-to-creation ratio</span>
          <span className="font-medium text-gray-900">
            {insights.scanRatio}:1
          </span>
        </div>
      </div>
    </div>
  );
};
```

## 9. Reset and Recovery

### Manual Usage Reset (Admin Function)

```typescript
const resetUserUsage = async (userId: string, reason: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      'usageStats.qrCodesThisMonth': 0,
      'usageStats.lastResetDate': serverTimestamp(),
    });

    // Log admin action
    await addDoc(collection(db, 'admin_actions'), {
      action: 'reset_usage',
      userId,
      reason,
      performedBy: 'admin',
      timestamp: serverTimestamp(),
    });

    console.log(`Usage reset for user ${userId}: ${reason}`);
  } catch (error) {
    console.error('Error resetting user usage:', error);
    throw error;
  }
};
```

### Usage Data Correction

```typescript
const correctUsageData = async (
  userId: string,
  corrections: Partial<UserUsageStats>
) => {
  try {
    const updateData: any = {};

    Object.entries(corrections).forEach(([key, value]) => {
      updateData[`usageStats.${key}`] = value;
    });

    await updateDoc(doc(db, 'users', userId), updateData);

    console.log(`Usage data corrected for user ${userId}`);
  } catch (error) {
    console.error('Error correcting usage data:', error);
    throw error;
  }
};
```

## 10. Performance and Optimization

### Efficient Usage Queries

```typescript
const getUsageStatsEfficiently = async (
  userId: string
): Promise<UserUsageStats> => {
  // Use cached data if available and recent
  const cached = getCachedUsageStats(userId);
  if (cached && Date.now() - cached.timestamp < 60000) {
    // 1 minute cache
    return cached.data;
  }

  // Fetch only usage stats field, not entire user document
  const userDoc = await getDoc(doc(db, 'users', userId));
  const usageStats = userDoc.data()?.usageStats || {
    qrCodesThisMonth: 0,
    totalQRCodes: 0,
    totalScans: 0,
    lastResetDate: null,
  };

  // Cache the result
  setCachedUsageStats(userId, usageStats);

  return usageStats;
};
```

### Batch Usage Updates

```typescript
const batchUpdateUsage = async (
  updates: Array<{ userId: string; increment: number }>
) => {
  const batch = writeBatch(db);

  updates.forEach(({ userId, increment: incrementBy }) => {
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      'usageStats.qrCodesThisMonth': increment(incrementBy),
      'usageStats.totalQRCodes': increment(incrementBy),
    });
  });

  await batch.commit();
};
```
