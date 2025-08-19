# Firebase Configuration

Key files:

- `firebase.json`: hosting, functions, firestore, storage, emulators
- `firestore.rules`: security rules
- `firestore.indexes.json`: index config
- `storage.rules`: storage rules

Emulators (ports): Auth 9099, Firestore 8080, Functions 5001, Storage 9199, UI 4000.

Rules highlights:

- Users can read/write only their own `users/{uid}` doc
- `qrcodes/{id}` locked to owner
- `analytics/{id}` allows create (anonymous scan tracking)
- Public reads for `public_qr/{qrCodeId}`

Start emulators: `npm run firebase:emulators`.
