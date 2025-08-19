# Environment Setup

Prerequisites:

- Node.js 18+
- npm
- Firebase CLI
- Stripe CLI (optional but recommended)

Steps:

1. Copy env file: `cp .env.example .env` and fill values.
2. Install deps: `npm install && (cd functions && npm install)`
3. Login Firebase: `firebase login`
4. Create a Firebase project and set project alias: `firebase use --add`
5. Configure Stripe secrets in Functions: `firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."`
