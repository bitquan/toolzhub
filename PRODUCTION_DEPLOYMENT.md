# 🚀 Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

### 1. Stripe Account Setup

- [ ] Production Stripe account activated
- [ ] Pro subscription product created in Stripe Dashboard
- [ ] Price ID for your Pro plan (starts with `price_`)
- [ ] Webhook endpoint configured for your production domain
- [ ] Production API keys (secret key starts with `sk_live_`)

### 2. Firebase Project Setup

- [ ] Firebase project deployed and hosting enabled
- [ ] Firebase Functions enabled
- [ ] Production environment configured

## Deployment Steps

### Step 1: Configure Stripe Keys

1. **Get your production Stripe keys:**

   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Copy your **Publishable key** (starts with `pk_live_`)
   - Copy your **Secret key** (starts with `sk_live_`)
   - Copy your **Price ID** for Pro plan (starts with `price_`)

2. **Set up environment variables:**

   ```bash
   # Copy the production environment template
   cp .env.production .env

   # Edit .env and replace with your actual values:
   # VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY
   # VITE_STRIPE_PRO_PRICE_ID=price_YOUR_ACTUAL_PRICE_ID
   ```

3. **Configure Firebase Functions:**

   ```bash
   # Set production Stripe secret key
   firebase functions:config:set stripe.secret_key="sk_live_YOUR_ACTUAL_SECRET_KEY"

   # Set production webhook secret (get this from Stripe webhook settings)
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_ACTUAL_WEBHOOK_SECRET"
   ```

### Step 2: Set Up Stripe Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint
3. Use this URL: `https://us-central1-toolzhub-5014-31157.cloudfunctions.net/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Step 3: Deploy to Production

```bash
# Run the production deployment script
./deploy-production.sh
```

Or manually:

```bash
# Build and deploy
npm run build
cd functions && npm run build && cd ..
firebase deploy
```

### Step 4: Test Production Deployment

1. **Test the upgrade flow:**

   - Visit your production site
   - Sign up/login with a test account
   - Click "Upgrade to Pro" button
   - Complete Stripe checkout with test card: `4242 4242 4242 4242`

2. **Verify subscription activation:**
   - Check user's subscription status updates
   - Verify Pro features are unlocked
   - Test QR code limits are removed

### Step 5: Monitor Production

- **Firebase Console:** https://console.firebase.google.com/project/toolzhub-5014-31157
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Application Logs:** Check Firebase Functions logs for any errors

## Troubleshooting

### Common Issues:

1. **Stripe Error: "No such price"**

   - Verify `VITE_STRIPE_PRO_PRICE_ID` matches your Stripe price ID
   - Ensure the price is active in Stripe Dashboard

2. **Webhook not receiving events**

   - Check webhook URL is correct
   - Verify webhook secret matches Firebase config
   - Check Firebase Functions logs

3. **Subscription not updating**
   - Check Firebase Firestore rules allow writes
   - Verify webhook events are being processed
   - Check user document structure

## Security Checklist

- [ ] Never commit production Stripe keys to version control
- [ ] Use environment variables for all sensitive data
- [ ] Enable Stripe webhook signature verification
- [ ] Set up proper Firebase security rules
- [ ] Enable HTTPS-only in production

## Success! 🎉

Your "Upgrade to Pro" buttons are now live in production with real Stripe integration!
