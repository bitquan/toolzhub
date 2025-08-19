# GitHub Copilot Full Test & Fix Instructions

This guide provides comprehensive testing instructions for Copilot to verify every function, button, navigation flow, and user interaction in Toolz.space works as expected.

## Test Methodology

When performing a full test, follow this systematic approach:

1. **Environment Setup Verification**
2. **Authentication Flow Testing**
3. **Navigation & Routing Testing**
4. **QR Code Generation Testing**
5. **Subscription & Payment Testing**
6. **Settings & Profile Testing**
7. **API Endpoint Testing**
8. **Database Operations Testing**
9. **Error Handling Testing**
10. **Performance & Edge Case Testing**

## 1. Environment Setup Verification

### Prerequisites Check

```bash
# Verify all required services are running
firebase emulators:list
curl -s http://localhost:3000 | grep -o "<title>.*</title>"
curl -s http://localhost:5001/toolzhub-5014-31157/us-central1/api/health
```

### Expected Results

- Emulators: Auth (9099), Firestore (8080), Functions (5001), Storage (9199), UI (4000)
- Frontend: Vite dev server on port 3000 serving React app
- Functions: Health endpoint returns `{"status":"ok","timestamp":"..."}`

### Fix if Broken

- Check `.env` file has all required Firebase config vars
- Verify `functions/.runtimeconfig.json` exists with Stripe config
- Restart emulators: `firebase emulators:start --import=./emulator-data`

## 2. Authentication Flow Testing

### Test Cases to Execute

#### A. Registration Flow

1. **Navigate to Register Page**

   - Click "Get Started" or "Sign Up" button from homepage
   - Verify URL changes to `/register`
   - Verify page renders registration form

2. **Email/Password Registration**

   - Fill form: email, password, confirm password
   - Click "Create Account" button
   - Verify loading state shows
   - Verify redirect to `/dashboard` on success
   - Verify user document created in Firestore `users` collection

3. **Google OAuth Registration**
   - Click "Continue with Google" button
   - Verify OAuth popup opens (emulator will auto-succeed)
   - Verify redirect to `/dashboard`
   - Verify user document created with Google provider data

#### B. Login Flow

1. **Navigate to Login Page**

   - Click "Sign In" button from homepage
   - Verify URL changes to `/login`
   - Verify login form renders

2. **Email/Password Login**

   - Enter valid credentials
   - Click "Sign In" button
   - Verify redirect to `/dashboard`
   - Verify user session established

3. **Invalid Credentials**
   - Enter wrong password
   - Click "Sign In" button
   - Verify error message displays
   - Verify no redirect occurs

#### C. Logout Flow

1. **Logout from Dashboard**
   - Click user menu/avatar in header
   - Click "Logout" option
   - Verify redirect to homepage
   - Verify user session cleared

### Test Commands

```bash
# Check Auth emulator users
curl -s http://localhost:9099/emulator/v1/projects/toolzhub-5014-31157/accounts | jq '.users | length'

# Check Firestore user documents
curl -s "http://localhost:8080/v1/projects/toolzhub-5014-31157/databases/(default)/documents/users" | jq '.documents | length'
```

## 3. Navigation & Routing Testing

### Test All Route Transitions

#### A. Public Routes (Unauthenticated)

```javascript
// Test these navigation flows manually:
const publicRoutes = [
  { from: '/', to: '/pricing', trigger: 'Click "Pricing" in nav' },
  { from: '/', to: '/login', trigger: 'Click "Sign In" button' },
  { from: '/', to: '/register', trigger: 'Click "Get Started" button' },
  {
    from: '/pricing',
    to: '/register',
    trigger: 'Click "Get Started" on pricing card',
  },
  { from: '/login', to: '/register', trigger: 'Click "Sign up" link' },
  { from: '/register', to: '/login', trigger: 'Click "Sign in" link' },
];
```

#### B. Protected Routes (Authenticated)

```javascript
// Test these after logging in:
const protectedRoutes = [
  {
    from: '/dashboard',
    to: '/qr-generator',
    trigger: 'Click "Generate QR" button',
  },
  { from: '/dashboard', to: '/settings', trigger: 'Click "Settings" in nav' },
  {
    from: '/qr-generator',
    to: '/dashboard',
    trigger: 'Click "Dashboard" in nav',
  },
  { from: '/settings', to: '/pricing', trigger: 'Click "Upgrade Plan" button' },
  { from: any_protected_route, to: '/', trigger: 'Click "Logout"' },
];
```

