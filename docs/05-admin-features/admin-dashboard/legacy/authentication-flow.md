# Authentication Flow Documentation

## Authentication Architecture

### Current Implementation

The admin dashboard uses a dual authentication approach for development and production:

## 1. Development Authentication Flow

### Components

- **DevAdminLogin.tsx**: Development admin login interface
- **ProtectedRoute.tsx**: Route protection with dev bypass
- **AuthContext.tsx**: Authentication state management

### Flow Diagram

```
User Access Request
       ↓
[Check ?dev=true parameter]
       ↓
   Dev Mode?
   ├─ Yes → Bypass Authentication → Admin Dashboard
   ├─ No → Check Authentication
       ↓
   Authenticated?
   ├─ Yes → Check Admin Status → Admin Dashboard
   ├─ No → Redirect to DevAdminLogin
```

### Development Access Methods

1. **Direct Bypass**: `http://localhost:3000/admin?dev=true`
2. **Admin Login**: `http://localhost:3000/dev-admin-login`
3. **Quick Dev Access**: Button in DevAdminLogin component

## 2. Production Authentication Flow

### Admin User Requirements

```javascript
// Admin determination in firestore.rules
function isAdmin() {
  return (
    // Email whitelist
    (isSignedIn() && request.auth.token.email == 'sayquanmclaurinwork@gmail.com')
    ||
    // Firestore user flag check
    (isSignedIn() &&
     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true)
  );
}
```

### User Creation Process

```bash
# Create admin user in Firebase emulator
node create-admin-user.mjs
```

## 3. Firebase Emulator Setup

### Admin User Credentials (Development)

- **Email**: `sayquanmclaurinwork@gmail.com`
- **Password**: User-configured
- **Role**: Admin (whitelisted email)

### Authentication Emulator

- **Host**: `localhost:9099`
- **UI**: `http://localhost:4000/auth`

## 4. Route Protection Implementation

### ProtectedRoute Component Logic

```typescript
const isDevMode = searchParams.get('dev') === 'true';
const isWhitelistedAdmin = user?.email === 'sayquanmclaurinwork@gmail.com';
const hasAdminClaims = user?.customClaims?.admin === true;

const hasAccess = isDevMode || isWhitelistedAdmin || hasAdminClaims;
```

## 5. Security Considerations

### Development Mode

- ⚠️ **Dev bypass should be REMOVED in production**
- ⚠️ **Firestore rules are currently permissive for development**
- ⚠️ **Email whitelist is hardcoded**

### Production Readiness Checklist

- [ ] Remove `?dev=true` bypass logic
- [ ] Implement proper admin claims in Firebase Auth
- [ ] Restrict Firestore rules to production-safe permissions
- [ ] Add proper error handling for authentication failures
- [ ] Implement session management and token refresh

## 6. Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions"**: Check Firestore rules
2. **Authentication loop**: Verify admin email in whitelist
3. **Dev bypass not working**: Ensure development environment

### Debug Steps

```bash
# Check Firebase emulator status
firebase emulators:start

# Verify admin user exists
# Visit: http://localhost:4000/auth

# Check Firestore rules compilation
# Visit: http://localhost:4000/firestore
```
