# Troubleshooting Guide

## Common Issues and Solutions

### 1. Authentication Issues

#### "Missing or insufficient permissions" Error

**Symptoms**: Console errors when accessing admin dashboard data

**Causes**:

- Firestore security rules blocking access
- User not properly authenticated as admin
- Firebase emulator not running

**Solutions**:

```bash
# Check Firebase emulator status
firebase emulators:start

# Verify Firestore rules compilation
# Look for rule compilation errors in terminal

# Check admin user authentication
# Visit: http://localhost:4000/auth
# Verify admin user exists and is signed in
```

**Quick Fix for Development**:

```javascript
// Temporarily add to firestore.rules
match /{document=**} {
  allow read, write: if true; // DEVELOPMENT ONLY
}
```

#### Admin Dashboard Shows "Access Denied"

**Symptoms**: Redirected to login page or access denied message

**Diagnostic Steps**:

1. Check if development bypass is working: `http://localhost:3000/admin?dev=true`
2. Verify admin email in ProtectedRoute.tsx
3. Check browser console for authentication errors

**Solutions**:

```typescript
// Verify admin email in ProtectedRoute.tsx
const isWhitelistedAdmin = user?.email === 'sayquanmclaurinwork@gmail.com';

// Check dev mode is enabled
const isDevMode = searchParams.get('dev') === 'true' && import.meta.env.DEV;
```

#### Firebase Auth Emulator Connection Issues

**Symptoms**: Authentication not working, user remains null

**Solutions**:

```bash
# Restart Firebase emulators
pkill -f firebase
npm run firebase:emulators

# Check emulator ports
netstat -an | grep 9099  # Auth emulator
netstat -an | grep 8080  # Firestore emulator
```

### 2. Data Loading Issues

#### Admin Dashboard Shows All Zeros

**Symptoms**: All metrics display 0 with warning triangles

**Diagnostic Steps**:

1. Check Firebase emulator UI: `http://localhost:4000/firestore`
2. Verify data exists in collections
3. Check browser console for fetch errors

**Solutions**:

```bash
# Repopulate test data
node populate-firebase-data.mjs

# Check data in emulator
# Visit: http://localhost:4000/firestore
# Look for: users, blog, analytics, qr_scans collections
```

#### "Error fetching users" Console Messages

**Symptoms**: Repeated console errors about data fetching

**Root Causes**:

- Firestore rules too restrictive
- Collections don't exist
- Network connectivity issues

**Fixes**:

```javascript
// Check AdminDataContext.tsx error handling
try {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  // ...
} catch (error) {
  console.error('Error fetching users:', error);
  // Check this error message for specific issue
}
```

#### Real-time Updates Not Working

**Symptoms**: Data doesn't refresh automatically

**Solutions**:

```typescript
// Check if listeners are properly set up in AdminDataContext
useEffect(() => {
  const unsubscribe = setupUsersListener();
  return () => unsubscribe?.();
}, []);

// Manual refresh as backup
const handleRefresh = async () => {
  await refreshUsers();
  await refreshBlogPosts();
  await refreshAnalytics();
};
```

### 3. Firebase Emulator Issues

#### Emulators Won't Start

**Symptoms**: `firebase emulators:start` fails or hangs

**Common Causes & Solutions**:

**Port Conflicts**:

```bash
# Check what's using Firebase ports
lsof -i :9099  # Auth
lsof -i :8080  # Firestore
lsof -i :5001  # Functions
lsof -i :4000  # UI

# Kill conflicting processes
kill -9 [PID]
```

**Java Issues** (for Firestore emulator):

```bash
# Check Java installation
java -version

# Install Java if missing (macOS)
brew install openjdk@11
```

**Firebase CLI Issues**:

```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login to Firebase
firebase login --reauth
```

#### Emulator Data Persistence

**Symptoms**: Data disappears when emulators restart

**Solutions**:

```bash
# Start emulators with data export/import
firebase emulators:start --export-on-exit=./emulator-data --import=./emulator-data

# Export current data
firebase emulators:export ./emulator-backup
```

### 4. Build and Development Issues

#### TypeScript Compilation Errors

**Common Errors**:

```typescript
// Property 'customClaims' does not exist on type 'User'
// Fix: Add type assertion or proper typing
const hasAdminClaims = (user as any)?.customClaims?.admin === true;

// Property 'createdAt' does not exist on type 'BlogPost'
// Fix: Update BlogPost interface
interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt?: Timestamp; // Add optional timestamp
}
```

#### Development Server Issues

