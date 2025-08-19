# Data Integration Documentation

## Firebase Data Architecture for User Dashboard

### Overview

The user dashboard integrates with Firebase Firestore to display personalized QR code data, usage statistics, and scan analytics. Each user has isolated data access with real-time updates.

## 1. User Data Collections

### User Profile Collection (`/users/{userId}`)

```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: timestamp,
  lastLogin: timestamp,

  subscription: {
    plan: "free", // or "pro"
    status: "active",
    subscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null
  },

  usageStats: {
    qrCodesThisMonth: 3,
    lastResetDate: timestamp,
    totalQRCodes: 15,
    totalScans: 234
  },

  preferences: {
    defaultQRSize: 400,
    defaultErrorCorrection: "M",
    emailNotifications: true
  }
}
```

### User QR Codes Collection (`/qrcodes/{qrCodeId}`)

```javascript
{
  userId: "user123", // Owner of the QR code
  type: "url", // url, wifi, contact, text, etc.
  data: {
    url: "https://example.com",
    // or wifi: { ssid: "...", password: "..." }
    // or contact: { name: "...", phone: "..." }
  },

  // Customization settings
  customization: {
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    size: 400,
    errorCorrection: "M",
    logoUrl: null, // Pro feature
    logoSize: 0.2
  },

  // Metadata
  name: "My Website QR",
  description: "QR code for my personal website",
  createdAt: timestamp,
  updatedAt: timestamp,

  // Analytics (Pro feature)
  analytics: {
    totalScans: 47,
    lastScanned: timestamp,
    scansByDay: [], // Array of daily scan counts
    topLocations: [], // Geographic scan data
    deviceBreakdown: { mobile: 35, desktop: 12 }
  }
}
```

### QR Scan Tracking (`/qr_scans/{scanId}`)

```javascript
{
  qrCodeId: "qr_abc123",
  userId: "user123", // QR code owner
  scannedAt: timestamp,

  // Scanner information (if available)
  scannerInfo: {
    ipAddress: "192.168.1.1", // Hashed for privacy
    userAgent: "Mozilla/5.0...",
    device: "mobile", // mobile, desktop, tablet
    location: { // Approximate location if available
      country: "US",
      region: "CA",
      city: "San Francisco"
    }
  },

  // Scan source
  source: "direct", // direct, short_url, embedded
  referrer: null
}
```

## 2. Data Context Architecture

### UserDashboardContext.tsx (To Be Created)

Central data management for user dashboard metrics:

```typescript
interface UserDashboardState {
  loading: boolean;
  error: string | null;

  // User QR codes
  qrCodes: QRCode[];
  totalQRCodes: number;
  qrCodesThisMonth: number;

  // Usage statistics
  usageStats: {
    qrCodesThisMonth: number;
    totalScans: number;
    monthlyLimit: number;
    canCreateMore: boolean;
  };

  // Analytics data
  analytics: {
    totalScans: number;
    scansThisMonth: number;
    avgScansPerCode: number;
    scansByDay: Array<{ date: string; scans: number }>;
    topPerformingCodes: QRCode[];
  };

  // Recent activity
  recentActivity: Array<{
    type: 'created' | 'scanned';
    qrCodeId: string;
    timestamp: Date;
    details: any;
  }>;
}

// Context functions
const refreshUserData = async () => {
  // Fetch user's QR codes, usage stats, and analytics
};

const refreshQRCodes = async () => {
  // Fetch user's QR codes with pagination
};

const refreshAnalytics = async () => {
  // Fetch scan analytics for user's QR codes
};
```

## 3. Real-time Data Fetching

### QR Codes Fetching

```typescript
const fetchUserQRCodes = async (userId: string, limit = 10) => {
  try {
    const qrCodesRef = collection(db, 'qrcodes');
    const q = query(
      qrCodesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    const qrCodes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return qrCodes;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }
};
```

### Usage Statistics

```typescript
const fetchUsageStats = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User not found');
    }

    return {
      qrCodesThisMonth: userData.usageStats?.qrCodesThisMonth || 0,
      totalQRCodes: userData.usageStats?.totalQRCodes || 0,
      totalScans: userData.usageStats?.totalScans || 0,
      lastResetDate: userData.usageStats?.lastResetDate,
      monthlyLimit: userData.subscription?.plan === 'pro' ? Infinity : 5,
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    throw error;
  }
};
```

### Scan Analytics

```typescript
const fetchScanAnalytics = async (userId: string) => {
  try {
    // Get all user's QR codes first
    const qrCodes = await fetchUserQRCodes(userId);
    const qrCodeIds = qrCodes.map((qr) => qr.id);

    // Fetch scan data for user's QR codes
    const scansRef = collection(db, 'qr_scans');
    const q = query(
      scansRef,
      where('qrCodeId', 'in', qrCodeIds.slice(0, 10)), // Firestore limit
      orderBy('scannedAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const scans = snapshot.docs.map((doc) => doc.data());

    // Calculate analytics
    const totalScans = scans.length;
    const scansThisMonth = scans.filter((scan) => {
      const scanDate = scan.scannedAt.toDate();
      const now = new Date();
      return (
        scanDate.getMonth() === now.getMonth() &&
        scanDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const avgScansPerCode =
      qrCodes.length > 0 ? totalScans / qrCodes.length : 0;

    return {
      totalScans,
      scansThisMonth,
      avgScansPerCode: Math.round(avgScansPerCode),
      scansByDay: calculateDailyScans(scans),
      topPerformingCodes: calculateTopCodes(qrCodes, scans),
    };
  } catch (error) {
    console.error('Error fetching scan analytics:', error);
    throw error;
  }
};
```

