# Free vs Pro Features Documentation

## Feature Comparison Overview

### Plan Tiers

The user dashboard supports two distinct plan types with clear feature differentiation and upgrade paths.

## 1. Plan Detection and Management

### Plan Status Detection

```typescript
// In Dashboard component
const { user } = useAuth();
const isPro = user?.subscription?.plan === 'pro';
const isActive = user?.subscription?.status === 'active';
const subscriptionId = user?.subscription?.subscriptionId;

// Plan display logic
const planConfig = {
  free: {
    name: 'Free Plan',
    icon: QrCode,
    iconColor: 'text-yellow-600',
    bgColor: 'border-yellow-200 bg-yellow-50',
    monthlyLimit: 5,
    features: ['Basic QR codes', 'PNG downloads', 'Standard resolution'],
  },
  pro: {
    name: 'Pro Plan',
    icon: Crown,
    iconColor: 'text-primary-600',
    bgColor: 'border-primary-200 bg-primary-50',
    monthlyLimit: Infinity,
    features: [
      'Unlimited QR codes',
      'All formats',
      'Advanced customization',
      'Analytics',
    ],
  },
};
```

## 2. Feature Access Control

### QR Code Creation Limits

```typescript
// Free plan restrictions
const FREE_PLAN_LIMITS = {
  qrCodesPerMonth: 5,
  allowedTypes: ['url', 'text', 'wifi', 'contact'],
  maxSize: 800, // pixels
  formats: ['png'],
  customization: {
    colors: true,
    logo: false,
    advancedOptions: false,
  },
};

// Pro plan benefits
const PRO_PLAN_FEATURES = {
  qrCodesPerMonth: Infinity,
  allowedTypes: 'all', // All QR code types
  maxSize: 2000, // pixels
  formats: ['png', 'svg', 'pdf'],
  customization: {
    colors: true,
    logo: true,
    advancedOptions: true,
  },
  analytics: true,
  shortUrls: true,
  whiteLabel: true,
};
```

### Usage Validation

```typescript
const canCreateQRCode = (user: User): { allowed: boolean; reason?: string } => {
  const isPro = user?.subscription?.plan === 'pro';
  const currentUsage = user?.usageStats?.qrCodesThisMonth || 0;
  const monthlyLimit = isPro ? Infinity : 5;

  if (!isPro && currentUsage >= monthlyLimit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${monthlyLimit} QR codes. Upgrade to Pro for unlimited codes.`,
    };
  }

  return { allowed: true };
};
```

## 3. UI Feature Gating

### Conditional Feature Display

```typescript
// Feature gating components
const FeatureGate: React.FC<{
  feature: string;
  isPro: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ feature, isPro, children, fallback }) => {
  const proFeatures = [
    'analytics',
    'logo-upload',
    'svg-export',
    'pdf-export',
    'short-urls',
  ];

  if (proFeatures.includes(feature) && !isPro) {
    return fallback || <UpgradePrompt feature={feature} />;
  }

  return <>{children}</>;
};

// Usage in dashboard
<FeatureGate feature="analytics" isPro={isPro}>
  <AnalyticsSection />