**Symptoms**: Hot reload not working, pages not loading

**Solutions**:

```bash
# Clear cache and restart
rm -rf node_modules/.cache
rm -rf dist
npm run dev

# Check for port conflicts
lsof -i :3000
```

### 5. Performance Issues

#### Slow Dashboard Loading

**Symptoms**: Dashboard takes long time to load data

**Optimization Steps**:

1. **Check Firestore Indexes**:

   ```bash
   # Review firestore.indexes.json
   # Add composite indexes for complex queries
   ```

2. **Optimize Data Fetching**:

   ```typescript
   // Batch multiple operations
   const [users, blogs, analytics] = await Promise.all([
     getDocs(collection(db, 'users')),
     getDocs(collection(db, 'blog')),
     getDocs(collection(db, 'analytics')),
   ]);
   ```

3. **Implement Caching**:

   ```typescript
   // Cache data in AdminDataContext
   const [cachedData, setCachedData] = useState(null);
   const [lastFetch, setLastFetch] = useState(0);

   if (Date.now() - lastFetch < 30000 && cachedData) {
     return cachedData; // Use cache if less than 30 seconds old
   }
   ```

#### Memory Leaks

**Symptoms**: Browser becomes slow, high memory usage

**Fixes**:

```typescript
// Properly cleanup listeners
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    // Handle updates
  });

  return () => unsubscribe(); // Critical: cleanup on unmount
}, []);
```

### 6. Deployment Issues

#### Firebase Deploy Failures

**Common Errors**:

**Firestore Rules Compilation Error**:

```bash
# Check rules syntax
firebase firestore:rules:get

# Test rules locally
firebase emulators:start --only firestore
```

**Functions Deployment Issues**:

```bash
# Check function logs
firebase functions:log

# Deploy specific function
firebase deploy --only functions:api
```

**Build Errors During Deploy**:

```bash
# Fix TypeScript errors first
npm run build

# Check for missing dependencies
npm audit --audit-level moderate
```

### 7. Browser-Specific Issues

#### Safari Issues

**Symptoms**: Authentication doesn't work in Safari

**Solutions**:

- Check Safari's privacy settings
- Disable "Prevent cross-site tracking"
- Clear Safari cache and cookies

#### Chrome CORS Issues

**Symptoms**: CORS errors in Chrome console

**Solutions**:

```bash
# Start Chrome with disabled security (development only)
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

### 8. Debug Tools and Commands

#### Useful Debug Commands

```bash
# Check Firebase project status
firebase projects:list

# Check current Firebase configuration
firebase use

# View Firestore data directly
firebase firestore:get users/user-id

# Check Firebase function logs
firebase functions:log --limit 50

# Test Firestore rules
firebase emulators:exec --only firestore "npm test"
```

#### Browser Console Debugging

```javascript
// Check Firebase auth state
firebase.auth().currentUser;

// Check Firestore connection
firebase.firestore().enableNetwork();

// Test Firestore queries
firebase.firestore().collection('users').get().then(console.log);
```

#### Network Debugging

```bash
# Check if Firebase services are reachable
ping firestore.googleapis.com
ping firebase.googleapis.com

# Check DNS resolution
nslookup firestore.googleapis.com
```

### 9. Emergency Recovery

#### Complete Reset Procedure

```bash
# 1. Stop all services
pkill -f firebase
pkill -f node

# 2. Clear all caches
rm -rf node_modules/.cache
rm -rf dist
rm -rf .firebase/emulators

# 3. Reinstall dependencies
npm install

# 4. Reset Firebase emulators
firebase emulators:start --import=./fresh-data

# 5. Repopulate data
node populate-firebase-data.mjs

# 6. Restart development server
npm run dev
```

#### Backup and Restore

```bash
# Create backup
firebase emulators:export ./backup-$(date +%Y%m%d)

# Restore from backup
firebase emulators:start --import=./backup-20250819
```

### 10. Getting Help

#### Log Collection for Support

```bash
# Collect all relevant logs
mkdir debug-logs
firebase emulators:start > debug-logs/firebase.log 2>&1 &
npm run dev > debug-logs/dev-server.log 2>&1 &

# Include in support request:
# - Browser console errors (screenshot)
# - Firebase emulator logs
# - Development server logs
# - Network tab from browser dev tools
```

#### Useful Resources

- **Firebase Console**: https://console.firebase.google.com
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Emulator UI**: http://localhost:4000 (when running)
- **Stack Overflow**: Tag with `firebase`, `firestore`, `react`
