# Subscription Management

## 💳 Overview

ToolzHub's subscription system provides a seamless Free-to-Pro upgrade experience with Stripe integration, enabling users to unlock advanced QR code generation features and unlimited usage.

## 📊 Subscription Plans

### Free Plan

- **QR Codes per Month**: 5 QR codes
- **Available QR Types**: 3 basic types (URL, Text, Phone)
- **Customization**: Standard color and size options
- **Support**: Community support
- **Price**: $0/month

### Pro Plan

- **QR Codes per Month**: Unlimited
- **Available QR Types**: All 9 types including WiFi, vCard, SMS, Email, WhatsApp, Location
- **Customization**: Full customization options
- **Support**: Priority email support
- **Price**: $9.99/month

## 🔄 Upgrade Flow

### User Journey

1. **Discovery**: User encounters Pro feature or usage limit
2. **Decision**: User clicks "Upgrade to Pro" button
3. **Checkout**: Redirected to Stripe Checkout
4. **Payment**: Secure payment processing via Stripe
5. **Activation**: Immediate Pro feature access
6. **Confirmation**: Email confirmation and dashboard update

### Upgrade Touchpoints

#### QR Generator Page

- Usage counter showing progress toward limit
- Pro badges on restricted QR types
- Prominent upgrade section for Free users
- Upgrade button when approaching usage limit

#### Dashboard Page

- Two strategic "Upgrade to Pro" buttons
- Usage statistics display
- Pro feature previews

#### Pricing Page

- Detailed plan comparison
- Clear value proposition
- Single "Upgrade to Pro" CTA

#### Settings Page

- Account management section
- Subscription status display
- Upgrade option for Free users

## 🛠️ Technical Implementation

### Subscription Service

```typescript
// Core subscription service
export class SubscriptionService {
  async upgradeToProWithRedirect(user: User): Promise<void> {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        plan: 'pro',
      }),
    });

    const { sessionId } = await response.json();
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!
    );

    await stripe!.redirectToCheckout({ sessionId });
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Cancellation logic
  }

  async updatePaymentMethod(subscriptionId: string): Promise<void> {
    // Payment method update logic
  }
}
```

### Stripe Integration

#### Checkout Session Creation

```typescript
// Cloud Function: createCheckoutSession
export const createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    const { userId, email, plan } = data;

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { userId },
    });

    return { sessionId: session.id };
  }
);
```

#### Webhook Handling

```typescript
// Cloud Function: stripeWebhook
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
  }

  res.json({ received: true });
});
```

### User Data Context Integration

```typescript
// UserDataContext with subscription state
export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UserDataState>({
    subscription: null,
    stats: { qrCodesThisMonth: 0 },
    isLoading: true,
    error: null,
  });

  const updateSubscription = (subscription: Subscription) => {
    setState((prev) => ({ ...prev, subscription }));
  };

  return (
    <UserDataContext.Provider value={{ state, updateSubscription }}>
      {children}
    </UserDataContext.Provider>
  );
};
```

## 🔒 Access Control

### Subscription Status Detection

```typescript
// Check Pro status across the application
const isPro = user?.subscription?.plan === 'pro';
const isActive = user?.subscription?.status === 'active';
const canAccessPro = isPro && isActive;
```

### Usage Limit Enforcement

```typescript
// QR generation limits
const qrLimit = isPro ? Infinity : 5;
const usage = userData.stats.qrCodesThisMonth;
const canGenerate = isPro || usage < qrLimit;
```

### Feature Gating

```typescript
// Pro feature restrictions
const PRO_FEATURES = ['wifi', 'vcard', 'sms', 'email', 'whatsapp', 'location'];
const hasAccess = (feature: string) => isPro || !PRO_FEATURES.includes(feature);
```

## 📱 User Interface

### Upgrade Buttons