#### C. Route Guards Testing

1. **Access Protected Route Without Auth**

   - Navigate directly to `/dashboard` in incognito window
   - Verify redirect to `/login`
   - Verify URL preserves intended destination

2. **Access Auth Pages When Logged In**
   - Navigate to `/login` while authenticated
   - Verify redirect to `/dashboard`

### Test Commands

```bash
# Test route accessibility
curl -s http://localhost:3000/dashboard | grep -o "redirecting\|login\|dashboard"
curl -s http://localhost:3000/pricing | grep -o "<title>.*</title>"
```

## 4. QR Code Generation Testing

### Test All QR Code Functions

#### A. Basic QR Generation

1. **Navigate to QR Generator**

   - From dashboard, click "Generate New QR Code"
   - Verify `/qr-generator` page loads
   - Verify form renders with all input fields

2. **URL QR Code Generation**

   - Select "URL" type from dropdown
   - Enter test URL: `https://example.com`
   - Click "Generate QR Code" button
   - Verify QR code image appears
   - Verify preview shows correctly

3. **Text QR Code Generation**

   - Select "Text" type
   - Enter test text: "Hello World"
   - Click "Generate QR Code"
   - Verify QR code generates
   - Verify text content is encoded

4. **Contact/WiFi/Other Types**
   - Test each QR type dropdown option
   - Fill required fields for each type
   - Verify generation works for all types
   - Verify validation shows for empty required fields

#### B. QR Code Actions Testing

1. **Download QR Code**

   - Generate a QR code
   - Click "Download PNG" button
   - Verify file downloads with correct name
   - Click "Download SVG" button (if available)
   - Verify SVG downloads

2. **Copy to Clipboard**

   - Click "Copy to Clipboard" button
   - Verify success toast notification
   - Verify clipboard contains image data

3. **Share QR Code**
   - Click "Share" button
   - Verify share dialog/options appear
   - Test share functionality

#### C. QR Code Settings

1. **Customization Options**

   - Change QR code size slider
   - Verify QR code resizes in real-time
   - Change colors (if available)
   - Verify color changes apply
   - Test error correction levels

2. **Save QR Code**
   - Click "Save to My QR Codes"
   - Verify QR saves to user's collection
   - Verify appears in dashboard QR list

### Test Commands

```bash
# Check QR codes saved to Firestore
curl -s "http://localhost:8080/v1/projects/toolzhub-5014-31157/databases/(default)/documents/qrcodes" | jq '.documents | length'

# Test QR service directly
node -e "
const qr = require('./src/services/qrcode.ts');
console.log(qr.generateQRData('url', {url: 'https://test.com'}));
"
```

## 5. Subscription & Payment Testing

### Test Stripe Integration

#### A. Pricing Page Navigation

1. **View Pricing Plans**

   - Navigate to `/pricing`
   - Verify all plan cards render
   - Verify feature lists display
   - Verify pricing amounts show correctly

2. **Plan Selection**
   - Click "Upgrade to Pro" button
   - Verify Stripe checkout initiates
   - Verify correct price ID passed to checkout

#### B. Checkout Flow (Test Mode)

1. **Stripe Checkout Session**

   - Use test card: `4242 4242 4242 4242`
   - Complete checkout form
   - Verify success redirect to `/dashboard?session_id=...`
   - Verify success message displays

2. **Subscription Activation**
   - Check user document updated with subscription
   - Verify plan status shows "Pro" in UI
   - Verify usage limits updated

#### C. Webhook Testing

1. **Test Webhook Endpoints**

   ```bash
   # Test webhook handler directly
   curl -X POST http://localhost:5001/toolzhub-5014-31157/us-central1/api/stripe/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"checkout.session.completed","data":{"object":{"id":"test_session"}}}'
   ```

2. **Test Stripe CLI Forwarding**
   ```bash
   # Forward webhooks to local emulator
   stripe listen --forward-to http://localhost:5001/toolzhub-5014-31157/us-central1/api/stripe/webhook
   ```

