# Authentication

Firebase Auth with email/password and Google Sign-In.

Context: `src/contexts/AuthContext.tsx`

- Creates `users/{uid}` doc on first sign-in
- Provides `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `resetPassword`, `updateProfile`
- Guards routes via `components/Auth/ProtectedRoute.tsx`
