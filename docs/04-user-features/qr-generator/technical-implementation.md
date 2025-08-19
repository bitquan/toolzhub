# QR Generator Technical Implementation

## 🏗️ Architecture Overview

The QR Generator follows a modular architecture with clear separation of concerns between UI components, business logic, and external services.

## 📦 Component Structure

### Main Component: `QRGenerator.tsx`

```typescript
// Core Dependencies
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { subscriptionService } from '@/services/subscription';
import { QRCodeService } from '@/services/qrcode';

// Component Structure
export function QRGenerator() {
  // State Management
  // Authentication & Subscription Logic
  // Content Rendering Functions
  // Event Handlers
  // UI Rendering
}
```

## 🔐 Free vs Pro Implementation

### Subscription Status Detection

```typescript
const isPro = user?.subscription?.plan === 'pro';
const qrLimit = isPro ? Infinity : 5;
const usage = userData.stats.qrCodesThisMonth;
```

### QR Type Categorization

```typescript
const PRO_QR_TYPES: QRCodeType[] = [
  'wifi',
  'vcard',
  'sms',
  'email',
  'whatsapp',
  'location',
];

const QR_TYPES = [
  { value: 'url', label: 'Website URL', icon: '🌐' },
  { value: 'text', label: 'Plain Text', icon: '📝' },
  { value: 'phone', label: 'Phone Number', icon: '📞' },
  { value: 'wifi', label: 'WiFi Network', icon: '📶', isPro: true },
  // ... more types
];
```

### Access Control Logic

```typescript
const generateQRCode = async () => {
  // Usage limit check
  if (!isPro && usage >= qrLimit) {
    toast.error(
      `You've reached your monthly limit of ${qrLimit} QR codes. Upgrade to Pro for unlimited codes!`
    );
    return;
  }

  // Pro feature check
  if (!isPro && PRO_QR_TYPES.includes(selectedType)) {
    toast.error(
      `${
        QR_TYPES.find((t) => t.value === selectedType)?.label
      } is a Pro feature. Upgrade to Pro to unlock all QR types!`
    );
    return;
  }

  // Generate QR code...
};
```

## 🎨 UI Components

### Type Selection Grid

```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  {QR_TYPES.map((type) => (
    <button
      key={type.value}
      onClick={() => handleTypeSelection(type.value)}
      className={`p-3 rounded-lg border text-center transition-colors relative ${
        selectedType === type.value
          ? 'border-primary-600 bg-primary-50 text-primary-700'
          : 'border-gray-300 hover:border-gray-400'
      } ${
        type.isPro && !isPro
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer'
      }`}
      disabled={type.isPro && !isPro}
    >
      {type.isPro && !isPro && (
        <div className="absolute -top-1 -right-1">
          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            PRO
          </span>
        </div>
      )}
      <div className="text-lg mb-1">{type.icon}</div>
      <div className="text-xs font-medium">{type.label}</div>
    </button>
  ))}
