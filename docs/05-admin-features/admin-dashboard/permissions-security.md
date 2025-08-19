# Permissions & Security Documentation

## Security Architecture Overview

The admin dashboard implements a multi-layered security approach combining Firebase Authentication, Firestore security rules, and application-level access controls.

## 1. Firebase Authentication

### Admin User Identification

Two methods for determining admin status:

#### Method 1: Email Whitelist (Primary)

```javascript
// Hardcoded admin email in firestore.rules
function isAdmin() {
  return (
    isSignedIn() && request.auth.token.email == 'sayquanmclaurinwork@gmail.com'
    // ... additional logic
  );
}
```

#### Method 2: Firestore User Flag (Secondary)

```javascript
// Check user document for admin flag
function isAdmin() {
  return (
    // ... email check OR
    (isSignedIn() &&
     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true)
  );
}
```

## 2. Firestore Security Rules

### Current Development Rules

**File**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return (
        (isSignedIn() && request.auth.token.email == 'sayquanmclaurinwork@gmail.com')
        ||
        (isSignedIn() &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true)
      );
    }

    // DEVELOPMENT RULES - Permissive for testing
    match /users/{userId} {
      allow read: if true;  // ⚠️ Temporary for development
      allow write: if true; // ⚠️ Temporary for development
      allow list: if true;  // ⚠️ Temporary for development
      allow create: if true; // ⚠️ Temporary for development
    }

    match /analytics/{analyticsId} {
      allow read: if true;  // ⚠️ Temporary for development
      allow write: if true; // ⚠️ Temporary for development
      allow create: if true; // ⚠️ Temporary for development
    }

    match /user_analytics/{userAnalyticsId} {
      allow read: if true;  // ⚠️ Temporary for development
      allow write: if true; // ⚠️ Temporary for development
      allow create: if true; // ⚠️ Temporary for development
    }

    match /blog/{postId} {
      allow read: if true;
      allow write: if true; // ⚠️ Temporary for development
      allow create: if true; // ⚠️ Temporary for development
      allow list: if true;
    }

    match /qr_scans/{scanId} {
      allow read: if true; // ⚠️ Temporary for development
      allow create: if true;
    }

    match /public_qr/{qrCodeId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Production-Ready Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return (
        (isSignedIn() && request.auth.token.email == 'sayquanmclaurinwork@gmail.com')
        ||
        (isSignedIn() &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true)
      );
    }

    // PRODUCTION RULES - Secure
    match /users/{userId} {
      allow read: if isAdmin(); // Only admins can read user data
      allow write: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
      allow list: if isAdmin(); // Only admins can list all users
      allow create: if isSignedIn(); // Users can create their own profile
    }

    match /analytics/{analyticsId} {
      allow read: if isAdmin(); // Only admins can read analytics
      allow write: if isAdmin(); // Only admins can modify analytics
      allow create: if true; // Allow system to create analytics
    }

    match /user_analytics/{userAnalyticsId} {
      allow read: if isAdmin() || (isSignedIn() && userAnalyticsId.matches('.*' + request.auth.uid + '.*'));
      allow write: if true; // Allow system to write user analytics
      allow create: if true; // Allow system to create user analytics
    }

    match /blog/{postId} {
      allow read: if true; // Public read access
      allow write: if isAdmin(); // Only admins can modify blog posts
      allow create: if isAdmin(); // Only admins can create blog posts
      allow list: if true; // Public listing
    }

    match /qr_scans/{scanId} {
      allow read: if isAdmin(); // Only admins can read scan data
      allow create: if true; // Allow anonymous scan tracking
    }

    match /qrcodes/{qrCodeId} {
      allow read, write: if isSignedIn() &&
        request.auth.uid == resource.data.userId;
      allow create: if isSignedIn() &&
        request.auth.uid == request.resource.data.userId;
    }

    match /public_qr/{qrCodeId} {
      allow read: if true; // Public QR code access
      allow write: if false; // No direct writes to public QR codes
    }
  }
}
```

## 3. Application-Level Security

### Route Protection

**Component**: `ProtectedRoute.tsx`

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Security checks
  const isDevMode = searchParams.get('dev') === 'true' && import.meta.env.DEV;
  const isWhitelistedAdmin = user?.email === 'sayquanmclaurinwork@gmail.com';
  const hasAdminClaims = user?.customClaims?.admin === true;

  const hasAccess = isDevMode || isWhitelistedAdmin || hasAdminClaims;

  if (loading) return <LoadingSpinner />;
  if (!hasAccess)
    return (
      <Navigate to="/dev-admin-login" state={{ from: location }} replace />
    );

  return <>{children}</>;
};
```