### Test Commands

```bash
# Check subscription status in Firestore
curl -s "http://localhost:8080/v1/projects/toolzhub-5014-31157/databases/(default)/documents/users" | jq '.documents[].fields.subscription'
```

## 6. Settings & Profile Testing

### Test User Settings Page

#### A. Profile Settings

1. **Update Display Name**

   - Navigate to `/settings`
   - Change display name field
   - Click "Save Changes"
   - Verify success toast
   - Verify name updates in header/nav

2. **Update Email**
   - Change email field
   - Click "Save Changes"
   - Verify email verification required
   - Test email verification flow

#### B. Usage Stats Display

1. **View Current Usage**

   - Verify QR codes created this month displays
   - Verify plan limits show correctly
   - Check usage progress bars

2. **Usage Limit Testing**
   - Create QR codes up to free plan limit
   - Verify limit warning appears
   - Verify upgrade prompt shows

#### C. Account Management

1. **Delete Account**
   - Click "Delete Account" button
   - Verify confirmation dialog
   - Test account deletion flow
   - Verify user data cleanup

### Test Commands

```bash
# Check user profile updates
curl -s "http://localhost:8080/v1/projects/toolzhub-5014-31157/databases/(default)/documents/users/USER_ID" | jq '.fields'
```

## 7. API Endpoint Testing

### Test All Function Endpoints

#### A. Health Check

```bash
curl -s http://localhost:5001/toolzhub-5014-31157/us-central1/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### B. Stripe Endpoints

```bash
# Test create checkout session
curl -X POST http://localhost:5001/toolzhub-5014-31157/us-central1/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test","userId":"test_user"}'

# Test webhook (with test payload)
curl -X POST http://localhost:5001/toolzhub-5014-31157/us-central1/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{"type":"test"}'
```

#### C. Callable Functions

```bash
# Test QR scan tracking
firebase functions:shell
> trackQRScan({qrCodeId: "test", metadata: {source: "test"}})
```

## 8. Database Operations Testing

### Test Firestore Rules & Operations

#### A. User Document Operations

```javascript
// Test in browser console on authenticated page:
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './src/services/firebase';

// Should succeed for own user
await updateDoc(doc(db, 'users', currentUser.uid), { displayName: 'Test' });

// Should fail for other user
await updateDoc(doc(db, 'users', 'other_user_id'), { displayName: 'Hack' });
```

#### B. QR Code Collection Rules

```javascript
// Test QR code access rules
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Should succeed - create own QR
await addDoc(collection(db, 'qrcodes'), {
  userId: currentUser.uid,
  type: 'url',
  data: { url: 'https://test.com' },
});

// Should only return own QR codes
const q = query(
  collection(db, 'qrcodes'),
  where('userId', '==', currentUser.uid)
);
const snapshot = await getDocs(q);
```

### Test Commands

```bash
# Import test data to emulator
firebase emulators:export ./test-data --force

# Check rules coverage
firebase emulators:exec --ui "npm run test:rules"
```

## 9. Error Handling Testing

### Test Error Scenarios

#### A. Network Errors

1. **Offline Mode**

   - Disconnect network
   - Try to generate QR code
   - Verify offline message displays
   - Verify graceful degradation

2. **Function Timeout**
   - Test with slow network
   - Verify loading states
   - Verify timeout error handling

#### B. Validation Errors

1. **Form Validation**

   - Submit empty forms
   - Enter invalid email formats
   - Test password requirements
   - Verify error messages display

2. **File Upload Limits**
   - Upload oversized images (if applicable)
   - Test unsupported file types
   - Verify error handling

#### C. Auth Errors

1. **Session Expiry**

   - Manually expire auth token
   - Try protected action
   - Verify redirect to login

2. **Permission Errors**
   - Try to access other user's data
   - Verify 403 errors handled gracefully

## 10. Performance & Edge Case Testing

### Performance Tests

#### A. Load Testing

```bash
# Test with multiple concurrent users
for i in {1..10}; do
  curl -s http://localhost:3000/api/health &
