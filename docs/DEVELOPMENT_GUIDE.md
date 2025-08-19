# ToolzHub Development Guide

## 🎯 Quick Start (5 Minutes)

### Prerequisites Check

```bash
node --version    # Should be 18+
npm --version     # Should be 8+
firebase --version # Should be latest
```

### Instant Setup

```bash
# 1. Clone and install
git clone https://github.com/bitquan/toolzhub.git
cd toolzhub && npm install
cd functions && npm install && cd ..

# 2. Firebase setup
firebase login
firebase use --add  # Select your project

# 3. Environment configuration
cp .env.example .env
# Edit .env with your Firebase and Stripe keys

# 4. Start development
npm run dev  # http://localhost:3001
```

## 🛠️ Development Workflow

### Daily Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Project Structure Navigation

```
src/
├── 🎨 pages/
│   ├── QRGenerator.tsx      # Main QR generation interface
│   ├── Dashboard.tsx        # User dashboard with stats
│   ├── AdminDashboard.tsx   # Admin analytics
│   ├── Pricing.tsx          # Subscription plans
│   └── Settings.tsx         # Account management
├── 🔧 services/
│   ├── qrcode.ts           # QR generation logic
│   ├── subscription.ts     # Stripe integration
│   └── analytics.ts        # User tracking
├── 🌐 contexts/
│   ├── AuthContext.tsx     # Authentication state
│   ├── UserDataContext.tsx # User data management
│   └── AdminDataContext.tsx # Admin analytics
└── 🎯 components/
    ├── Auth/               # Login/signup forms
    ├── Common/             # Shared UI components
    └── Admin/              # Admin dashboard components
```

## 📋 Current Feature Status

### ✅ Completed Features (Ready for Production)

#### QR Generator (100% Complete)

- **Location**: `src/pages/QRGenerator.tsx`
- **Features**: 9 QR types, Free vs Pro restrictions, content forms
- **Test**: Visit `/generate` - all QR types should work properly

#### Subscription System (100% Complete)

- **Location**: `src/services/subscription.ts`
- **Features**: Stripe integration, upgrade flows, usage limits
- **Test**: Click any "Upgrade to Pro" button - should redirect to Stripe

#### Admin Dashboard (100% Complete)

- **Location**: `src/pages/AdminDashboard.tsx`
- **Features**: Real-time analytics, user management, metrics
- **Test**: Visit `/admin?dev=true` - should show live data

#### Authentication (100% Complete)

- **Location**: `src/contexts/AuthContext.tsx`
- **Features**: Email/Google OAuth, protected routes
- **Test**: Login/logout flows should work seamlessly

### 🎨 User Interface Status

| Page                | Status      | Key Features                                      |
| ------------------- | ----------- | ------------------------------------------------- |
| **QR Generator**    | ✅ Complete | All 9 QR types, Pro restrictions, upgrade prompts |
| **Dashboard**       | ✅ Complete | Usage stats, 2 upgrade buttons, quick QR access   |
| **Admin Dashboard** | ✅ Complete | Real-time metrics, user management, analytics     |
| **Pricing**         | ✅ Complete | Plan comparison, functional upgrade button        |
| **Settings**        | ✅ Complete | Account management, subscription status           |

## 🔧 Key Development Areas

### QR Generator Development

```typescript
// Main component: src/pages/QRGenerator.tsx
// Key functions:
-renderDataInputs() - // Dynamic form rendering
  generateQRCode() - // QR creation with restrictions
  handleTypeSelection() - // Pro access control
  handleUpgradeClick(); // Stripe integration
```

### Subscription Management

```typescript
// Service: src/services/subscription.ts
// Key functions:
-upgradeToProWithRedirect() - // Stripe checkout flow
  checkSubscriptionStatus() - // Real-time status check
  enforceUsageLimits(); // Free tier restrictions
```

### Admin Analytics

```typescript
// Component: src/pages/AdminDashboard.tsx
// Key features:
- Real-time Firestore data
- User and subscription metrics
- QR generation analytics
- Revenue tracking (MRR)
```

