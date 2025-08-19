import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase config (using the same config as your app)
const firebaseConfig = {
  apiKey: 'AIzaSyDvKKBaVqsf6fVjClUF5FNCOGVp8p8UQo8',
  authDomain: 'toolzhub-45dd3.firebaseapp.com',
  projectId: 'toolzhub-45dd3',
  storageBucket: 'toolzhub-45dd3.firebasestorage.app',
  messagingSenderId: '484630524587',
  appId: '1:484630524587:web:83d5de62a6e3e6c6e6b1c4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleBlogPosts = [
  {
    title: 'Getting Started with QR Codes',
    slug: 'getting-started-with-qr-codes',
    excerpt:
      'Learn the basics of QR codes and how they can revolutionize your business marketing strategy.',
    content: `# Getting Started with QR Codes

QR codes have become an essential tool for modern businesses. They bridge the gap between physical and digital worlds, providing instant access to information.

## What are QR Codes?

QR (Quick Response) codes are two-dimensional barcodes that can store various types of information, from URLs to contact details.

## Benefits for Businesses

- **Instant Access**: Customers can quickly access your content
- **Cost-Effective**: No need for expensive printing of URLs
- **Trackable**: Monitor engagement and analytics
- **Versatile**: Use for menus, promotions, contact info, and more

## Getting Started

1. Choose your content type
2. Generate your QR code
3. Test it thoroughly
4. Deploy and monitor performance

Start creating QR codes today and see the difference they can make!`,
    category: 'Tutorial',
    tags: ['qr-codes', 'marketing', 'business', 'tutorial'],
    author: 'Admin',
    status: 'published',
    featured: true,
    seoTitle: "QR Code Tutorial: Complete Beginner's Guide 2025",
    seoDescription:
      'Master QR codes with our comprehensive guide. Learn creation, best practices, and business applications.',
    seoKeywords: ['qr codes', 'tutorial', 'marketing', 'business tools'],
    readTime: 5,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: '10 Creative QR Code Marketing Ideas',
    slug: 'creative-qr-code-marketing-ideas',
    excerpt:
      'Discover innovative ways to use QR codes in your marketing campaigns that will engage and delight your customers.',
    content: `# 10 Creative QR Code Marketing Ideas

QR codes aren't just for restaurant menus anymore. Here are 10 creative ways to use them in your marketing:

## 1. Interactive Product Packaging
Add QR codes to product packaging that lead to:
- Assembly instructions
- Recipe ideas
- Care instructions
- Customer reviews

## 2. Event Check-ins
Streamline event registration and check-ins with QR codes that:
- Verify attendee information
- Provide event schedules
- Connect to networking platforms

## 3. Social Media Integration
Use QR codes to:
- Increase followers
- Share user-generated content
- Launch social media contests

## 4. Location-Based Content
Create location-specific QR codes for:
- City tours
- Museum exhibits
- Real estate showings
- Store-specific promotions

## 5. Personalized Customer Experiences
Generate unique QR codes for:
- Loyalty program access
- Personalized offers
- Customer feedback surveys

And 5 more innovative ideas to boost your marketing game!`,
    category: 'Marketing',
    tags: ['qr-codes', 'marketing', 'creativity', 'business'],
    author: 'Marketing Team',
    status: 'published',
    featured: false,
    seoTitle: '10 Creative QR Code Marketing Ideas That Actually Work',
    seoDescription:
      'Boost your marketing with these 10 proven QR code strategies. Real examples and actionable tips included.',
    seoKeywords: [
      'qr code marketing',
      'creative marketing',
      'digital marketing',
      'customer engagement',
    ],
    readTime: 8,
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: 'QR Code Analytics: Measuring Success',
    slug: 'qr-code-analytics-measuring-success',
    excerpt:
      'Learn how to track and measure the performance of your QR code campaigns with detailed analytics.',
    content: `# QR Code Analytics: Measuring Success

Understanding your QR code performance is crucial for optimizing your campaigns and maximizing ROI.

## Key Metrics to Track

### 1. Scan Rate
- Total number of scans
- Unique vs. repeat scans
- Scan rate over time

### 2. Geographic Data
- Location of scans
- Regional performance differences
- Location-based insights

### 3. Device Information
- Mobile vs. desktop
- Operating system breakdown
- Device model analytics

### 4. Time-Based Analytics
- Peak scanning hours
- Day of week patterns
- Seasonal trends

## Setting Up Analytics

1. **Choose the Right Platform**: Select a QR code generator with robust analytics
2. **Define Your Goals**: Know what success looks like
3. **Track Conversions**: Monitor what happens after the scan
4. **Regular Monitoring**: Check your data weekly

## Optimization Strategies

- A/B test different QR code designs
- Test various call-to-action phrases
- Experiment with placement locations
- Adjust campaigns based on data insights

## ROI Calculation

Calculate your QR code ROI by comparing:
- Campaign costs vs. generated revenue
- Time saved vs. manual processes
- Customer acquisition costs

Start tracking today and turn your QR codes into data-driven marketing tools!`,
    category: 'Analytics',
    tags: ['analytics', 'qr-codes', 'metrics', 'roi'],
    author: 'Data Team',
    status: 'published',
    featured: true,
    seoTitle: 'QR Code Analytics Guide: Track Performance & ROI',
    seoDescription:
      'Master QR code analytics with our comprehensive guide. Learn to track scans, measure ROI, and optimize campaigns.',
    seoKeywords: [
      'qr code analytics',
      'performance tracking',
      'marketing metrics',
      'roi',
    ],
    readTime: 6,
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    title: 'Restaurant QR Code Menus: Best Practices',
    slug: 'restaurant-qr-code-menus-best-practices',
    excerpt:
      'Everything restaurants need to know about implementing QR code menus effectively and safely.',
    content: `# Restaurant QR Code Menus: Best Practices

The restaurant industry has embraced QR code menus as a contactless solution. Here's how to implement them effectively.

## Why QR Code Menus?

### Benefits
- **Contactless Experience**: Safer for customers and staff
- **Easy Updates**: Change prices and items instantly
- **Cost Savings**: No printing costs for menu changes
- **Enhanced Features**: Add photos, allergen info, nutritional data

### Customer Advantages
- No physical menu handling
- Zoom in for better readability
- Translate to different languages
- Direct ordering capabilities

## Implementation Best Practices

### 1. Design Considerations
- Use high contrast colors
- Ensure adequate size (minimum 2x2 inches)
- Include instructions for first-time users
- Provide fallback options

### 2. Technical Requirements
- Mobile-optimized menu design
- Fast loading times
- Works on all devices
- Reliable internet connection

### 3. Customer Support
- Staff training on QR code assistance
- Physical menus for backup
- Clear scanning instructions
- Help for customers without smartphones

## Common Mistakes to Avoid

- QR codes that are too small
- Poor internet connectivity
- Complicated menu navigation
- No staff training
- Missing backup options

## Future Trends

- Integration with ordering systems
- Personalized recommendations
- Loyalty program integration
- Multi-language support

Make your restaurant's QR code menu a success with these proven strategies!`,
    category: 'Industry',
    tags: ['restaurants', 'qr-codes', 'menus', 'hospitality'],
    author: 'Industry Expert',
    status: 'published',
    featured: false,
    seoTitle: 'Restaurant QR Code Menus: Complete Implementation Guide',
    seoDescription:
      'Learn how to implement QR code menus in your restaurant. Best practices, common mistakes, and customer tips.',
    seoKeywords: [
      'restaurant qr codes',
      'digital menus',
      'contactless dining',
      'restaurant technology',
    ],
    readTime: 7,
    publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    title: 'QR Code Security: Protecting Your Business',
    slug: 'qr-code-security-protecting-business',
    excerpt:
      'Learn about QR code security risks and how to protect your business and customers from malicious attacks.',
    content: `# QR Code Security: Protecting Your Business

While QR codes offer convenience, they also present security risks. Here's how to protect your business and customers.

## Common QR Code Security Risks

### 1. QR Code Hijacking
- Malicious codes replacing legitimate ones
- Redirects to phishing websites
- Malware downloads

### 2. Data Collection Risks
- Unauthorized tracking
- Privacy violations
- Personal information theft

### 3. Social Engineering
- Fake promotional offers
- Fraudulent payment requests
- Identity theft attempts

## Protection Strategies

### For Businesses

1. **Use Secure QR Code Generators**
   - Choose reputable platforms
   - Enable security features
   - Regular security audits

2. **Monitor Your QR Codes**
   - Regular scanning tests
   - Track analytics for anomalies
   - Update codes when compromised

3. **Educate Your Team**
   - Staff training on security
   - Incident response procedures
   - Regular security updates

### For Customers

1. **Verify Sources**
   - Only scan codes from trusted sources
   - Check the destination URL
   - Be cautious with personal information

2. **Use Security Apps**
   - QR scanners with security features
   - Preview URLs before visiting
   - Antivirus protection

## Best Security Practices

- **Regular Updates**: Keep QR code software updated
- **Access Controls**: Limit who can create/modify codes
- **Encryption**: Use encrypted connections (HTTPS)
- **Monitoring**: Track unusual activity patterns

## Red Flags to Watch For

- Unexpected app download requests
- Requests for sensitive information
- Suspicious URLs or domains
- Poor quality or damaged QR codes

## Creating a Security Policy

1. Define acceptable QR code uses
2. Establish creation and approval processes
3. Implement monitoring procedures
4. Create incident response plans

Stay secure while enjoying the benefits of QR code technology!`,
    category: 'Security',
    tags: ['security', 'qr-codes', 'cybersecurity', 'protection'],
    author: 'Security Team',
    status: 'published',
    featured: true,
    seoTitle: 'QR Code Security Guide: Protect Your Business from Threats',
    seoDescription:
      'Comprehensive QR code security guide. Learn about risks, protection strategies, and best practices for businesses.',
    seoKeywords: [
      'qr code security',
      'cybersecurity',
      'business protection',
      'digital security',
    ],
    readTime: 9,
    publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

async function createBlogPosts() {
  console.log('🚀 Starting to create sample blog posts...');

  try {
    for (let i = 0; i < sampleBlogPosts.length; i++) {
      const post = sampleBlogPosts[i];
      console.log(
        `📝 Creating post ${i + 1}/${sampleBlogPosts.length}: "${post.title}"`
      );

      const docRef = await addDoc(collection(db, 'blog'), {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      });

      console.log(`✅ Created post with ID: ${docRef.id}`);
    }

    console.log('🎉 All blog posts created successfully!');
    console.log('📊 Summary:');
    console.log(`   - Total posts: ${sampleBlogPosts.length}`);
    console.log(
      `   - Categories: ${[
        ...new Set(sampleBlogPosts.map((p) => p.category)),
      ].join(', ')}`
    );
    console.log(
      `   - Featured posts: ${sampleBlogPosts.filter((p) => p.featured).length}`
    );
  } catch (error) {
    console.error('❌ Error creating blog posts:', error);
  }
}

// Run the script
createBlogPosts();
