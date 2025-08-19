# CLI Setup and Usage

This project uses:

- Firebase CLI for emulators, deploys, and runtime config
- Stripe CLI for local webhook forwarding (optional)

## Install (macOS + zsh)

- Firebase CLI (via Homebrew):

```sh
brew install firebase-cli
```

- Stripe CLI (via Homebrew):

```sh
brew install stripe/stripe-cli/stripe
```

Verify:

```sh
firebase --version
stripe --version
node -v
npm -v
```

## Authenticate and link project

- Login Firebase:

```sh
firebase login
```

- Set your project alias (pick your project):

```sh
firebase use --add
```

- Set Functions runtime secrets (required for Stripe):

```sh
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..."

firebase functions:config:get
```

## Common commands (repo root unless noted)

- Start frontend dev server:

```sh
npm run dev
```

- Start all Firebase emulators (Auth:9099, Firestore:8080, Storage:9199, Functions:5001, UI:4000):

```sh
npm run firebase:emulators
```

- Build frontend:

```sh
npm run build
```

- Deploy hosting + functions:

```sh
npm run firebase:deploy
```

- Functions build (TypeScript -> lib):

```sh
npm run functions:build
```

- Functions deploy only:

```sh
npm run functions:deploy
```

## Stripe CLI (local webhook forwarding)

Forward Stripe events to Functions emulator endpoint (replace <PROJECT-ID>):

```sh
stripe login
stripe listen --forward-to localhost:5001/<PROJECT-ID>/us-central1/api/stripe/webhook
```

Tip: Add `--events` to limit traffic, e.g.:

```sh
stripe listen --events checkout.session.completed,customer.subscription.updated \
  --forward-to localhost:5001/<PROJECT-ID>/us-central1/api/stripe/webhook
```

## Environment file

Copy and fill your env file for Vite:

```sh
cp .env.example .env
```

Then restart `npm run dev`.
