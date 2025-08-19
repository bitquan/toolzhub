# QR Code Generator

## 📱 Overview

The QR Code Generator is the core feature of ToolzHub, providing users with comprehensive QR code creation capabilities with Free and Pro tier restrictions.

## 🎯 Features

### Free Tier QR Types

- **Website URL** 🌐 - Generate QR codes for web links
- **Plain Text** 📝 - Create QR codes with custom text content
- **Phone Number** 📞 - Generate QR codes for phone calls

### Pro Tier QR Types

- **WiFi Network** 📶 - Share WiFi credentials securely
- **Contact Card (vCard)** 👤 - Professional contact information
- **SMS Message** 💬 - Pre-filled SMS with phone and message
- **Email** 📧 - Email composition with subject and body
- **WhatsApp** 💚 - Direct WhatsApp chat initiation
- **Location** 📍 - GPS coordinates and location sharing

## 📊 Usage Limits

| Plan | QR Codes/Month | Available Types | Custom Settings        |
| ---- | -------------- | --------------- | ---------------------- |
| Free | 5 QR codes     | 3 basic types   | Standard customization |
| Pro  | Unlimited      | All 9 types     | Full customization     |

## 🎨 Customization Options

### Size Options

- Small (200x200px)
- Medium (300x300px) - Default
- Large (400x400px)
- Extra Large (500x500px)

### Color Customization

- **Foreground Color**: QR code pattern color (default: black)
- **Background Color**: QR code background color (default: white)

### Error Correction Levels

- **L (Low)**: ~7% recovery capability
- **M (Medium)**: ~15% recovery capability - Default
- **Q (Quartile)**: ~25% recovery capability
- **H (High)**: ~30% recovery capability

### Margin Settings

- Adjustable margin around QR code (0-10 pixels)

## 🔒 Free vs Pro Restrictions

### Visual Indicators

- Pro features display **"PRO"** badges
- Disabled state for Pro features when user is on Free plan
- Usage counter shows progress toward monthly limit

### Access Control

- Pro QR types are disabled for Free users
- Usage limits enforced before generation
- Upgrade prompts integrated throughout the interface

### Upgrade Flow

- Multiple upgrade touchpoints in the UI
- Direct integration with Stripe checkout
- Seamless upgrade process via subscription service

## 💡 QR Type Details

### 🌐 Website URL

**Purpose**: Direct users to websites
**Content Fields**:

- Website URL (required)

**Validation**:

- Valid URL format required
- HTTPS recommended for security

---

### 📝 Plain Text

**Purpose**: Share text information
**Content Fields**:

- Text content (multi-line supported)

**Use Cases**:

- Messages, quotes, instructions
- Contact information
- Product descriptions

---

### 📞 Phone Number

**Purpose**: Initiate phone calls
**Content Fields**:

- Phone number with country code

**Format**: International format recommended (+1234567890)

---

### 📶 WiFi Network (Pro)

**Purpose**: Share WiFi credentials
**Content Fields**:

- Network Name (SSID) - required
- Password - required for secured networks
- Security Type: WPA2, WPA, WEP, or No Password

**User Experience**:

- Automatic connection on scan
- No manual password entry required

---

### 👤 Contact Card - vCard (Pro)

**Purpose**: Share professional contact information
**Content Fields**:

- First Name & Last Name - required
- Phone Number - recommended
- Email Address - recommended
- Organization - optional
- Website URL - optional

**Format**: Standard vCard 3.0 format
**Compatibility**: Works with all modern contact apps

---

### 💬 SMS Message (Pro)

**Purpose**: Pre-filled SMS messaging
**Content Fields**:

- Phone Number - required
- Message content - optional

**Behavior**: Opens SMS app with pre-filled recipient and message

---

### 📧 Email (Pro)

**Purpose**: Email composition assistance
**Content Fields**:

- Email Address - required
- Subject - optional
- Message Body - optional

**Behavior**: Opens default email client with pre-filled content

---

### 💚 WhatsApp (Pro)

**Purpose**: Direct WhatsApp messaging
**Content Fields**:

- Phone Number with country code - required
- Pre-filled message - optional

**Behavior**: Opens WhatsApp with prepared conversation

---

### 📍 Location (Pro)

**Purpose**: Share geographical locations
**Content Fields**:

- Latitude - required (decimal degrees)
- Longitude - required (decimal degrees)
- Location Name - optional

**Tip**: Get coordinates from Google Maps by right-clicking

## 🛠️ Technical Implementation

### Component Structure

```
QRGenerator.tsx
├── Type Selection Grid
├── Pro Upgrade Prompt
├── Content Input Forms
├── Customization Settings
└── QR Code Display & Actions
```

### State Management

- Local state for QR data and settings
- Auth context for user subscription status
- User data context for usage tracking

### Services Integration

- **QRCodeService**: QR generation and validation
- **SubscriptionService**: Pro upgrade handling
- **Analytics**: Usage tracking and metrics

## 🧪 Testing

### Manual Testing Checklist

- [ ] All QR types generate valid codes
- [ ] Free vs Pro restrictions work correctly
- [ ] Usage limits are enforced
- [ ] Upgrade flow functions properly
- [ ] Generated QR codes scan correctly on mobile devices

### Validation Testing

- [ ] URL validation for website QRs
- [ ] Phone number format validation
- [ ] Email address validation
- [ ] Coordinate range validation for locations

## 🚀 Future Enhancements

### Planned Features

- **Batch QR Generation**: Create multiple QR codes at once
- **QR Analytics**: Track scan statistics
- **Custom Branding**: Logo overlay for Pro users
- **Export Formats**: PDF, SVG, PNG batch export
- **QR Templates**: Pre-designed QR code styles

### Advanced Customization

- **Logo Integration**: Brand logos in QR codes
- **Color Gradients**: Advanced color schemes
- **Shape Customization**: Rounded corners, custom patterns
- **Frame Options**: Decorative frames and borders

## 📱 Mobile Optimization

### Responsive Design

- Touch-friendly interface on mobile devices
- Optimized input forms for mobile keyboards
- Proper zoom levels for QR code viewing

### Mobile-Specific Features

- Camera integration for testing generated QRs
- Native app detection for better UX
- Optimized file sharing for mobile

## 🔍 SEO & Discovery

### QR Type Landing Pages

Each QR type could have dedicated landing pages for SEO:

- `/qr/wifi` - WiFi QR Generator
- `/qr/vcard` - Business Card QR Generator
- `/qr/location` - Location QR Generator

### Content Marketing

- How-to guides for each QR type
- Best practices for QR code usage
- Industry-specific QR code solutions

## 📈 Analytics Integration

### User Behavior Tracking

- QR type popularity metrics
- Conversion rates (Free to Pro)
- Usage patterns and trends

### Performance Metrics

- Generation success rates
- Error frequencies by type
- User satisfaction scores

---

_Last Updated: August 19, 2025_
_Version: 2.0 - Free vs Pro Implementation_