done
wait
```

#### B. Large Data Sets

1. **Many QR Codes**

   - Create 100+ QR codes
   - Test dashboard pagination
   - Verify performance remains good

2. **Large QR Data**
   - Create QR with maximum data size
   - Test generation performance
   - Verify memory usage

### Edge Cases

#### A. Browser Compatibility

1. **Different Browsers**

   - Test in Chrome, Firefox, Safari
   - Verify consistent behavior
   - Test mobile browsers

2. **JavaScript Disabled**
   - Test with JS disabled
   - Verify graceful degradation

#### B. Data Edge Cases

1. **Special Characters**

   - Test QR with emoji, unicode
   - Test XSS prevention
   - Test SQL injection (if applicable)

2. **Boundary Values**
   - Test minimum/maximum input lengths
   - Test edge cases for numeric inputs

## Comprehensive Test Checklist

### Pre-Test Setup

- [ ] All emulators running
- [ ] Frontend dev server started
- [ ] Test data imported
- [ ] Stripe test mode configured

### Authentication

- [ ] Email registration works
- [ ] Google OAuth works
- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Auth routes redirect when logged in

### Navigation

- [ ] All nav links work
- [ ] Route transitions smooth
- [ ] Back/forward browser buttons work
- [ ] Direct URL access works
- [ ] 404 pages render correctly

### QR Code Functionality

- [ ] All QR types generate correctly
- [ ] Download PNG works
- [ ] Download SVG works (if available)
- [ ] Copy to clipboard works
- [ ] Share functionality works
- [ ] QR customization works
- [ ] Save to collection works
- [ ] QR scanning tracking works

### Subscription & Payments

- [ ] Pricing page displays correctly
- [ ] Checkout session creates
- [ ] Test payment succeeds
- [ ] Subscription status updates
- [ ] Usage limits enforced
- [ ] Webhooks process correctly

### Settings & Profile

- [ ] Profile updates save
- [ ] Usage stats display correctly
- [ ] Account deletion works
- [ ] Settings persist across sessions

### API & Database

- [ ] All endpoints respond
- [ ] Database rules enforced
- [ ] Error responses correct
- [ ] Performance acceptable

### Error Handling

- [ ] Network errors handled
- [ ] Validation errors shown
- [ ] Auth errors redirect properly
- [ ] 500 errors display user-friendly messages

### Performance

- [ ] Page load times < 3s
- [ ] QR generation < 2s
- [ ] No memory leaks
- [ ] Mobile performance good

## Fix Strategy When Tests Fail

1. **Identify Root Cause**

   - Check browser console for errors
   - Check Functions logs
   - Check Firestore emulator logs
   - Check network requests in DevTools

2. **Common Fixes**

   - Restart emulators: `firebase emulators:start`
   - Clear cache: Hard refresh (Cmd+Shift+R)
   - Reset emulator data: `firebase emulators:start --import=./clean-data`
   - Check Firebase config in `.env`

3. **Debug Process**

   - Test individual components in isolation
   - Use React DevTools to inspect state
   - Add console.log for debugging
   - Test API endpoints directly with curl

4. **Regression Prevention**
   - Add automated tests for fixed issues
   - Update this test guide with new scenarios
   - Document known issues and workarounds

## Automation Opportunities

Consider automating these tests with:

- **Playwright** for end-to-end browser testing
- **Jest** for unit tests
- **Firebase emulator test runners**
- **GitHub Actions** for CI/CD testing

This ensures every feature works correctly before deployment and provides confidence in the application's reliability.

1. Test all routes in App.tsx (/, /login, /register, /dashboard, /pricing, /qr-generator, /settings)
2. Validate AuthContext provider and protected routes
3. Test component imports and TypeScript types
4. Check Tailwind CSS classes and responsive design
5. Validate form handling in Login, Register, and QRGenerator
6. Test React Hook Form integration and validation
7. Verify Lucide React icons and react-hot-toast notifications
8. Check Vite build process and asset optimization

Build the app, start dev server, and test each route. Document any TypeScript errors, missing imports, or UI issues. Provide specific fixes for each problem found.

```

### 3. Backend Functions Comprehensive Testing

