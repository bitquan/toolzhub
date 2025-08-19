# QR Features

Supported types: url, wifi, vcard, sms, email, text, phone, whatsapp, location.

Core service: `src/services/qrcode.ts` provides:

- `generateQRData(type, data)`
- `generateQRCode(type, data, settings)` -> Data URL (PNG)
- `generateQRCodeSVG(type, data, settings)` -> SVG markup
- `validateQRData(type, data)` -> validation result

UI: `src/pages/QRGenerator.tsx` contains the creation UI and download/copy actions.