```typescript
// Consistent upgrade button component
const UpgradeButton = ({ size = 'md', location }: UpgradeButtonProps) => {
  const handleClick = async () => {
    if (!user) {
      toast.error('Please log in to upgrade to Pro');
      return;
    }

    try {
      await subscriptionService.upgradeToProWithRedirect(user);
    } catch (error) {
      toast.error('Failed to start upgrade process');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors ${
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-6 py-3'
      }`}
    >
      Upgrade to Pro
    </button>
  );
};
```

### Subscription Status Display

```typescript
// Dashboard subscription status
const SubscriptionStatus = () => {
  if (!user?.subscription) {
    return <FreeStatusCard />;
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-2">Pro Subscription</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-600 font-medium">Active</p>
          <p className="text-sm text-gray-600">
            Next billing: {formatDate(user.subscription.currentPeriodEnd)}
          </p>
        </div>
        <button className="text-purple-600 hover:text-purple-700">
          Manage Subscription
        </button>
      </div>
    </div>
  );
};
```

### Usage Progress Indicators

```typescript
// Usage meter for Free users
const UsageIndicator = () => {
  if (isPro) return null;

  const percentage = (usage / qrLimit) * 100;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">QR Codes This Month</span>
        <span className="text-sm text-gray-600">
          {usage}/{qrLimit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            percentage >= 80
              ? 'bg-red-500'
              : percentage >= 60
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 80 && (
        <p className="text-xs text-red-600 mt-1">
          Almost at your limit! Upgrade for unlimited QR codes.
        </p>
      )}
    </div>
  );
};
```

## 💰 Pricing Strategy

### Value Proposition

| Feature        | Free      | Pro         | Value                   |
| -------------- | --------- | ----------- | ----------------------- |
| QR Codes/Month | 5         | Unlimited   | High-volume users       |
| QR Types       | 3 basic   | All 9 types | Professional features   |
| WiFi QR Codes  | ❌        | ✅          | Convenience             |
| Business Cards | ❌        | ✅          | Professional networking |
| Analytics      | Basic     | Advanced    | Business insights       |
| Support        | Community | Priority    | Peace of mind           |

### Conversion Strategy

1. **Freemium Model**: Generous free tier to attract users
2. **Usage Limits**: Natural upgrade trigger at 5 QR codes
3. **Feature Gates**: Premium QR types as upgrade motivators
4. **Value Demonstration**: Clear benefits of Pro features
5. **Friction Reduction**: One-click upgrade process

## 📊 Analytics & Metrics

### Key Performance Indicators

- **Conversion Rate**: Free to Pro subscription rate
- **Monthly Recurring Revenue (MRR)**: Subscription revenue
- **Churn Rate**: Subscription cancellation rate
- **Customer Lifetime Value (CLV)**: Revenue per customer
- **Usage Patterns**: Feature adoption rates

### Tracking Implementation

```typescript
// Analytics service integration
export const trackSubscriptionEvent = (event: string, properties?: any) => {
  analytics.track(event, {
    ...properties,
    timestamp: new Date(),
    userId: user?.uid,
    planType: isPro ? 'pro' : 'free',
  });
};

// Key events to track
trackSubscriptionEvent('upgrade_clicked', { source: 'qr_generator' });
trackSubscriptionEvent('checkout_started', { plan: 'pro' });
trackSubscriptionEvent('subscription_activated', { plan: 'pro' });
trackSubscriptionEvent('subscription_cancelled', { reason: 'user_request' });
```

## 🛡️ Security & Compliance

### Data Protection

- **PCI Compliance**: Stripe handles all payment data
- **User Privacy**: Minimal data collection
- **GDPR Compliance**: User consent and data deletion rights
- **Secure Transmission**: HTTPS for all transactions

### Subscription Security

- **Webhook Verification**: Stripe signature validation
- **Idempotency**: Duplicate event handling
- **Access Verification**: Server-side subscription checks
- **Rate Limiting**: API endpoint protection

## 🚀 Future Enhancements

### Additional Plans

- **Team Plan**: Multi-user accounts ($19.99/month)
- **Enterprise Plan**: Custom pricing and features
- **Annual Discounts**: 20% off annual subscriptions

### Advanced Features

- **Usage Analytics**: Detailed QR scan tracking
- **Bulk Operations**: Batch QR generation
- **White Labeling**: Custom branding options
- **API Access**: Developer integrations

### Billing Enhancements

- **Payment Methods**: PayPal, bank transfers
- **Invoicing**: Automated billing for teams
- **Proration**: Mid-cycle plan changes
- **Trial Periods**: 14-day free Pro trials

---

_Last Updated: August 19, 2025_
_Version: 2.0 - Stripe Integration & Free vs Pro_
