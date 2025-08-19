# Components Architecture Documentation

## User Dashboard Component Structure

### Component Hierarchy Overview

```
Dashboard.tsx (Main Container)
├── UserDashboardProvider (Context Wrapper)
├── Subscription Status Card
│   ├── Plan Display (Free/Pro)
│   ├── Usage Progress Bar (Free only)
│   └── Upgrade Button (Free only)
├── Stats Grid
│   ├── Total QR Codes Card
│   ├── This Month Card
│   ├── Total Scans Card
│   └── Average Scans/Code Card
├── Content Grid
│   ├── Recent QR Codes Section
│   │   ├── QR Code List Items
│   │   └── View All Button
│   └── Quick Actions Section
│       ├── Create New QR Button
│       ├── View Analytics Button (Pro)
│       └── Upgrade to Pro Button (Free)
└── Pro Tip Card
```

## 1. Core Components

### Dashboard.tsx

**Location**: `src/pages/Dashboard.tsx`

**Purpose**: Main user dashboard container with personalized metrics and QR code management

**Current State**: Uses mock data, needs Firebase integration

**Key Features**:

- Plan status display (Free/Pro)
- Usage tracking and limits
- Personal QR code statistics
- Recent QR codes display
- Quick action buttons

**Dependencies**:

- `useAuth()` for user authentication
- `UserDashboardContext` (to be created) for data
- Lucide icons for UI elements

### UserDashboardContext.tsx (To Be Created)

**Location**: `src/contexts/UserDashboardContext.tsx`

**Purpose**: Centralized data management for user dashboard

**Key Functions**:

```typescript
// Data fetching methods
refreshUserQRCodes(): Promise<void>
refreshUsageStats(): Promise<void>
refreshAnalytics(): Promise<void>
createQRCode(data: QRCodeData): Promise<string>
updateQRCode(id: string, updates: Partial<QRCodeData>): Promise<void>
deleteQRCode(id: string): Promise<void>

// Real-time listeners
setupQRCodesListener(): () => void
setupUsageStatsListener(): () => void

// State management
loading: boolean
error: string | null
qrCodes: QRCode[]
usageStats: UsageStats
analytics: AnalyticsData
```

## 2. Subscription Status Component

### Current Implementation

**Location**: Inline in Dashboard.tsx (lines 28-58)

**Structure**:

```typescript
// Subscription status card with conditional styling
<div
  className={`card p-6 ${
    isPro
      ? 'border-primary-200 bg-primary-50'
      : 'border-yellow-200 bg-yellow-50'
  }`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      {isPro ? (
        <Crown className="h-6 w-6 text-primary-600 mr-3" />
      ) : (
        <QrCode className="h-6 w-6 text-yellow-600 mr-3" />
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isPro ? 'Pro Plan' : 'Free Plan'}
        </h2>
        <p className="text-sm text-gray-600">
          {isPro
            ? 'Unlimited QR codes with advanced features'
            : `${usage}/${qrLimit} QR codes used this month`}
        </p>
      </div>
    </div>
    {!isPro && <button className="btn-primary">Upgrade to Pro</button>}
  </div>
  // Progress bar for free users
  {!isPro && (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-600 h-2 rounded-full"
          style={{ width: `${Math.min((usage / qrLimit) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  )}
