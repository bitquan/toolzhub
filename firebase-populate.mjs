#!/usr/bin/env node

// Simple Firebase Blog Population Script
// This script adds sample blog data directly to Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Import your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyBXUrPWjn7R0eQPGJKnF3gNFnX6WcS3Gzw',
  authDomain: 'toolzhub-5014-31157.firebaseapp.com',
  projectId: 'toolzhub-5014-31157',
  storageBucket: 'toolzhub-5014-31157.firebasestorage.app',
  messagingSenderId: '728726037848',
  appId: '1:728726037848:web:a7b5f25e6b01dd6f7e8daa',
  measurementId: 'G-SY7Q42LDX7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  {
    name: 'Business',
    slug: 'business',
    description: 'QR codes for business growth and marketing',
    color: '#3B82F6',
  },
  {
    name: 'Tutorial',
    slug: 'tutorial',
    description: 'Step-by-step guides and how-tos',
    color: '#10B981',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech trends and innovations',
    color: '#8B5CF6',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Design tips and best practices',
    color: '#F59E0B',
  },
];

const posts = [
  {
    title: 'How QR Codes Are Revolutionizing Business Marketing in 2024',
    slug: 'qr-codes-business-marketing-2024',
    excerpt:
      'Discover why QR codes have become essential for modern businesses and how to implement them effectively for maximum customer engagement and ROI.',
    content: `# How QR Codes Are Revolutionizing Business Marketing in 2024

QR codes have evolved from a simple convenience tool to a cornerstone of modern digital marketing strategy. In 2024, they're not just black and white squares—they're powerful gateways to customer engagement.

## Why QR Codes Are Essential Now

### Post-Pandemic Consumer Behavior
- **Contactless preference**: 73% of consumers prefer contactless interactions
- **Mobile-first mindset**: Average person checks phone 96 times daily
- **Instant gratification**: Users expect immediate access to information

### Marketing Performance Revolution
- **Higher engagement**: QR campaigns see 25% higher engagement than traditional methods
- **Better tracking**: Real-time analytics show exactly what works
- **Cost efficiency**: 90% cheaper than printed materials with updates

## Practical Implementation Strategies

### Restaurant & Hospitality
- Digital menus that update in real-time
- Table ordering systems
- Customer feedback collection
- Loyalty program enrollment

### Retail & E-commerce
- Product information and reviews
- Inventory checking and restocking alerts
- Exclusive discount campaigns
- Social media integration

QR codes aren't just a trend—they're the bridge between physical and digital experiences. Businesses that master them now will have a significant competitive advantage.

*Ready to create your first QR code campaign? Start with our free QR generator and see the difference professional QR codes can make.*`,
    author: 'ToolzHub Marketing Team',
    publishedAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15'),
    category: 'Business',
    tags: ['QR Codes', 'Marketing', 'Business Growth', 'Digital Strategy'],
    featured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&auto=format',
    readTime: 7,
    status: 'published',
  },

  {
    title:
      'The Complete Guide to QR Code Types: Choose the Right One for Your Needs',
    slug: 'complete-guide-qr-code-types-2024',
    excerpt:
      'From URLs to WiFi passwords, discover all 9 QR code types and learn exactly when and how to use each one for maximum effectiveness.',
    content: `# The Complete Guide to QR Code Types: Choose the Right One for Your Needs

Not all QR codes are created equal. Understanding the different types and their specific use cases can dramatically improve your campaigns' effectiveness and user experience.

## URL QR Codes
**Best for**: Driving traffic to websites, landing pages, social media

### When to Use:
- Product launches and campaigns
- Event registration pages
- Social media profile sharing
- Menu and catalog access

### Pro Tips:
- Use URL shorteners for cleaner QR codes
- Track clicks with UTM parameters
- Ensure mobile-optimized landing pages
- A/B test different destination pages

## vCard QR Codes
**Best for**: Networking, business cards, contact sharing

### What's Included:
- Name and title
- Phone numbers (mobile, work, home)
- Email addresses
- Company information
- Website and social media
- Physical address

### Business Applications:
- **Trade Shows**: Instant contact exchange
- **Business Cards**: Always up-to-date information
- **Email Signatures**: Easy contact saving
- **Networking Events**: Quick professional connections

Ready to implement the perfect QR code type for your needs? Start creating professional QR codes with our free generator!`,
    author: 'ToolzHub Technical Team',
    publishedAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-12'),
    category: 'Tutorial',
    tags: ['QR Codes', 'Tutorial', 'Guide', 'Types'],
    featured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop&auto=format',
    readTime: 8,
    status: 'published',
  },
];

async function populateFirestore() {
  try {
    console.log('🚀 Starting Firebase population...');

    // Add categories
    console.log('📁 Adding categories...');
    for (const category of categories) {
      await setDoc(doc(db, 'blog_categories', category.slug), category);
      console.log(`✅ Added category: ${category.name}`);
    }

    // Add posts
    console.log('📝 Adding blog posts...');
    for (const post of posts) {
      await setDoc(doc(db, 'blog', post.slug), post);
      console.log(`✅ Added post: ${post.title}`);
    }

    console.log('🎉 Successfully populated Firebase with blog data!');
    console.log('👀 Check your Firebase console to see the data');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating Firebase:', error);
    process.exit(1);
  }
}

populateFirestore();
