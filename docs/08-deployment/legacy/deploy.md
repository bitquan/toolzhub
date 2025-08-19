# Deployment

Production build + deploy:

```sh
npm run build
firebase deploy
```

Hosting serves `dist` with SPA rewrites to `/index.html`.

Functions target Node 18 per `firebase.json`. Ensure Functions build succeeds and Stripe secrets are set.