**Prompt:**
```

Test all Cloud Functions thoroughly:

1. API Function (Express app):

   - Test /health endpoint (GET)
   - Test /stripe/webhook endpoint (POST with mock data)
   - Test /stripe/create-checkout-session (POST with valid payload)
   - Verify CORS configuration
   - Test error handling and status codes

2. Callable Function (trackQRScan):

   - Test with valid QR code ID and metadata
   - Test with missing parameters
   - Verify Firestore writes to analytics collection
   - Test authentication requirements

3. Scheduled Function (resetMonthlyUsage):

   - Test the cron schedule syntax
   - Verify batch operations on users collection
   - Test error handling for large datasets

4. Integration Testing:
   - Test Functions with emulators
   - Test deployed Functions in Firebase
   - Verify environment variable access
   - Test Stripe SDK integration

For each test, provide the exact curl commands or test scripts. Document response times, error rates, and any issues found.

```

### 4. Firebase Services Testing

**Prompt:**
```

Test all Firebase services integration:

1. Authentication:

   - Test email/password signup and login
   - Test Google OAuth flow
   - Test password reset functionality
   - Verify user document creation in Firestore
   - Test protected route enforcement

2. Firestore:

   - Test security rules for users, qrcodes, analytics collections
   - Test CRUD operations with proper authentication
   - Verify indexes for complex queries
   - Test real-time listeners and subscriptions
   - Test batch operations and transactions

3. Storage:

   - Test file upload permissions
   - Test QR code image storage
   - Verify security rules for user-specific folders
   - Test file deletion and cleanup

4. Hosting:
   - Test SPA routing and rewrites
   - Test /api/\*\* rewrite to Cloud Functions
   - Verify custom domain configuration
   - Test caching headers and performance

Provide test scripts using Firebase emulators and production environment. Document any security rule violations or performance issues.

```

### 5. Stripe Integration Testing

**Prompt:**
```

Comprehensively test Stripe integration:

1. Checkout Flow:

   - Test createCheckoutSession function with different price IDs
   - Verify customer creation and Firestore updates
   - Test successful payment completion webhook
   - Test payment failure scenarios

2. Subscription Management:

   - Test subscription creation, updates, and cancellation
   - Verify webhook event handling for all subscription states
   - Test usage limit enforcement based on subscription tiers
   - Test proration and billing cycle changes

3. Webhook Security:

   - Test webhook signature verification
   - Test webhook endpoint with invalid signatures
   - Verify idempotency for duplicate webhook events
   - Test webhook retry scenarios

4. Error Handling:
   - Test expired payment methods
   - Test insufficient funds scenarios
   - Test network failures and timeouts
   - Verify error logging and user notifications

Use Stripe CLI for webhook testing and provide test card numbers for different scenarios. Document all test results and edge cases.

```

### 6. QR Code Generation Testing

**Prompt:**
```

Test QR code generation service comprehensively:

1. QR Data Generation:

   - Test URL, text, email, phone, SMS, WiFi, vCard QR types
   - Verify input validation for each QR type
   - Test special characters and encoding
   - Test maximum data length limits

2. QR Code Rendering:

   - Test PNG generation with different sizes and quality
   - Test SVG generation and scalability
   - Verify color customization options
   - Test logo embedding and positioning

3. Export Functionality:

   - Test PDF generation with multiple QR codes
   - Test batch generation and ZIP downloads
   - Verify file naming conventions
   - Test download performance with large datasets

4. Integration Testing:
   - Test QR generation with user authentication
   - Verify usage tracking and limits
   - Test QR scan analytics recording
   - Test QR code management (edit, delete, archive)

Provide test cases for each QR type with sample data. Test both success and failure scenarios.

```

### 7. Authentication Flow Testing

**Prompt:**
```

Test complete authentication system:

1. Registration Flow:

   - Test email/password registration
   - Test Google OAuth registration
   - Verify email verification process
   - Test duplicate email handling

2. Login Flow:

   - Test valid credentials login
   - Test invalid credentials handling
   - Test rate limiting and security measures
   - Test remember me functionality

3. Session Management:

   - Test token refresh and expiration
   - Test logout functionality
   - Test concurrent session handling
   - Test cross-device authentication

4. Password Management:

   - Test password reset flow
   - Test password strength validation
   - Test password change functionality
   - Test account recovery options

5. Profile Management:
   - Test profile updates and validation
   - Test subscription status synchronization
   - Test usage statistics tracking
   - Test account deletion process

Create test users and document the complete user journey from registration to account management.

```