</FeatureGate>;
```

### Upgrade Prompts

```typescript
const UpgradePrompt: React.FC<{ feature: string }> = ({ feature }) => (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
    <Crown className="h-8 w-8 text-gray-400 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-gray-900 mb-1">
      {feature} is a Pro Feature
    </h3>
    <p className="text-xs text-gray-600 mb-3">
      Upgrade to access {feature} and unlock all premium features
    </p>
    <button
      onClick={() => navigate('/pricing')}
      className="btn-primary text-xs px-4 py-2"
    >
      Upgrade to Pro
    </button>
  </div>
);
```

## 4. Dashboard Feature Differences

### Free Plan Dashboard Features

```typescript
const freePlanFeatures = {
  // Visible features
  qrCodeCreation: {
    available: true,
    limit: 5,
    types: ['url', 'text', 'wifi', 'contact', 'email', 'phone', 'sms'],
    customization: {
      colors: true,
      size: 'up to 800px',
      errorCorrection: true,
      logo: false, // Disabled
    },
    formats: ['png'],
  },

  // Dashboard sections
  dashboard: {
    usageTracking: true,
    basicStats: true,
    recentQRCodes: true,
    scanCount: 'basic', // Total scans only
    analytics: false, // Disabled
  },

  // Support
  support: 'community',
};
```

### Pro Plan Dashboard Features

```typescript
const proPlanFeatures = {
  // Enhanced features
  qrCodeCreation: {
    available: true,
    limit: 'unlimited',
    types: 'all',
    customization: {
      colors: true,
      size: 'up to 2000px',
      errorCorrection: true,
      logo: true, // Enabled
      advancedBranding: true,
    },
    formats: ['png', 'svg', 'pdf'],
  },

  // Enhanced dashboard
  dashboard: {
    usageTracking: false, // No limits to track
    advancedStats: true,
    recentQRCodes: true,
    scanCount: 'detailed', // Detailed analytics
    analytics: true, // Full analytics suite
    exportData: true,
    apiAccess: true,
  },

  // Premium support
  support: 'priority',
};
```

## 5. Usage Progress Tracking

### Free Plan Usage Display

```typescript
const UsageProgressBar: React.FC<{
  current: number;
  limit: number;
  label: string;
}> = ({ current, limit, label }) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">{label}</span>
        <span
          className={`font-medium ${
            isAtLimit
              ? 'text-red-600'
              : isNearLimit
              ? 'text-yellow-600'
              : 'text-gray-900'
          }`}
        >
          {current}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1">
          Monthly limit reached. Upgrade to Pro for unlimited QR codes.
        </p>
      )}
    </div>
  );
};
```

## 6. Analytics Access Control

### Free Plan Analytics (Limited)

```typescript
const FreeAnalytics: React.FC<{ qrCodes: QRCode[] }> = ({ qrCodes }) => {
  const totalScans = qrCodes.reduce(
    (sum, qr) => sum + (qr.analytics?.totalScans || 0),
    0
  );
  const avgScansPerCode =
    qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4">
        <h4 className="text-sm font-medium text-gray-600">Total Scans</h4>
        <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
      </div>
      <div className="card p-4">
        <h4 className="text-sm font-medium text-gray-600">Avg. Scans/Code</h4>
        <p className="text-2xl font-bold text-gray-900">{avgScansPerCode}</p>
      </div>
    </div>
  );
};
```

### Pro Plan Analytics (Full)

```typescript
const ProAnalytics: React.FC<{ qrCodes: QRCode[] }> = ({ qrCodes }) => {
  return (
    <div className="space-y-6">
      {/* Basic stats */}
      <FreeAnalytics qrCodes={qrCodes} />

      {/* Advanced analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScanTrendsChart qrCodes={qrCodes} />
        <TopPerformingCodes qrCodes={qrCodes} />
        <GeographicInsights qrCodes={qrCodes} />
        <DeviceBreakdown qrCodes={qrCodes} />
      </div>

      {/* Export options */}
      <div className="card p-4">
        <h4 className="font-medium text-gray-900 mb-2">Export Analytics</h4>
        <div className="flex space-x-2">
          <button className="btn-secondary text-xs">Export CSV</button>
          <button className="btn-secondary text-xs">Export PDF</button>
        </div>
      </div>
    </div>
  );
};
```

## 7. Customization Feature Restrictions

### QR Code Customization Access

```typescript
const CustomizationPanel: React.FC<{
  isPro: boolean;
  onCustomizationChange: (config: CustomizationConfig) => void;
}> = ({ isPro, onCustomizationChange }) => {
  return (
    <div className="space-y-4">
      {/* Basic customization (available to all) */}
      <ColorPicker
        label="Foreground Color"
        onChange={(color) => onCustomizationChange({ foregroundColor: color })}
      />
      <ColorPicker
        label="Background Color"
        onChange={(color) => onCustomizationChange({ backgroundColor: color })}
      />

      {/* Pro-only features */}
      <FeatureGate feature="logo-upload" isPro={isPro}>
        <LogoUploader onChange={(logo) => onCustomizationChange({ logo })} />
      </FeatureGate>

      <FeatureGate feature="advanced-sizing" isPro={isPro}>
        <SizeSelector
          maxSize={isPro ? 2000 : 800}
          onChange={(size) => onCustomizationChange({ size })}
        />
      </FeatureGate>
    </div>
  );
};
```

## 8. Upgrade Call-to-Actions

### Strategic Upgrade Prompts

```typescript
const UpgradeCTA: React.FC<{
  context: 'usage-limit' | 'feature-gate' | 'dashboard-banner';
  currentUsage?: number;
  limit?: number;
}> = ({ context, currentUsage, limit }) => {
  const messages = {
    'usage-limit': {
      title: 'Monthly Limit Reached',
      description: `You've used ${currentUsage}/${limit} QR codes this month.`,
      cta: 'Upgrade for Unlimited QR Codes',
    },
    'feature-gate': {
      title: 'Unlock Pro Features',
      description: 'Get access to advanced customization, analytics, and more.',
      cta: 'Upgrade to Pro',
    },
    'dashboard-banner': {
      title: 'Ready to Level Up?',
      description: 'Unlock unlimited QR codes and premium features.',
      cta: 'See Pro Benefits',
    },
  };

  const config = messages[context];

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
          <p className="text-primary-100 text-sm">{config.description}</p>
        </div>
        <button
          onClick={() => navigate('/pricing')}
          className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {config.cta}
        </button>
      </div>
    </div>
  );
};
```

## 9. Feature Comparison Table

### Side-by-Side Comparison

```typescript
const FeatureComparisonTable = () => {
  const features = [
    { name: 'QR Codes per Month', free: '5', pro: 'Unlimited' },
    { name: 'QR Code Types', free: 'Basic', pro: 'All Types' },
    { name: 'Download Formats', free: 'PNG', pro: 'PNG, SVG, PDF' },
    { name: 'Maximum Size', free: '800px', pro: '2000px' },
    { name: 'Logo Upload', free: '❌', pro: '✅' },
    { name: 'Custom Colors', free: '✅', pro: '✅' },
    { name: 'Analytics', free: 'Basic', pro: 'Advanced' },
    { name: 'Short URLs', free: '❌', pro: '✅' },
    { name: 'API Access', free: '❌', pro: '✅' },
    { name: 'Support', free: 'Community', pro: 'Priority' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Feature</th>
            <th className="text-center py-3 px-4">Free</th>
            <th className="text-center py-3 px-4">Pro</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium">{feature.name}</td>
              <td className="py-3 px-4 text-center text-gray-600">
                {feature.free}
              </td>
              <td className="py-3 px-4 text-center text-primary-600 font-medium">
                {feature.pro}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 10. Subscription Management

### Plan Status Display

```typescript
const SubscriptionStatus: React.FC<{ user: User }> = ({ user }) => {
  const subscription = user?.subscription;
  const isPro = subscription?.plan === 'pro';
  const isActive = subscription?.status === 'active';

  if (!isPro) {
    return (
      <div className="card p-4 border-yellow-200 bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Free Plan</h3>
            <p className="text-sm text-gray-600">5 QR codes per month</p>
          </div>
          <button onClick={() => navigate('/pricing')} className="btn-primary">
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 border-primary-200 bg-primary-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-primary-600 mr-2" />
          <div>
            <h3 className="font-medium text-gray-900">Pro Plan</h3>
            <p className="text-sm text-gray-600">
              {isActive ? 'Active until' : 'Status:'}{' '}
              {subscription?.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : subscription?.status}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings/billing')}
          className="btn-secondary text-sm"
        >
          Manage
        </button>
      </div>
    </div>
  );
};
```
