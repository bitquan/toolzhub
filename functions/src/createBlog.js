// Add this to your Firebase Functions to create blog data
const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const samplePosts = [
  {
    id: 'qr-codes-for-business',
    title: 'How QR Codes Can Transform Your Business Marketing',
    slug: 'qr-codes-for-business',
    excerpt:
      'Discover how QR codes are revolutionizing business marketing and customer engagement in 2025.',
    content: `# How QR Codes Can Transform Your Business Marketing

QR codes have evolved from a novelty to a necessity in modern business marketing. Here's how you can leverage them:

## 1. Contactless Interactions
In our post-pandemic world, contactless interactions are more important than ever. QR codes enable:
- Menu viewing in restaurants  
- Product information access
- Payment processing
- Event check-ins

## 2. Enhanced Customer Experience
- **Instant Access**: Customers can quickly access information without typing URLs
- **Mobile-First**: Perfect for smartphone users
- **Seamless Integration**: Works across all platforms and devices

## 3. Marketing Analytics
Modern QR code generators provide detailed analytics:
- Scan counts and locations
- Device and browser information  
- Time-based usage patterns
- Conversion tracking

## Best Practices
1. **Keep URLs Short**: Use QR codes for clean, professional links
2. **Test Thoroughly**: Always test your QR codes before printing
3. **Provide Context**: Tell users what they'll get when they scan
4. **Design Matters**: Ensure sufficient contrast and size

Start transforming your business today with professional QR codes that track performance and engage customers effectively.`,
    author: 'ToolzHub Team',
    publishedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-15')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-15')),
    category: 'Business',
    tags: ['QR Codes', 'Marketing', 'Business Growth'],
    featured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    readTime: 5,
    status: 'published',
  },
  {
    id: 'qr-code-types-guide',
    title: 'Complete Guide to QR Code Types and Use Cases',
    slug: 'qr-code-types-guide',
    excerpt:
      'Learn about different types of QR codes and when to use each one for maximum impact.',
    content: `# Complete Guide to QR Code Types and Use Cases

QR codes aren't just for URLs anymore. Modern QR code generators support multiple data types, each with specific use cases:

## URL QR Codes
The most common type, perfect for:
- Website links
- Landing pages
- Social media profiles
- Online menus

## vCard QR Codes  
Share contact information instantly:
- Business cards
- Email signatures
- Networking events
- Directory listings

## WiFi QR Codes
Simplify network access:
- Guest networks
- Cafes and restaurants
- Hotels and events
- Office spaces

## SMS & WhatsApp QR Codes
Enable instant messaging:
- Customer support
- Marketing campaigns
- Event coordination
- Quick feedback

## Email QR Codes
Streamline communication:
- Pre-filled contact forms
- Support requests
- Newsletter signups
- Feedback collection

## Location QR Codes
Share geographic information:
- Business addresses
- Event venues
- Delivery locations
- Tourist attractions

## Phone QR Codes
Enable one-tap calling:
- Customer service
- Sales inquiries
- Emergency contacts
- Appointment booking

## Text QR Codes
Share static information:
- Product details
- Instructions
- Announcements
- Specifications

## Best Practices for Each Type
- **Keep it relevant**: Match the QR code type to your specific use case
- **Test regularly**: Ensure all information is current and accessible
- **Provide value**: Make scanning worthwhile for users
- **Track performance**: Monitor which types work best for your audience

Choose the right QR code type for your needs and start engaging customers more effectively today.`,
    author: 'ToolzHub Team',
    publishedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-10')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-10')),
    category: 'Tutorial',
    tags: ['QR Codes', 'Tutorial', 'Guide'],
    featured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
    readTime: 7,
    status: 'published',
  },
  {
    id: 'qr-codes-future-trends',
    title: 'QR Code Trends to Watch in 2025',
    slug: 'qr-codes-future-trends',
    excerpt:
      'Explore the latest QR code innovations and trends shaping the future of digital interactions.',
    content: `# QR Code Trends to Watch in 2025

The QR code landscape is evolving rapidly. Here are the key trends defining 2025:

## 1. Dynamic QR Codes
Static QR codes are being replaced by dynamic versions that offer:
- Real-time content updates
- Advanced analytics
- A/B testing capabilities
- Campaign management

## 2. AI-Powered Analytics
Modern QR code platforms integrate AI for:
- Predictive scanning patterns
- Automated campaign optimization
- Intelligent content recommendations
- Behavioral analysis

## 3. Enhanced Security
Security features are becoming standard:
- Encrypted data transmission
- Anti-fraud protection
- Access control
- Privacy compliance

## 4. Interactive Experiences
QR codes now enable:
- Augmented reality experiences
- Interactive product demos
- Gamified marketing
- Personalized content

## 5. Integration with IoT
QR codes are connecting with:
- Smart devices
- IoT sensors
- Automated systems
- Real-time data feeds

## 6. Sustainability Focus
Eco-friendly applications include:
- Digital receipts
- Paperless transactions
- Sustainable packaging
- Carbon footprint tracking

## 7. Advanced Customization
Design options now include:
- Brand-specific styling
- Logo integration
- Color customization
- Shape variations

## The Future is Bright
QR codes are no longer just black and white squares. They're becoming powerful tools for digital transformation, customer engagement, and business growth.

Stay ahead of the curve by adopting these trends in your QR code strategy today.`,
    author: 'ToolzHub Team',
    publishedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-05')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-05')),
    category: 'Technology',
    tags: ['Trends', 'Innovation', 'Future'],
    featured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    readTime: 6,
    status: 'published',
  },
  {
    id: 'qr-code-design-tips',
    title: 'QR Code Design: Making Them Beautiful and Functional',
    slug: 'qr-code-design-tips',
    excerpt:
      'Learn how to create visually appealing QR codes that maintain functionality and drive engagement.',
    content: `# QR Code Design: Making Them Beautiful and Functional

Gone are the days of boring black and white QR codes. Here's how to create stunning, functional QR codes:

## Design Principles

### 1. Contrast is Key
- Maintain sufficient contrast between foreground and background
- Test readability in different lighting conditions
- Avoid low-contrast color combinations

### 2. Size Matters
- Minimum size: 2cm x 2cm for print
- Scale appropriately for viewing distance
- Consider the scanning environment

### 3. Error Correction
- Use high error correction for decorative designs
- Test extensively after customization
- Balance aesthetics with functionality

## Customization Options

### Colors
- Use your brand colors
- Ensure dark-on-light contrast
- Test with multiple QR code readers

### Logos
- Center placement works best
- Keep logos small (max 30% of QR code)
- Use vector graphics for clarity

### Frames and Borders
- Add branded frames
- Include call-to-action text
- Maintain scanning area integrity

## Best Practices

### Do:
- Test on multiple devices
- Use high-resolution images
- Provide clear instructions
- Brand consistently

### Don't:
- Invert colors (light on dark)
- Overcomplicate the design
- Forget to test functionality
- Ignore quiet zones

## Tools and Resources
- Professional QR code generators
- Brand guideline compliance
- A/B testing platforms
- Analytics integration

## Measuring Success
Track these metrics:
- Scan rates
- User engagement
- Conversion rates
- Brand recognition

Beautiful QR codes that work seamlessly create better user experiences and stronger brand connections.`,
    author: 'ToolzHub Team',
    publishedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-01')),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date('2025-08-01')),
    category: 'Design',
    tags: ['Design', 'Branding', 'User Experience'],
    featured: false,
    imageUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    readTime: 4,
    status: 'published',
  },
];

exports.createBlogData = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Creating blog posts...');

    for (const post of samplePosts) {
      await db.collection('blog').doc(post.id).set(post);
      console.log(`✓ Created post: ${post.title}`);
    }

    res.json({
      success: true,
      message: `Created ${samplePosts.length} blog posts successfully!`,
      posts: samplePosts.length,
    });
  } catch (error) {
    console.error('Error creating blog data:', error);
    res.status(500).json({ error: error.message });
  }
});
