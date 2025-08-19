# Copilot Task Commands for ToolzHub

Use these short prompts with GitHub Copilot Chat in this repo. Keep it scoped; ask for type-check/build after changes.

## Project Mapping

- Read the repo and summarize architecture and key flows; list missing docs. Then run type-check and summarize errors.

## Local Run

- Generate exact macOS zsh commands to copy `.env.example` to `.env`, install deps (root + functions), start Firebase emulators, and run Vite, then verify ports 3000 and 4000.

## Fixes

- Open `src/components/Auth/ProtectedRoute.tsx` and remove any `customClaims` reference; gate admin by email whitelist or Firestore flag; re-run type-check.
- Open `src/pages/BlogSimple.tsx` and strictly use `BlogCategory` objects in UI maps; update key/value/label and re-run type-check.
- Open `functions/src/index.ts` and switch to default imports for express/cors with types; rebuild functions.

## Testing

- Use `docs/setup/copilot-full-test-instructions.md` and drive the end-to-end tests; report pass/fail and logs.

## Deployment

- Provide the zsh commands to build and `firebase deploy`; then run health checks for `us-central1/api/health`.

## Admin Dashboard

- Audit `src/pages/Admin.tsx` and `src/components/Admin/*` for error boundaries and loading states; suggest low-risk improvements and add a tiny test for `useBlog` error path.

## Linting

- Create a minimal `.eslintrc.cjs` for React + TS, add npm scripts, and run `npm run lint:fix`. Summarize violations left.

## Page-by-Page QA (Interactive Commands)

- Open the dev server and guide me to test the Home page (`/`): verify header/footer render, primary CTA scrolls/navigates correctly, all top-nav links work (Generate, Blog, Pricing, Login), no console errors, and layout is responsive at 375/768/1280 widths.

- Walk through the Login flow (`/login`): validate Google Sign-In button triggers redirect, handle error state UI if popup blocked, confirm successful callback hits `GoogleAuthCallback` and user state updates in `AuthContext`.

- Test QR Generator (`/generate`): create a URL QR, change colors/logo, download PNG/SVG/PDF, ensure analytics `trackQRGeneration` fires, and no layout shifts. Then test WiFi/vCard types quickly and verify validation errors show.

- Blog List (`/blog` or `/blog-simple`): confirm categories render from Firestore or mock fallback, search filters by title/excerpt/tags, pills toggle categories, featured section renders when no filters, and clicking a card navigates to the post.

- Blog Post (`/blog/:slug`): validate SEO meta from `SEO` component, date formatting handles Timestamp/string, tags render, Share button copies/uses Web Share API, and related posts show same category.

- Pricing (`/pricing`): verify features list, “Upgrade to Pro” button states for free vs pro users, and if in DEV with dummy Stripe keys, ensure friendly demo path is shown by `subscriptionService`.

- Dashboard (`/dashboard`): ensure authenticated view loads, key widgets render, and navigation to generator/blog works. Confirm unauthenticated users are redirected from protected routes.

- Admin Panel (`/admin`): verify admin gating via email whitelist/Firestore `isAdmin`. Test tabs: Dashboard, Blog Management (create/edit/delete), Users, Analytics, Analytics Management. Check error boundaries and loading states.

- GoogleAuth Callback (`/auth/callback`): simulate return from Google, confirm user persisted and redirected properly, and errors are surfaced if state mismatch.

- 404/Edge Cases: try unknown routes to verify graceful fallback, confirm redirects and toasts don’t spam logs.

## Backend/API and Functions Checks

- Health check Functions: run curl to `/us-central1/api/health`, expect 200 with timestamp; if running emulators, hit `http://localhost:5001/<project>/us-central1/api/health`.

- Stripe: call `/stripe/create-checkout-session` with a test payload in DEV, handle expected STRIPE_NOT_CONFIGURED behavior, and verify the error path shows a demo success alert (no crash).

- Analytics: perform a couple of route navigations and verify Firestore `analytics/<YYYY-MM-DD>` doc increments route totals; check `user_analytics` doc if logged in.

- Blog data ops: create/delete a post via Admin; confirm list updates immediately and removal persists after refresh.
