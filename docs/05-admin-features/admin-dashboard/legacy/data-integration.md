# Data Integration Documentation

## Firebase Data Architecture

### Overview

The admin dashboard integrates with Firebase Firestore to display real-time platform metrics. All mock data has been removed in favor of live Firebase data.

## 1. Data Context Architecture

### AdminDataContext.tsx

Central data management for all admin dashboard metrics:

```typescript
// Key Data Fetching Functions
- refreshUsers(): Fetches user count and data
- refreshBlogPosts(): Fetches blog post metrics
- refreshAnalytics(): Fetches analytics data
- refreshQRCodes(): Fetches QR code generation data
```

### Real-time Data Updates

- **Automatic refresh**: Data refreshes every 30 seconds
- **Manual refresh**: Refresh buttons in dashboard
- **Live listeners**: Real-time Firestore listeners for users collection

## 2. Firestore Collections

### Users Collection (`/users/{userId}`)

```javascript
{
  email: "user@example.com",
  displayName: "User Name",
  isAdmin: false,
  createdAt: timestamp,
  lastLogin: timestamp,
  subscriptionStatus: "free|premium"
}
```

### Blog Collection (`/blog/{postId}`)

```javascript
{
  title: "Post Title",
  content: "Post content...",
  author: "Author Name",
  published: true,
  createdAt: timestamp,
  updatedAt: timestamp,
  category: "Category Name"
}
```

### Analytics Collection (`/analytics/{dailyDocId}`)

```javascript
{
  date: "2025-08-19",
  routes: {
    total_home: 150,
    unique_home: 75,
    total_pricing: 45,
    unique_pricing: 30
  },
  qrTypes: {
    url: 120,
    text: 45,
    email: 30
  },
  qrGenerated: 195,
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

### QR Scans Collection (`/qr_scans/{scanId}`)

```javascript
{
  qrCodeId: "qr_001",
  scannedAt: timestamp,
  location: "New York, NY",
  device: "mobile",
  userId?: "optional_user_id"
}
```

## 3. Data Population

### Test Data Creation

```bash
# Populate Firebase emulator with realistic test data
node populate-firebase-data.mjs
```

### Generated Test Data

- **4 Users**: Mix of admin and regular users
- **5 Blog Posts**: Various categories and publish dates
- **Analytics Data**: 3,163 total views, route-specific metrics
- **QR Scan Records**: 306 QR codes with scan tracking

## 4. Admin Dashboard Metrics

### Quick Stats Display

```typescript
const quickStats = [
  {
    title: 'Total Users',
    value: userData.totalUsers || 0,
    hasData: (userData.totalUsers || 0) > 0,
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Blog Posts',
    value: blogData.totalPosts || 0,
    hasData: (blogData.totalPosts || 0) > 0,
    icon: FileText,
    color: 'bg-green-500',
  },
  {
    title: 'QR Codes Generated',
    value: analyticsData.totalQRGenerated || 0,
    hasData: (analyticsData.totalQRGenerated || 0) > 0,
    icon: QrCode,
    color: 'bg-purple-500',
  },
  {
    title: 'Analytics Views',
    value: analyticsData.totalViews || 0,
    hasData: (analyticsData.totalViews || 0) > 0,
    icon: BarChart3,
    color: 'bg-orange-500',
  },
];
```

### Warning Triangle Implementation

```typescript
// Display warning triangle for insufficient data
{
  !stat.hasData && (
    <div className="flex items-center text-yellow-600 text-xs mt-1">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Not enough data
    </div>
  );
}
```

## 5. Real-time Features

### Live User Monitoring

- **Active users**: Real-time count
- **User activity**: Latest logins and registrations
- **Subscription status**: Premium vs free user breakdown

### Analytics Tracking

- **Route visits**: Real-time page view tracking
- **QR generation**: Live QR code creation metrics
- **User engagement**: Time-based analytics

### Blog Management

- **Post metrics**: Views, likes, shares per post
- **Publishing status**: Draft vs published content
- **Category performance**: Most popular blog categories

## 6. Data Security

### Firestore Security Rules (Development)

```javascript
// Temporary permissive rules for development
match /users/{userId} {
  allow read: if true;
  allow write: if true;
  allow list: if true;
  allow create: if true;
}

match /analytics/{analyticsId} {
  allow read: if true;
  allow write: if true;
  allow create: if true;
}

match /user_analytics/{userAnalyticsId} {
  allow read: if true;
  allow write: if true;
  allow create: if true;
}
```

### Production Security Considerations

- ⚠️ **Current rules are development-only**
- ⚠️ **Production needs strict admin-only access**
- ⚠️ **Implement proper user data privacy controls**

## 7. Performance Optimization

### Data Caching

- **Context state**: Cached data in AdminDataContext
- **Refresh intervals**: Configurable update frequency
- **Lazy loading**: Only fetch data when dashboard is accessed

### Query Optimization

- **Batch reads**: Multiple collections in single requests where possible
- **Indexed queries**: Proper Firestore indexing for complex queries
- **Pagination**: Large datasets use cursor-based pagination

## 8. Monitoring & Debugging

### Firebase Emulator UI

- **Firestore data**: `http://localhost:4000/firestore`
- **Authentication**: `http://localhost:4000/auth`
- **Functions logs**: `http://localhost:4000/functions`

### Console Debugging

```javascript
// Enable debug logging in AdminDataContext
console.log('Fetched users:', users);
console.log('Analytics data:', analyticsData);
console.log('Blog posts:', blogPosts);
```
