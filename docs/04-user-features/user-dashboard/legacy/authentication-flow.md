# User Authentication Flow Documentation

## Authentication Architecture

### User Access Control

The user dashboard uses Firebase Authentication with role-based access and plan-based feature restrictions.

## 1. User Authentication Flow

### Standard User Authentication

```
User Access Request
       ↓
[Check Firebase Auth Status]
       ↓
   Authenticated?
   ├─ Yes → Load User Dashboard
   ├─ No → Redirect to Login (/login)
```

### Protected Route Implementation

**Component**: `ProtectedRoute.tsx` (for user routes)

```typescript
const UserProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
};
```

## 2. User Plan Detection

### Plan Status Determination

```typescript
// In Dashboard component
const isPro = user?.subscription?.plan === 'pro';
const isActive = user?.subscription?.status === 'active';
const qrLimit = isPro ? Infinity : 5;
const usage = user?.usageStats?.qrCodesThisMonth || 0;
```

### User Subscription Structure

```typescript
interface UserSubscription {
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  subscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

interface UserUsageStats {
  qrCodesThisMonth: number;
  lastResetDate: Date;
  totalQRCodes: number;
  totalScans: number;
}
```

## 3. Firebase Auth Integration

### User Document Structure

```javascript
// Firestore: /users/{userId}
{
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "https://...",
  createdAt: timestamp,
  lastLogin: timestamp,

  // Subscription details
  subscription: {
    plan: "free", // or "pro"
    status: "active",
    subscriptionId: null, // Stripe subscription ID for pro users
    currentPeriodStart: null,
    currentPeriodEnd: null
  },

  // Usage tracking
  usageStats: {
    qrCodesThisMonth: 2,
    lastResetDate: timestamp,
    totalQRCodes: 15,
    totalScans: 347
  },

  // User preferences
  preferences: {
    defaultQRSize: 400,
    defaultErrorCorrection: "M",
    emailNotifications: true
  }
}
```

## 4. Access Control Levels

### Route Protection

```typescript
// Public routes (no auth required)
- / (Home)
- /pricing
- /blog
- /login
- /register

// Protected routes (auth required)
- /dashboard (User dashboard)
- /generate (QR code generator)
- /settings (User settings)

// Admin routes (admin auth required)
- /admin (Admin dashboard)
- /admin-dashboard
```

### Feature Access Control

```typescript
// Free plan restrictions
const canCreateQR = usage < qrLimit || isPro;
const canUseAdvancedFeatures = isPro;
const canAccessAnalytics = isPro;
const canCustomizeBranding = isPro;

// Feature gating in components
{
  isPro ? (
    <AdvancedCustomization />
  ) : (
    <UpgradePrompt feature="Advanced Customization" />
  );
}
```

## 5. Authentication States

### Loading State

```typescript
// Show loading spinner while checking auth
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
}
```

### Unauthenticated State

```typescript
// Redirect to login with return path
if (!user) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}
```

### Authenticated State

```typescript
// Load user dashboard with personalized content
return <Dashboard user={user} />;
```

## 6. Session Management

### Token Refresh

```typescript
// AuthContext handles automatic token refresh
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

### Logout Flow

```typescript
const logout = async () => {
  try {
    await signOut(auth);
    // Clear local state
    setUser(null);
    // Redirect to home
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## 7. User Profile Management

### Profile Updates

```typescript
const updateProfile = async (profileData: Partial<UserProfile>) => {
  try {
    // Update Firebase Auth profile
    await updateProfile(auth.currentUser!, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
    });

    // Update Firestore user document
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Profile update error:', error);
  }
};
```

## 8. Security Considerations

### Client-Side Security

```typescript
// Verify user ownership before operations
const verifyUserOwnership = (qrCodeId: string) => {
  const qrDoc = await getDoc(doc(db, 'qrcodes', qrCodeId));
  return qrDoc.data()?.userId === user?.uid;
};
```

### Data Isolation

- Users can only access their own QR codes
- Usage stats are user-specific
- Scan data is tied to user accounts
- Admin data is completely separate

## 9. Error Handling

### Authentication Errors

```typescript
const handleAuthError = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/user-not-found':
      setError('Account not found. Please check your email.');
      break;
    case 'auth/wrong-password':
      setError('Incorrect password. Please try again.');
      break;
    case 'auth/too-many-requests':
      setError('Too many failed attempts. Please try again later.');
      break;
    default:
      setError('An error occurred. Please try again.');
  }
};
```

### Network Errors

```typescript
const handleNetworkError = (error: any) => {
  if (!navigator.onLine) {
    setError('You appear to be offline. Please check your connection.');
  } else {
    setError('Network error. Please try again.');
  }
};
```

## 10. Development vs Production

### Development Authentication

```typescript
// Development: Relaxed auth for testing
const isDevelopment = import.meta.env.DEV;

// Allow demo users in development
if (isDevelopment && user?.email?.includes('demo')) {
  // Special handling for demo accounts
}
```

### Production Authentication

```typescript
// Production: Strict auth requirements
const requireEmailVerification = !import.meta.env.DEV;

if (requireEmailVerification && !user?.emailVerified) {
  return <EmailVerificationPrompt />;
}
```

## 11. Multi-Device Support

### Session Synchronization

- Firebase Auth automatically syncs across devices
- User data updates in real-time via Firestore listeners
- Usage stats updated consistently across sessions

### Offline Support

```typescript
// Enable offline persistence for user data
enableMultiTabIndexedDbPersistence(db);

// Handle offline states
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```
