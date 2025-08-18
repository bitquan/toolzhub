# Toolz.space - Professional QR Code Generator

A complete QR code generator application built with React, TypeScript, Firebase, and Stripe. Create, customize, and track QR codes with advanced analytics and subscription management.

## Features

### 🎯 QR Code Types
- **Website URLs** - Direct links to websites
- **WiFi Networks** - Share WiFi credentials securely
- **Contact Cards (vCard)** - Digital business cards
- **SMS Messages** - Pre-filled text messages
- **Email** - Email with subject and body
- **Plain Text** - Any text content
- **Phone Numbers** - Direct dial numbers
- **WhatsApp** - WhatsApp messages
- **Location/GPS** - Geographic coordinates

### 💎 Subscription Tiers
- **Free Tier**: 5 QR codes/month, basic customization, PNG downloads
- **Pro Tier ($2.99/month)**: Unlimited QR codes, advanced customization, logo embedding, multiple formats (PNG/SVG/PDF), analytics & tracking

### 🎨 Customization Options
- Custom colors (foreground/background)
- Logo embedding (Pro users)
- Multiple sizes (200px to 2000px)
- Error correction levels
- Multiple download formats

### 📊 Analytics & Tracking (Pro)
- Real-time scan tracking
- Geographic insights
- Device and browser analytics
- Historical scan data with charts
- Short URL generation for tracking

### 🔐 Authentication & Security
- Firebase Authentication (Email/Password + Google OAuth)
- Secure user data isolation
- Protected routes and API endpoints
- GDPR-compliant data handling

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend
- **Firebase Authentication** for user management
- **Firestore** for database
- **Firebase Functions** for serverless backend
- **Firebase Storage** for file uploads
- **Firebase Hosting** for deployment

### Payment Processing
- **Stripe** for subscription management
- Secure webhook handling
- Customer portal integration

### QR Code Generation
- **qrcode** library for QR generation
- **html2canvas** for image conversion
- **jspdf** for PDF export
- Support for all major QR code types

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Common/         # Shared UI components
│   ├── Dashboard/      # Dashboard components
│   └── QRGenerator/    # QR generation components
├── pages/              # Route components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Helper functions
└── types/              # TypeScript definitions

functions/
└── src/
    ├── stripe/         # Payment processing
    ├── analytics/      # Scan tracking
    └── qr/            # QR generation logic
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bitquan/toolzhub.git
   cd toolzhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up Firebase**
   ```bash
   firebase login
   firebase init
   ```
   Select:
   - Firestore
   - Functions
   - Hosting
   - Storage

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase and Stripe configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... etc
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

5. **Start development servers**
   ```bash
   # Start Firebase emulators
   npm run firebase:emulators

   # In another terminal, start the frontend
   npm run dev
   ```

### Development

#### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

#### Firebase Functions
- `npm run functions:build` - Build functions
- `npm run functions:deploy` - Deploy functions

#### Deployment
```bash
npm run build
firebase deploy
```

## Configuration

### Firebase Security Rules

The application includes comprehensive Firestore and Storage security rules:
- Users can only access their own data
- QR codes are isolated per user
- Anonymous scan tracking is allowed
- Public QR code access for scanning

### Stripe Integration

Set up your Stripe products and webhooks:
1. Create a Pro subscription product in Stripe
2. Configure webhook endpoints for subscription events
3. Set environment variables for Stripe keys

### Custom Domain

To use with your custom domain:
1. Add your domain in Firebase Hosting
2. Update CORS settings
3. Configure Stripe webhook URLs
4. Update environment variables

## Features Roadmap

### Phase 1 (Current)
- ✅ Basic QR code generation
- ✅ User authentication
- ✅ Subscription management
- ✅ Basic customization

### Phase 2
- [ ] Advanced analytics dashboard
- [ ] Bulk QR code generation
- [ ] API access for Pro users
- [ ] Team collaboration features

### Phase 3
- [ ] White-label solutions
- [ ] Advanced branding options
- [ ] Integration with marketing tools
- [ ] Enterprise features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@toolz.space
- 🐛 Issues: [GitHub Issues](https://github.com/bitquan/toolzhub/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/bitquan/toolzhub/discussions)

## Acknowledgments

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) for QR code generation
- [Firebase](https://firebase.google.com/) for backend services
- [Stripe](https://stripe.com/) for payment processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons