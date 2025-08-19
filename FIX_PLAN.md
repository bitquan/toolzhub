# ToolzHub Fix & Test Plan (August 2025)

This document is the single source of truth for how I will bring the project to a green build, verify core flows, and keep it maintainable. It includes required VS Code tasks, zsh commands, and Copilot instructions.

## Goals

- Green TypeScript build for web and Cloud Functions
- Stable local dev with Firebase emulators
- Verified core app flows (auth, QR generator, admin, blog)
- CI-friendly tasks and linting baseline

## Current Issues Found

- Type errors in:
  - `src/components/Auth/ProtectedRoute.tsx` (referenced unsupported `customClaims`)
  - `src/pages/BlogSimple.tsx` (category union types; unused import; createdAt not in BlogPost type)
  - `src/pages/Settings.tsx` (unused React import)
- Cloud Functions TypeScript import issues (namespace imports for express/cors)
- No ESLint config, so `npm run lint` fails

All high-signal errors have been fixed in code except for any newly surfaced ones after subsequent edits; re-run Type Check below to confirm.

## How to Run Locally

- Dev servers
  - VS Code Task: "Start Development Server for AdminDashboard Testing"
  - VS Code Task: "Start Firebase Emulators"
- Manual commands (macOS zsh):

```sh
# 1) Install deps (root + functions)
npm install
(cd functions && npm install)

# 2) Environment
cp -n .env.example .env 2>/dev/null || true
# Fill VITE_FIREBASE_* and VITE_STRIPE_PUBLISHABLE_KEY as needed

# 3) Emulators
npm run firebase:emulators

# 4) Frontend
npm run dev
```

Verify:

- http://localhost:3000 is up
- http://localhost:4000 shows all emulators

## TypeScript, Build, and Functions

- VS Code Tasks:

  - "Type Check" (npx tsc --noEmit)
  - "Clean Dist + Build" (rm -rf dist && npm run build)
  - "Functions: Build" (cd functions && tsc)
  - "HTTP: Check Local Functions Health"

- Manual commands:

```sh
# Frontend type-check
npm run type-check

# Frontend build
npm run build

# Functions type-check/build
(cd functions && npm run build)

# Local functions health
curl -s http://localhost:5001/$(jq -r .projects.default .firebaserc)/us-central1/api/health | jq
```

## Stripe (optional for full flow)

```sh
# Login and forward webhooks to emulator
stripe login
stripe listen --forward-to http://localhost:5001/$(jq -r .projects.default .firebaserc)/us-central1/api/stripe/webhook
```

## Deploy

- VS Code Tasks: "Firebase: Deploy All" or "Functions: Deploy"
- Manual command:

```sh
npm run build
firebase deploy
```

## Copilot Instructions (Quick)

- Always include absolute paths in prompts (wrap with backticks)
- Ask Copilot to: "Run Type Check and summarize errors before proposing changes"
- Prefer single-file diffs; request verification steps (commands) after edits
- Don’t paste secrets; use `firebase functions:config:set` for Stripe

### Useful Prompts

- "Open `src/components/Auth/ProtectedRoute.tsx` and remove any reference to customClaims; gate admin with email whitelist or Firestore `isAdmin` flag. Then run Type Check."
- "Tighten category types in `src/pages/BlogSimple.tsx` to use `BlogCategory` objects only; adjust keys/values accordingly and re-run Type Check."
- "Fix Cloud Functions imports in `functions/src/index.ts` to use default imports for express/cors with Node 18 and re-run functions build."
- "Add ESLint config for React + TS with airbnb-ish rules and scripts; then run lint and autofix."

## Next Improvements

- Add `.eslintrc.cjs` and a curated rule set; wire `npm run lint:fix`
- Add minimal tests for critical utilities
- Code-split large bundles (per Vite warning)
- Add GitHub action: type-check + functions build on PRs

## Status Checks

- Build: run "Clean Dist + Build"
- Type-check: run "Type Check"
- Functions: run "Functions: Build"
- Health: run both HTTP health tasks

If any step fails, open a bugfix branch and iterate with Copilot using the prompts above.