</div>
```

## 3. Statistics Grid Components

### Stats Cards Implementation

**Location**: Inline in Dashboard.tsx (lines 66-117)

**Structure**:

```typescript
const statsConfig = [
  {
    title: 'Total QR Codes',
    value: stats.totalQRCodes,
    icon: QrCode,
    color: 'primary',
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600',
  },
  {
    title: 'This Month',
    value: stats.qrCodesThisMonth,
    icon: Calendar,
    color: 'green',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    title: 'Total Scans',
    value: stats.totalScans,
    icon: BarChart3,
    color: 'blue',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Avg. Scans/Code',
    value:
      stats.totalQRCodes > 0
        ? Math.round(stats.totalScans / stats.totalQRCodes)
        : 0,
    icon: Users,
    color: 'purple',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];
```

### Responsive Grid Layout

```typescript
// 4-column grid that collapses on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {statsConfig.map((stat, index) => (
    <div key={index} className="card p-6">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mr-3`}
        >
          <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      </div>
    </div>
  ))}
</div>
```

## 4. QR Codes Display Component

### Recent QR Codes Section

**Location**: Lines 119-179 in Dashboard.tsx

**Current State**: Uses mock data

**Structure**:

```typescript
// QR code list item component
const QRCodeItem = ({ qrCode }: { qrCode: QRCode }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
        <span className="text-lg">{getQRTypeIcon(qrCode.type)}</span>
      </div>
      <div>
        <p className="font-medium text-gray-900">{qrCode.name}</p>
        <p className="text-sm text-gray-600">{getQRDisplayValue(qrCode)}</p>
        <p className="text-xs text-gray-500">
          Created {formatRelativeTime(qrCode.createdAt)}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">
        {qrCode.analytics?.totalScans || 0} scans
      </p>
      <p className="text-xs text-gray-500">
        {qrCode.analytics?.lastScanned
          ? `Last scan: ${formatRelativeTime(qrCode.analytics.lastScanned)}`
          : 'No scans yet'}
      </p>
    </div>
  </div>
);
```

### QR Code Type Icons

```typescript
const getQRTypeIcon = (type: string): string => {
  const icons = {
    url: '🌐',
    wifi: '📶',
    contact: '👤',
    text: '📝',
    email: '✉️',
    phone: '📞',
    sms: '💬',
    whatsapp: '📱',
    location: '📍',
  };
  return icons[type] || '📋';
};
```

## 5. Quick Actions Component

### Action Buttons Section

**Location**: Lines 181-205 in Dashboard.tsx

**Structure**:

```typescript
const quickActions = [
  {
    label: 'Create New QR Code',
    icon: QrCode,
    action: () => navigate('/generate'),
    variant: 'primary',
    available: true,
  },
  {
    label: 'View Analytics',
    icon: BarChart3,
    action: () => navigate('/analytics'),
    variant: 'secondary',
    available: isPro,
    proFeature: true,
  },
  {
    label: 'Upgrade to Pro',
    icon: Crown,
    action: () => navigate('/pricing'),
    variant: 'outline',
    available: !isPro,
    highlight: true,
  },
];

// Render action buttons
{
  quickActions
    .filter((action) => action.available)
    .map((action, index) => (
      <button
        key={index}
        onClick={action.action}
        className={`w-full ${getButtonVariant(
          action.variant
        )} text-left p-4 flex items-center`}
      >
        <action.icon className="h-5 w-5 mr-3" />
        {action.label}
      </button>
    ));
}
```

## 6. State Management Architecture

### Component State Structure

```typescript
interface DashboardState {
  loading: boolean;
  error: string | null;

  // User info
  user: User;
  isPro: boolean;

  // QR codes data
  qrCodes: QRCode[];
  totalQRCodes: number;
  recentQRCodes: QRCode[];

  // Usage statistics
  usageStats: {
    qrCodesThisMonth: number;
    monthlyLimit: number;
    totalScans: number;
    canCreateMore: boolean;
  };

  // Analytics data
  analytics: {
    avgScansPerCode: number;
    topPerformingCode: QRCode | null;
    scanTrends: Array<{ date: string; scans: number }>;
  };
}
```

### Data Flow Pattern

```
Firebase Collections
       ↓
UserDashboardContext (Centralized State)
       ↓
Dashboard Component
       ↓
Individual UI Components (Stats, QR List, Actions)
```

## 7. Responsive Design Implementation

### Mobile-First Grid System

```typescript
// Responsive breakpoints
const gridClasses = {
  subscriptionCard: 'mb-8',
  statsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8',
  contentGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
  qrCodesList: 'space-y-4',
  actionsSection: 'space-y-3',
};
```

### Mobile Optimizations

- **Single column layout** on mobile devices
- **Touch-friendly buttons** with adequate spacing
- **Readable typography** with appropriate font sizes
- **Collapsible sections** for better mobile UX

## 8. Loading and Error States

### Loading State Implementation

```typescript
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>

        {/* Skeleton loading for cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Error State Handling

```typescript
if (error) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={refreshData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 9. Performance Optimizations

### Component Memoization

```typescript
// Memoize expensive calculations
const memoizedStats = useMemo(() => {
  return {
    totalQRCodes: qrCodes.length,
    qrCodesThisMonth: qrCodes.filter((qr) => isCurrentMonth(qr.createdAt))
      .length,
    totalScans: qrCodes.reduce(
      (sum, qr) => sum + (qr.analytics?.totalScans || 0),
      0
    ),
    avgScansPerCode: qrCodes.length > 0 ? totalScans / qrCodes.length : 0,
  };
}, [qrCodes]);

// Memoize QR code list component
const MemoizedQRCodesList = React.memo(QRCodesList);
```

### Lazy Loading

```typescript
// Lazy load QR codes list
const [displayedQRCodes, setDisplayedQRCodes] = useState(5);

const loadMoreQRCodes = () => {
  setDisplayedQRCodes((prev) => prev + 5);
};
```

## 10. Accessibility Features

### Screen Reader Support

```typescript
// ARIA labels for better accessibility
<div
  className="card p-6"
  role="region"
  aria-label={`${stat.title}: ${stat.value}`}
>
  <div className="flex items-center">
    <div
      className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mr-3`}
      aria-hidden="true"
    >
      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
      <p
        className="text-2xl font-bold text-gray-900"
        aria-label={`${stat.title}: ${stat.value}`}
      >
        {stat.value}
      </p>
    </div>
  </div>
</div>
```

### Keyboard Navigation

```typescript
// Keyboard navigation for action buttons
const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
};
```

## 11. Testing Considerations

### Component Testing Strategy

```typescript
// Test data loading states
describe('Dashboard Component', () => {
  it('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays user QR codes when loaded', async () => {
    const mockQRCodes = [
      /* mock data */
    ];
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Website QR')).toBeInTheDocument();
    });
  });

  it('shows upgrade prompt for free users', () => {
    const freeUser = { subscription: { plan: 'free' } };
    render(<Dashboard user={freeUser} />);

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });
});
```

### Integration Testing

- **Firebase integration**: Test with emulator data
- **Authentication flows**: Test login/logout scenarios
- **Real-time updates**: Test live data synchronization
- **Error scenarios**: Test network failures and recovery