## 4. Real-time Listeners

### QR Codes Real-time Updates

```typescript
const setupQRCodesListener = (
  userId: string,
  callback: (qrCodes: QRCode[]) => void
) => {
  const qrCodesRef = collection(db, 'qrcodes');
  const q = query(
    qrCodesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const qrCodes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(qrCodes);
    },
    (error) => {
      console.error('QR codes listener error:', error);
    }
  );
};
```

### Usage Stats Real-time Updates

```typescript
const setupUsageStatsListener = (
  userId: string,
  callback: (stats: UsageStats) => void
) => {
  const userDocRef = doc(db, 'users', userId);

  return onSnapshot(
    userDocRef,
    (snapshot) => {
      const userData = snapshot.data();
      if (userData) {
        callback({
          qrCodesThisMonth: userData.usageStats?.qrCodesThisMonth || 0,
          totalQRCodes: userData.usageStats?.totalQRCodes || 0,
          totalScans: userData.usageStats?.totalScans || 0,
          lastResetDate: userData.usageStats?.lastResetDate,
        });
      }
    },
    (error) => {
      console.error('Usage stats listener error:', error);
    }
  );
};
```

## 5. Data Mutations

### Create QR Code

```typescript
const createQRCode = async (userId: string, qrData: QRCodeData) => {
  try {
    // Check usage limits for free users
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const isPro = userData?.subscription?.plan === 'pro';
    const currentUsage = userData?.usageStats?.qrCodesThisMonth || 0;

    if (!isPro && currentUsage >= 5) {
      throw new Error(
        'Monthly QR code limit reached. Upgrade to Pro for unlimited codes.'
      );
    }

    // Create QR code
    const qrCodeRef = await addDoc(collection(db, 'qrcodes'), {
      userId,
      ...qrData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user usage stats
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

### Update QR Code

```typescript
const updateQRCode = async (qrCodeId: string, updates: Partial<QRCodeData>) => {
  try {
    await updateDoc(doc(db, 'qrcodes', qrCodeId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw error;
  }
};
```

### Delete QR Code

```typescript
const deleteQRCode = async (userId: string, qrCodeId: string) => {
  try {
    // Verify ownership
    const qrDoc = await getDoc(doc(db, 'qrcodes', qrCodeId));
    if (!qrDoc.exists() || qrDoc.data()?.userId !== userId) {
      throw new Error('Unauthorized: Cannot delete QR code');
    }

    // Delete QR code
    await deleteDoc(doc(db, 'qrcodes', qrCodeId));

    // Update user stats
    await updateDoc(doc(db, 'users', userId), {
      'usageStats.totalQRCodes': increment(-1),
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};
```

## 6. Caching and Performance

### Data Caching Strategy

```typescript
// Cache user data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CachedData<any>>();

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T) => {
  cache.set(key, { data, timestamp: Date.now() });
};
```

### Pagination for Large Datasets

```typescript
const fetchQRCodesPaginated = async (
  userId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 10
) => {
  const qrCodesRef = collection(db, 'qrcodes');
  let q = query(
    qrCodesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  return {
    qrCodes: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
};
```

## 7. Error Handling

### Network Error Recovery

```typescript
const retryFetch = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
  throw new Error('Max retries exceeded');
};
```

### Offline Data Handling

```typescript
const handleOfflineData = (userId: string) => {
  // Use cached data when offline
  const cachedQRCodes = getCachedData(`qrcodes_${userId}`);
  const cachedStats = getCachedData(`stats_${userId}`);

  return {
    qrCodes: cachedQRCodes || [],
    stats: cachedStats || {
      qrCodesThisMonth: 0,
      totalQRCodes: 0,
      totalScans: 0,
    },
    isOffline: true,
  };
};
```

## 8. Data Security

### User Data Isolation

```typescript
// All queries automatically filter by userId
const getUserData = async (userId: string) => {
  // Users can only access their own data
  const qrCodesRef = collection(db, 'qrcodes');
  const q = query(qrCodesRef, where('userId', '==', userId));
  return getDocs(q);
};
```

### Data Validation

```typescript
const validateQRCodeData = (data: any): QRCodeData => {
  // Validate required fields
  if (!data.type || !data.data) {
    throw new Error('Invalid QR code data');
  }

  // Sanitize inputs
  return {
    type: data.type,
    data: sanitizeData(data.data),
    customization: validateCustomization(data.customization),
    name: sanitizeString(data.name),
    description: sanitizeString(data.description),
  };
};
```
