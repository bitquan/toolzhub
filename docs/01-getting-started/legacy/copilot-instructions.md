# GitHub Copilot Instructions for This Repo

Use this guide to get the best out of GitHub Copilot (Chat) in VS Code for Toolz.space. It includes prerequisite setup, prompt recipes, and guardrails.

## Prerequisites

- VS Code with the GitHub Copilot and GitHub Copilot Chat extensions
- Signed in to GitHub with Copilot enabled for your account/org
- This repository opened at the workspace root

Optional:

- GitHub CLI installed (gh) if you use the Copilot GitHub CLI extension

## Ground rules for prompts

- Be specific about the file(s) and outcome
- Include OS and shell context: macOS + zsh
- Reference paths exactly (use backticks), e.g. `functions/src/index.ts`
- Never paste secrets (Stripe keys, etc.) into prompts
- Ask for minimal, copy-ready commands in zsh

## Common prompt recipes

1. Summarize and map the project

- "Read the repo and summarize the architecture and key flows. Then list any missing docs or obvious TODOs."

2. Environment + CLI setup (macOS + zsh)

- "Generate exact macOS zsh commands to install Firebase CLI and Stripe CLI, verify versions, link my Firebase project, set Functions config for Stripe, and start emulators. Use repo scripts if present."

3. End-to-end local run

- "Walk me through local run: copy .env, install deps in root and functions, start emulators, and start Vite. Include verification steps for http://localhost:4000 and http://localhost:3000."

4. Stripe webhook forwarding

- "Give me Stripe CLI commands to forward webhooks to the Functions emulator URL for project <PROJECT_ID>. Include a targeted list of events for subscriptions."

5. Health check & smoke test

- "Show a curl to hit the Functions health endpoint on the emulator and the expected JSON response, then outline what a failure indicates."

6. Deployment

- "Provide the zsh commands to build with Vite and deploy hosting + functions to Firebase. Include a short post-deploy checklist."

7. Code edits with context

- "Open `src/pages/QRGenerator.tsx` and add a dropdown for PNG/SVG export that uses `QRCodeService.generateQRCode` or `generateQRCodeSVG` accordingly. Keep styling consistent and add minimal validation."

8. Auth and rules checks

- "Explain how Firestore rules in `firestore.rules` affect reads/writes for `users`, `qrcodes`, and `analytics`, and suggest a quick test script using the emulators."

9. Docs navigation and enhancements

- "Read `docs/setup/cli.md` and `docs/stripe/integration.md` and propose missing steps or corrections for macOS + zsh."

10. Creating new features

- "Add a minimal `src/pages/BulkGenerate.tsx` that lets a Pro user upload a CSV of URLs and download a ZIP of PNG QRs. Outline the files to touch and add TODO comments where APIs are not yet implemented."

## Fast paths in this repo

- Setup tasks: `docs/setup/copilot-tasks.md`
- CLI steps: `docs/setup/cli.md`
- Firebase config, emulators, rules: `docs/firebase/config.md`
- Stripe integration (checkout + webhooks): `docs/stripe/integration.md`
- Functions overview: `docs/backend/functions.md`
- Frontend guide: `docs/frontend/guide.md`

## Tips for better results

- Ask for diffs scoped to a single file
- Request validation: "run type-check in your plan and summarize results"
- Prefer minimal changes and explain why
- If blocked by missing info, ask Copilot to infer safe defaults and proceed with assumptions noted

## Security reminders

- Do not paste real secrets into chat
- Use `firebase functions:config:set` for Stripe keys (see docs)
- Keep `.env` out of version control

## Troubleshooting

- If Copilot references files that don’t exist, point it to the correct paths shown above
- If commands fail, ask Copilot to show the expected output and common fixes
- See also: `docs/troubleshooting/common-issues.md`
