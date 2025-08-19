# Troubleshooting

- Emulators not connecting: Ensure ports match `firebase.json`. The app attempts to connect only in `import.meta.env.DEV`.
- Missing env vars: Create `.env` from `.env.example` and restart dev server.
- Stripe webhook 400: Verify `stripe.webhook_secret` set via Firebase Functions config and that Stripe CLI forwards to the correct URL.
- Permission denied (Firestore): Confirm auth state and rules; make sure `users/{uid}` exists (AuthContext creates it on sign-in).
- Build errors: Run `npm run type-check` and `npm run lint`. Ensure Node 18+.
