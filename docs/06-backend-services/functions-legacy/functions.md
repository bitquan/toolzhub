# Backend (Firebase Functions)

- Runtime: Node 18, TypeScript compiled to `functions/lib`
- Entrypoint: `functions/src/index.ts` exports:
  - `api`: Express app (health, Stripe endpoints)
  - `trackQRScan`: callable function to log scans
  - `resetMonthlyUsage`: scheduled job to reset usage
- Stripe handlers in `functions/src/stripe.ts` (checkout session + webhook processing)

Local dev:

- Build once: `npm run functions:build`
- Emulators: `npm run firebase:emulators` (from root)

Deploy:

- Only functions: `npm run functions:deploy`

Secrets:

- Use `firebase functions:config:set stripe.secret_key=... stripe.webhook_secret=...`
