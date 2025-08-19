# Stripe Integration

Used for Pro subscriptions.

Endpoints (Functions `api`):

- `POST /stripe/create-checkout-session` body: `{ priceId, userId }`
- `POST /stripe/webhook` for Stripe events

Config secrets (required):

- `stripe.secret_key`
- `stripe.webhook_secret`

Set with Firebase CLI:

```sh
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
```

Local webhook forwarding (optional):

```sh
stripe listen --forward-to localhost:5001/<PROJECT-ID>/us-central1/api/stripe/webhook
```