### 8. Performance & Security Testing

**Prompt:**
```

Conduct performance and security testing:

1. Performance Testing:

   - Test page load times and Core Web Vitals
   - Test API response times under load
   - Test database query performance
   - Test image optimization and caching
   - Test CDN performance for global users

2. Security Testing:

   - Test XSS and CSRF protection
   - Test API rate limiting and DDoS protection
   - Test input sanitization and validation
   - Test Firebase security rules thoroughly
   - Test sensitive data exposure

3. Scalability Testing:

   - Test concurrent user handling
   - Test large dataset operations
   - Test storage capacity limits
   - Test bandwidth usage optimization

4. Error Handling:
   - Test graceful degradation scenarios
   - Test offline functionality
   - Test error boundary implementation
   - Test user error reporting

Use appropriate testing tools and provide performance benchmarks. Document any security vulnerabilities found.

```

### 9. Deployment & Production Testing

**Prompt:**
```

Test deployment process and production environment:

1. Build Process:

   - Test Vite build optimization
   - Test TypeScript compilation
   - Test asset bundling and compression
   - Test environment variable injection

2. Firebase Deployment:

   - Test hosting deployment and rollback
   - Test Functions deployment and versioning
   - Test security rules deployment
   - Test database migration scripts

3. Production Environment:

   - Test custom domain and SSL configuration
   - Test CDN and caching behavior
   - Test monitoring and logging
   - Test backup and disaster recovery

4. CI/CD Pipeline:
   - Test automated testing in pipeline
   - Test deployment automation
   - Test environment promotion
   - Test rollback procedures

Verify the complete deployment process from local development to production. Document any deployment issues or optimization opportunities.

```

### 10. End-to-End User Journey Testing

**Prompt:**
```

Test complete user journeys from start to finish:

1. Free User Journey:

   - Register → Login → Generate 3 QR codes → Hit limit → View pricing
   - Test QR scanning and analytics
   - Test profile management

2. Pro User Journey:

   - Register → Upgrade to Pro → Generate unlimited QR codes → Export PDFs
   - Test advanced features and bulk operations
   - Test subscription management

3. Admin/Support Journey:

   - Access user analytics and usage data
   - Test customer support tools
   - Test system monitoring and alerts

4. Error Recovery Journey:
   - Test payment failure recovery
   - Test account lockout and recovery
   - Test data loss prevention

Document the complete user experience, noting any friction points or improvement opportunities.

````

## Test Execution Guidelines

### Before Testing
1. Ensure clean environment (clear browser cache, reset emulators)
2. Use test data and sandbox environments
3. Document baseline performance metrics
4. Prepare test user accounts

### During Testing
1. Execute tests systematically following the order above
2. Document all findings in real-time
3. Take screenshots of UI issues
4. Save error logs and stack traces
5. Note performance metrics and timings

### After Testing
1. Compile comprehensive test report
2. Prioritize issues by severity and impact
3. Create GitHub issues for tracked bugs
4. Update documentation based on findings
5. Plan fix implementation roadmap

## Fix Implementation Process

For each issue found:

1. **Immediate Fixes**: Critical bugs affecting core functionality
2. **Performance Optimizations**: Improvements for user experience
3. **Security Enhancements**: Address any vulnerabilities found
4. **Documentation Updates**: Keep docs in sync with fixes
5. **Test Validation**: Re-run tests after implementing fixes

## Reporting Template

```markdown
# Toolz.space Test Report - [Date]

## Executive Summary
- Total tests executed: X
- Pass rate: X%
- Critical issues: X
- Performance issues: X
- Security issues: X

## Detailed Findings
[For each component tested, include:]
- Component: [Name]
- Tests passed: X/Y
- Issues found: [List with severity]
- Recommendations: [Priority fixes]

## Fix Implementation Plan
1. [Issue 1] - Priority: High - ETA: [Date]
2. [Issue 2] - Priority: Medium - ETA: [Date]
...

## Next Steps
[Action items and follow-up testing required]
````

Use these instructions with GitHub Copilot to ensure comprehensive testing and systematic fixing of your entire application.
