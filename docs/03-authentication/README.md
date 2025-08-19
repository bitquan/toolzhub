# Authentication & Security

## Authentication System Documentation

This section covers all aspects of user authentication, admin access control, and security implementation in ToolzHub.

## 🔐 Authentication Overview

ToolzHub implements a multi-layered authentication system supporting:

- **User Authentication**: Free and Pro users via Firebase Auth
- **Admin Authentication**: Special admin access with enhanced permissions
- **Development Authentication**: Bypass mechanisms for development
- **Security Rules**: Firestore-based access control

## 👥 User Types & Access Levels

### Regular Users (Free/Pro)

- **Registration**: Email/password or Google OAuth
- **Access**: Personal dashboard, QR generator, account settings
- **Data Scope**: Own QR codes, usage statistics, subscription info

### Admin Users

- **Access Method**: Whitelisted email addresses
- **Permissions**: Full platform access, user management, analytics
- **Data Scope**: All users, platform metrics, content management

### Development Access

- **Bypass Mode**: `?dev=true` parameter for local development
- **Emulator Auth**: Firebase Auth emulator for testing
- **Mock Data**: Development-specific test data

## 🛡️ Security Architecture

### Authentication Flow

```
User Request → Firebase Auth → Token Validation → Route Access
     ↓              ↓              ↓               ↓
Login/Signup → JWT Token → Firestore Rules → Component Render
```

## 🔄 Authentication Flows

### User Dashboard Authentication

**Standard User Flow**:

```
User Access Request (/dashboard)
       ↓
[Check Firebase Auth Status]
       ↓
   Authenticated?
   ├─ Yes → Load User Dashboard with personalized data
   ├─ No → Redirect to Login (/login)
```

**Implementation**: `UserProtectedRoute.tsx`

- Protects user dashboard routes
- Validates Firebase Auth token
- Redirects unauthenticated users to login
- Preserves intended destination for post-login redirect

### Admin Dashboard Authentication

**Development Flow**:

```
Admin Access Request (/admin)
       ↓
[Check ?dev=true parameter]
       ↓
   Dev Mode?
   ├─ Yes → Bypass Authentication → Admin Dashboard
   ├─ No → Check Authentication & Admin Status
       ↓
   Authenticated + Admin?
   ├─ Yes → Admin Dashboard
   ├─ No → Redirect to DevAdminLogin
```

**Production Flow**:

```
Admin Access Request (/admin)
       ↓
[Check Firebase Auth + Admin Claims]
       ↓
   Admin User?
   ├─ Yes → Admin Dashboard
   ├─ No → Access Denied
```

**Implementation**: `AdminProtectedRoute.tsx`

- Email whitelist checking for admin status
- Development bypass mechanism
- Enhanced security for admin routes

### Authorization Layers

1. **Frontend Route Protection**: React route guards
2. **Firebase Auth**: Identity verification and token management
3. **Firestore Security Rules**: Database-level access control
4. **Cloud Function Validation**: Server-side permission checks

## 📚 Documentation Structure

### [User Authentication](./user-authentication.md)

Registration, login, password reset, and profile management

### [Admin Authentication](./admin-authentication.md)

Admin access controls, permissions, and management interface

### [Security Rules](./security-rules.md)

Firestore security rules, Firebase Auth configuration

### [Development Authentication](./development-auth.md)

Local development setup, emulator configuration, testing procedures

### [Legacy Documentation](./legacy/)

Previous authentication documentation (for reference)

## 🔧 Implementation Details

### Firebase Authentication

- **Providers**: Email/Password, Google OAuth
- **Custom Claims**: Admin role assignment
- **Security**: Password policies, account verification

### Route Protection

- **Protected Routes**: Dashboard, admin areas, user settings
- **Public Routes**: Landing page, pricing, blog
- **Conditional Access**: Free vs Pro feature access

### Session Management

- **Token Refresh**: Automatic JWT token renewal
- **Logout**: Complete session termination
- **Persistence**: Remember user login state

## 📊 Data Access & Integration

### User Data Permissions

**User Dashboard Data Access**:

```javascript
// User can only access their own data
{
  email: "user@example.com",
  subscription: { plan: "free|pro", status: "active" },
  usageStats: { qrCodesThisMonth: 3, totalScans: 147 },
  qrCodes: [...], // Only user's QR codes
  analytics: [...] // Only user's scan analytics
}
```

**Admin Dashboard Data Access**:

```javascript
// Admin can access platform-wide data
{
  users: [...], // All platform users
  blogPosts: [...], // All blog content
  analytics: {...}, // Platform-wide metrics
  qrCodes: [...], // All QR codes (aggregated)
  platformStats: {...} // System-wide statistics
}
```

### Firebase Integration Patterns

**User Data Context**:

```typescript
// User-specific data fetching
const useUserDashboard = () => {
  const { user } = useAuth();

  // Fetch user's personal data only
  const qrCodes = await getUserQRCodes(user.uid);
  const usageStats = await getUserUsageStats(user.uid);
  const analytics = await getUserAnalytics(user.uid);
};
```

**Admin Data Context**:

```typescript
// Platform-wide data fetching
const useAdminData = () => {
  // Fetch aggregated platform data
  const users = await getAllUsers();
  const blogPosts = await getAllBlogPosts();
  const analytics = await getPlatformAnalytics();
};
```

## 🎯 Key Features

### User Registration & Login

- Email/password authentication
- Google OAuth integration
- Email verification
- Password reset functionality

### Admin Access Control

- Email-based admin identification
- Custom claims for role management
- Secure admin route protection
- Development bypass capabilities

### Security Monitoring

- Failed login attempt tracking
- Suspicious activity detection
- Audit logs for admin actions
- Security event notifications

## 🚨 Security Considerations

### Production Security

- Remove development bypass mechanisms
- Implement proper admin claim management
- Enable security monitoring and alerts
- Regular security rule audits

### Data Protection

- User data isolation
- Encrypted data transmission
- Secure password storage
- GDPR compliance considerations

## 🔗 Integration Points

### Frontend Components

- `AuthContext` for authentication state
- `ProtectedRoute` for route protection
- Login/Registration forms
- User profile management

### Backend Services

- Firebase Auth for identity management
- Firestore rules for data access
- Cloud Functions for admin operations
- Stripe integration for subscription auth

## 🆘 Troubleshooting

Common authentication issues and solutions:

- **Login failures**: Check Firebase configuration
- **Permission errors**: Verify Firestore security rules
- **Admin access issues**: Confirm email whitelist
- **Development problems**: Ensure emulator setup

---

_Security is foundational to user trust and platform integrity._