## 🧪 Testing Strategy

### Manual Testing Checklist

```bash
# QR Generator Testing
□ All 9 QR types generate valid codes
□ Free users limited to 3 basic types
□ Pro restrictions show upgrade prompts
□ Usage limits enforced (5/month for Free)
□ All form validations work properly

# Subscription Testing
□ Upgrade buttons redirect to Stripe
□ Subscription status updates in real-time
□ Free vs Pro features properly gated
□ Usage counters accurate

# Admin Dashboard Testing
□ Real-time data updates correctly
□ All metrics display accurate information
□ Admin authentication works
□ Mobile responsive design functions
```

### Automated Testing

```bash
# Run test suite
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 🚀 Deployment Process

### Pre-Deployment Checklist

```bash
# 1. Code quality checks
npm run lint
npm run type-check
npm run test

# 2. Build verification
npm run build

# 3. Environment verification
# Ensure all environment variables are set
# Verify Firebase project configuration
# Check Stripe webhook endpoints

# 4. Deploy
firebase deploy
```

### Post-Deployment Testing

```bash
# Test production URLs
curl https://your-domain.com/
curl https://your-domain.com/generate
curl https://your-domain.com/admin

# Verify Stripe webhooks
# Check Firebase Functions logs
firebase functions:log

# Monitor real-time database
# Check Firestore data integrity
```

## 🔍 Debugging Guide

### Common Issues & Solutions

#### QR Generator Issues

```bash
# Problem: QR types not rendering
# Solution: Check QRCodeService import and QR_TYPES array

# Problem: Pro restrictions not working
# Solution: Verify useAuth and isPro logic

# Problem: Upgrade flow broken
# Solution: Check subscriptionService.upgradeToProWithRedirect()
```

#### Subscription Issues

```bash
# Problem: Stripe checkout not working
# Solution: Verify STRIPE_PUBLISHABLE_KEY in .env

# Problem: Subscription status not updating
# Solution: Check Firebase Functions and webhook configuration

# Problem: Usage limits not enforcing
# Solution: Verify UserDataContext and usage calculations
```

#### Admin Dashboard Issues

```bash
# Problem: No data showing
# Solution: Check Firestore security rules and admin permissions

# Problem: Real-time updates not working
# Solution: Verify Firebase listeners and AdminDataContext

# Problem: Authentication failing
# Solution: Check admin role in user custom claims
```

### Development Environment Setup

```bash
# Reset environment
rm -rf node_modules package-lock.json
npm install

# Clear Firebase cache
firebase use --clear
firebase use --add

# Reset local environment
rm .env
cp .env.example .env
# Re-configure environment variables
```

## 📚 Documentation Links

### Quick Reference

- **[QR Generator Docs](./docs/04-user-features/qr-generator/)** - Complete QR implementation
- **[Subscription Docs](./docs/04-user-features/subscription-management/)** - Stripe integration
- **[Admin Dashboard Docs](./docs/05-admin-features/admin-dashboard/)** - Analytics system
- **[Technical Docs](./docs/)** - Architecture and implementation

### API References

- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **Stripe**: [Stripe API Reference](https://stripe.com/docs/api)
- **React**: [React Documentation](https://reactjs.org/docs)

## 🎯 Next Development Steps

### Immediate Tasks (This Week)

1. **Performance Optimization**

   - Optimize QR generation performance
   - Implement lazy loading for components
   - Add caching for admin dashboard data

2. **User Experience Improvements**

   - Add loading states for QR generation
   - Implement success/error animations
   - Enhance mobile responsiveness

3. **Analytics Enhancement**
   - Add QR scan tracking capabilities
   - Implement user behavior analytics
   - Create conversion funnel tracking

### Medium-Term Goals (Next Month)

1. **Advanced Features**

   - Bulk QR generation for Pro users
   - QR code templates and presets
   - Advanced customization options

2. **Platform Expansion**
   - API development for Pro subscribers
   - Webhook notification system
   - Mobile app development planning

---

_Last Updated: August 19, 2025_
_Version: 2.0 - Complete Development Guide_
