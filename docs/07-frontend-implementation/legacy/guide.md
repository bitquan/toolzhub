# Frontend Guide

- Entrypoint: `src/main.tsx`, root component `src/App.tsx`
- Routing: React Router with protected routes via `components/Auth/ProtectedRoute.tsx`
- Auth: `contexts/AuthContext.tsx` wires Firebase Auth and a `users/{uid}` doc
- QR generation: `services/qrcode.ts` + `pages/QRGenerator.tsx`
- Styling: Tailwind (config in `tailwind.config.js`, CSS in `src/index.css`)

Dev:

- `npm run dev` launches Vite dev server on port 3000
- Environment variables via Vite (VITE\_\*).
