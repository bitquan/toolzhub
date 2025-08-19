# Copilot Setup Tasks (macOS + zsh)

This checklist gets Toolz.space running locally with Firebase emulators and Stripe, then deploys to Firebase.

Variables to replace:

- <PROJECT_ID>: your Firebase project ID
- <STRIPE*SK>: your Stripe secret key (sk_test*...)
- <STRIPE*WHSEC>: your Stripe webhook signing secret (whsec*...)

## 0) Prerequisites

- macOS with zsh
- Homebrew installed
- Stripe account and test mode enabled
- Firebase project created

## 1) Install CLIs

```sh
brew install firebase-cli
brew install stripe/stripe-cli/stripe
firebase --version
stripe --version
node -v
npm -v
```

## 2) Environment variables (frontend)

```sh
cp .env.example .env
# Edit .env and set all VITE_FIREBASE_* and VITE_STRIPE_PUBLISHABLE_KEY
```

## 3) Link Firebase project

```sh
firebase login
firebase use --add
# Choose <PROJECT_ID> and an alias (e.g. default)
```

## 4) Configure Functions runtime config (Stripe)

```sh
firebase functions:config:set \
  stripe.secret_key="<STRIPE_SK>" \
  stripe.webhook_secret="<STRIPE_WHSEC>"
firebase functions:config:get
```

## 5) Install dependencies

```sh
npm install
(cd functions && npm install)
```

## 6) Start Firebase emulators

Ports per firebase.json: Auth 9099, Firestore 8080, Functions 5001, Storage 9199, UI 4000.

```sh
npm run firebase:emulators
```

Verification:

- Open http://localhost:4000 and confirm all emulators are green

## 7) Start the frontend (Vite)

```sh
npm run dev
```

Verification:

- Open http://localhost:3000
- Create an account or sign in with Google
- Confirm a `users/{uid}` document is created

## 8) Stripe webhooks (optional but recommended for full flow)

```sh
stripe login
stripe listen --forward-to localhost:5001/<PROJECT_ID>/us-central1/api/stripe/webhook
```

Verification:

- Initiate a checkout from the app (Pro plan)
- Complete test checkout using Stripe test cards
- Confirm Functions logs show `checkout.session.completed`
- Confirm `users/{uid}.subscription` fields updated in Firestore

## 9) Health checks and API sanity

```sh
# Functions health endpoint (emulator)
curl -s http://localhost:5001/<PROJECT_ID>/us-central1/api/health | jq
```

Expected: `{ "status": "ok", "timestamp": "..." }`

## 10) Build and deploy

```sh
npm run build
firebase deploy
```

Verification:

- Hosting URL opens the app
- `us-central1/api/health` reachable on production
- Auth and Firestore operations succeed (rules as configured)

## 11) Troubleshooting quick refs

- Docs: ./../troubleshooting/common-issues.md
- Ensure `.env` is populated and dev server restarted after changes
- Verify emulator ports match `firebase.json`
- Re-run: `firebase functions:config:get` to confirm Stripe secrets

## Notes

- Vite dev server runs on port 3000 (vite.config.ts)
- App connects to emulators automatically when `import.meta.env.DEV`
- Cloud Functions runtime: Node.js 18 (firebase.json)