### Development Bypass Security

```typescript
// ⚠️ REMOVE IN PRODUCTION
const isDevMode = searchParams.get('dev') === 'true' && import.meta.env.DEV;
```

## 4. Data Access Control

### AdminDataContext Security

```typescript
// Only fetch admin data if user has proper access
useEffect(() => {
  if (hasAdminAccess()) {
    refreshUsers();
    refreshBlogPosts();
    refreshAnalytics();
  }
}, [user]);

const hasAdminAccess = () => {
  return (
    user?.email === 'sayquanmclaurinwork@gmail.com' ||
    user?.customClaims?.admin === true
  );
};
```

### API Security

```typescript
// Verify admin status before data operations
const fetchAdminData = async () => {
  try {
    if (!hasAdminAccess()) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Proceed with data fetching
    const usersSnapshot = await getDocs(collection(db, 'users'));
    // ... rest of data fetching
  } catch (error) {
    console.error('Error fetching admin data:', error);
    setError(error.message);
  }
};
```

## 5. Security Vulnerabilities & Mitigations

### Current Vulnerabilities (Development Mode)

1. **⚠️ Permissive Firestore Rules**: Currently allow `if true` for development
2. **⚠️ Dev Bypass**: `?dev=true` parameter bypasses all authentication
3. **⚠️ Hardcoded Admin Email**: Single point of failure for admin access
4. **⚠️ Client-Side Security**: Security logic runs in browser (can be bypassed)

### Mitigation Strategies

1. **Server-Side Validation**: Move admin checks to Firebase Functions
2. **Custom Claims**: Use Firebase Auth custom claims for admin roles
3. **Environment Variables**: Remove hardcoded admin emails
4. **Audit Logging**: Log all admin actions for security monitoring

## 6. Production Security Checklist

### Before Production Deployment

- [ ] Remove `?dev=true` bypass logic from ProtectedRoute
- [ ] Update Firestore rules to production-secure version
- [ ] Implement Firebase Auth custom claims for admin roles
- [ ] Add audit logging for all admin actions
- [ ] Set up monitoring for unauthorized access attempts
- [ ] Implement session timeout and token refresh
- [ ] Add HTTPS-only cookies for session management
- [ ] Enable Firebase Security Rules testing
- [ ] Set up admin user management system
- [ ] Implement proper error handling (no sensitive data leaks)

### Firebase Project Security Settings

```bash
# Enable enhanced security features
firebase projects:addsites --project=your-project-id
firebase auth:export --project=your-project-id
firebase firestore:indexes --project=your-project-id
```

## 7. Monitoring & Auditing

### Security Event Logging

```typescript
// Log admin actions for audit trail
const logAdminAction = async (action: string, details: any) => {
  await addDoc(collection(db, 'admin_audit_log'), {
    adminEmail: user?.email,
    action,
    details,
    timestamp: serverTimestamp(),
    ipAddress: await getClientIP(), // Implement IP detection
    userAgent: navigator.userAgent,
  });
};
```

### Firebase Security Monitoring

- **Authentication logs**: Monitor failed login attempts
- **Firestore access logs**: Track data access patterns
- **Function logs**: Monitor admin function invocations
- **Performance monitoring**: Detect unusual activity patterns

## 8. Incident Response

### Security Breach Response Plan

1. **Immediate Actions**:

   - Disable compromised admin accounts
   - Revoke Firebase tokens
   - Update Firestore security rules
   - Monitor for data exfiltration

2. **Investigation**:

   - Review audit logs
   - Check Firebase console logs
   - Analyze access patterns
   - Identify breach scope

3. **Recovery**:
   - Reset admin credentials
   - Update security rules
   - Patch vulnerabilities
   - Notify affected users

### Emergency Admin Lockdown

```javascript
// Emergency rule to lock down all access
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Emergency lockdown
    }
  }
}
```

## 9. Best Practices

### Secure Development

- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Defense in Depth**: Multiple security layers
- **Regular Security Reviews**: Audit code and configurations
- **Security Testing**: Penetration testing and vulnerability scanning

### Production Deployment

- **Staged Rollout**: Deploy security changes gradually
- **Backup Strategy**: Backup data before security updates
- **Rollback Plan**: Quick rollback for security issues
- **Documentation**: Keep security procedures documented