</div>
```

### Usage Indicator

```typescript
{
  !isPro && (
    <div className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
      <span className="text-sm text-blue-700">
        {usage}/{qrLimit} QR codes this month
      </span>
      {usage >= qrLimit - 5 && (
        <button
          onClick={handleUpgradeClick}
          className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
        >
          Upgrade to Pro
        </button>
      )}
    </div>
  );
}
```

### Pro Upgrade Prompt

```typescript
{
  !isPro && (
    <div className="card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Pro Features
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get unlimited QR codes and access to advanced types like WiFi,
            vCard, and more!
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Unlimited QR code generation</li>
            <li>• All QR code types (WiFi, vCard, SMS, etc.)</li>
            <li>• Priority support</li>
            <li>• No watermarks</li>
          </ul>
        </div>
        <div className="ml-6">
          <button
            onClick={handleUpgradeClick}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 📝 Content Form Rendering

### Dynamic Form Generation

```typescript
function renderDataInputs() {
  switch (selectedType) {
    case 'url':
      return <URLForm />;
    case 'wifi':
      return <WiFiForm />;
    case 'vcard':
      return <VCardForm />;
    // ... other cases
    default:
      return <DefaultMessage />;
  }
}
```

### URL Form Example

```typescript
case 'url':
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Website URL
      </label>
      <input
        type="url"
        value={qrData.url || ''}
        onChange={(e) =>
          setQrData((prev) => ({ ...prev, url: e.target.value }))
        }
        placeholder="https://example.com"
        className="input-field"
      />
    </div>
  );
```

### vCard Form Example

```typescript
case 'vcard':
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={qrData.firstName || ''}
            onChange={(e) =>
              setQrData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="John"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={qrData.lastName || ''}
            onChange={(e) =>
              setQrData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Doe"
            className="input-field"
          />
        </div>
      </div>
      // ... additional fields
    </div>
  );
```

## 🔄 State Management

### QR Data State

```typescript
const [qrData, setQrData] = useState<QRCodeData>({});

// Type-safe data updates
const updateQRData = (field: keyof QRCodeData, value: any) => {
  setQrData((prev) => ({ ...prev, [field]: value }));
};
```

### Settings State

```typescript
const [qrSettings, setQrSettings] = useState<QRCodeSettings>({
  size: 300,
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  errorCorrectionLevel: 'M',
  margin: 1,
});
```

### Generated QR State

```typescript
const [qrCode, setQrCode] = useState<string>('');
const [isGenerating, setIsGenerating] = useState(false);
```

## 🛠️ Services Integration

### QR Code Service

```typescript
import { QRCodeService } from '@/services/qrcode';

// Validation
const validation = QRCodeService.validateQRData(selectedType, qrData);
if (!validation.isValid) {
  validation.errors.forEach((error) => toast.error(error));
  return;
}

// Generation
const generatedQR = await QRCodeService.generateQRCode(
  selectedType,
  qrData,
  qrSettings
);
```

### Subscription Service

```typescript
import { subscriptionService } from '@/services/subscription';

const handleUpgradeClick = async () => {
  if (!user) {
    toast.error('Please log in to upgrade to Pro');
    return;
  }

  try {
    await subscriptionService.upgradeToProWithRedirect(user);
  } catch (error) {
    console.error('Upgrade error:', error);
    toast.error(
      `Failed to start upgrade process: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
```

### Analytics Tracking

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

const { trackQRGeneration } = useAnalytics();

// Track successful generation
trackQRGeneration(selectedType);
```

## 🎯 Event Handlers

### Type Selection Handler

```typescript
const handleTypeSelection = (type: QRCodeType) => {
  const typeConfig = QR_TYPES.find((t) => t.value === type);

  // Pro feature check
  if (!isPro && typeConfig?.isPro) {
    toast.error(
      `${typeConfig.label} is a Pro feature. Upgrade to unlock all QR types!`
    );
    return;
  }

  setSelectedType(type);
};
```

### QR Generation Handler

```typescript
const generateQRCode = async () => {
  // Usage and access control checks
  // Validation
  // Generation
  // Success/error handling
};
```

## 📱 Responsive Design

### Grid Layouts

```typescript
// Type selection grid adapts to screen size
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

// Form fields use responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### Mobile Optimizations

```typescript
// Touch-friendly button sizes
className="p-3 rounded-lg border text-center transition-colors"

// Mobile-appropriate input types
<input type="tel" />  // For phone numbers
<input type="email" /> // For email addresses
<input type="url" />   // For URLs
```

## 🔍 Error Handling

### Validation Errors

```typescript
const validation = QRCodeService.validateQRData(selectedType, qrData);
if (!validation.isValid) {
  validation.errors.forEach((error) => toast.error(error));
  return;
}
```

### Generation Errors

```typescript
try {
  const generatedQR = await QRCodeService.generateQRCode(
    selectedType,
    qrData,
    qrSettings
  );
  // Success handling
} catch (error: any) {
  toast.error(error.message || 'Failed to generate QR code');
} finally {
  setIsGenerating(false);
}
```

### Access Control Errors

```typescript
if (!isPro && usage >= qrLimit) {
  toast.error(
    `You've reached your monthly limit of ${qrLimit} QR codes. Upgrade to Pro for unlimited codes!`
  );
  return;
}
```

## 🧪 Testing Considerations

### Unit Testing

- Component rendering with different subscription states
- Event handler functionality
- State management accuracy
- Error handling coverage

### Integration Testing

- Service integrations (QRCodeService, subscriptionService)
- Context dependencies (AuthContext, UserDataContext)
- Analytics tracking verification

### E2E Testing

- Complete QR generation flow
- Free vs Pro restrictions
- Upgrade flow functionality
- Mobile device compatibility

## 🚀 Performance Optimizations

### Lazy Loading

```typescript
// Lazy load QR generation service
const QRCodeService = lazy(() => import('@/services/qrcode'));
```

### Memoization

```typescript
// Memoize expensive calculations
const isPro = useMemo(() => user?.subscription?.plan === 'pro', [user]);
```

### Debounced Updates

```typescript
// Debounce form input updates
const debouncedUpdateQRData = useMemo(() => debounce(updateQRData, 300), []);
```

---

_Last Updated: August 19, 2025_
_Version: 2.0 - Free vs Pro Technical Implementation_
