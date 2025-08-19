#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  connectFirestoreEmulator,
} from 'firebase/firestore';

// Initialize Firebase with emulator settings
const app = initializeApp({
  projectId: 'toolzhub-5014-31157',
});

const db = getFirestore(app);

// Connect to emulator
try {
  connectFirestoreEmulator(db, 'localhost', 8080);
} catch (error) {
  // Already connected
}

async function createTestData() {
  console.log('🔧 Creating test admin data for dashboard...');

  try {
    // Create user documents for the existing auth users
    const users = [
      {
        id: 'CqqvMa1kVuQRt6WAHyXhYHin9EV2',
        email: 'sayquanmclaurinwork@gmail.com',
        displayName: 'Sayquan Mclaurin',
        isAdmin: true,
        createdAt: new Date('2025-08-15T10:30:00Z'),
        qrCodesGenerated: 15,
        lastLogin: new Date('2025-08-19T07:30:00Z'),
      },
      {
        id: 'WeK0P7YrmUhAM1OJFTXAwMiq2Yw1',
        email: 'sayquanmclaurin@gmail.com',
        displayName: 'Sayquan Mclaurin',
        isAdmin: false,
        createdAt: new Date('2025-08-10T14:15:00Z'),
        qrCodesGenerated: 8,
        lastLogin: new Date('2025-08-18T16:45:00Z'),
      },
      {
        id: 'demo-user-1',
        email: 'demo1@example.com',
        displayName: 'Demo User 1',
        isAdmin: false,
        createdAt: new Date('2025-08-12T09:20:00Z'),
        qrCodesGenerated: 3,
        lastLogin: new Date('2025-08-17T11:30:00Z'),
      },
      {
        id: 'demo-user-2',
        email: 'demo2@example.com',
        displayName: 'Demo User 2',
        isAdmin: false,
        createdAt: new Date('2025-08-16T16:45:00Z'),
        qrCodesGenerated: 22,
        lastLogin: new Date('2025-08-19T08:15:00Z'),
      },
    ];

    // Create user documents
    for (const user of users) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✅ Created user: ${user.displayName} (${user.email})`);
    }

    // Create some sample blog posts
    const blogPosts = [
      {
        title: 'Getting Started with QR Codes',
        slug: 'getting-started-qr-codes',
        excerpt: 'Learn the basics of QR code generation and best practices.',
        content:
          'QR codes are a powerful tool for bridging the physical and digital worlds...',
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-15T10:00:00Z'),
        createdAt: new Date('2025-08-15T10:00:00Z'),
        updatedAt: new Date('2025-08-15T10:00:00Z'),
        featured: true,
        published: true,
        tags: ['qr-codes', 'beginner', 'tutorial'],
        category: 'Tutorial',
        readTime: 5,
        views: 245,
      },
      {
        title: 'Advanced QR Code Customization',
        slug: 'advanced-qr-customization',
        excerpt:
          'Customize your QR codes with colors, logos, and advanced features.',
        content:
          'Take your QR codes to the next level with custom styling and branding...',
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-17T14:30:00Z'),
        createdAt: new Date('2025-08-17T14:30:00Z'),
        updatedAt: new Date('2025-08-17T14:30:00Z'),
        featured: false,
        published: true,
        tags: ['qr-codes', 'customization', 'branding'],
        category: 'Advanced',
        readTime: 8,
        views: 156,
      },
      {
        title: 'QR Codes for Marketing Campaigns',
        slug: 'qr-codes-marketing',
        excerpt: 'How to effectively use QR codes in your marketing strategy.',
        content:
          'QR codes can significantly boost engagement in marketing campaigns...',
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-18T09:15:00Z'),
        createdAt: new Date('2025-08-18T09:15:00Z'),
        updatedAt: new Date('2025-08-18T09:15:00Z'),
        featured: true,
        published: true,
        tags: ['qr-codes', 'marketing', 'strategy'],
        category: 'Business',
        readTime: 12,
        views: 89,
      },
    ];

    // Create blog posts
    for (const post of blogPosts) {
      await addDoc(collection(db, 'blog'), post);
      console.log(`✅ Created blog post: ${post.title}`);
    }

    // Create some analytics data
    const analyticsEvents = [
      {
        type: 'qr_generation',
        timestamp: new Date('2025-08-19T07:30:00Z'),
        userId: 'CqqvMa1kVuQRt6WAHyXhYHin9EV2',
        data: { qrType: 'url', hasLogo: true },
      },
      {
        type: 'page_view',
        timestamp: new Date('2025-08-19T07:25:00Z'),
        path: '/generate',
        userId: 'WeK0P7YrmUhAM1OJFTXAwMiq2Yw1',
      },
      {
        type: 'qr_generation',
        timestamp: new Date('2025-08-19T06:45:00Z'),
        userId: 'demo-user-2',
        data: { qrType: 'wifi', hasLogo: false },
      },
      {
        type: 'page_view',
        timestamp: new Date('2025-08-19T06:30:00Z'),
        path: '/blog',
        userId: null, // anonymous
      },
    ];

    // Create analytics events
    for (const event of analyticsEvents) {
      await addDoc(collection(db, 'analytics'), event);
      console.log(`✅ Created analytics event: ${event.type}`);
    }

    console.log('🎉 Test admin data created successfully!');
    console.log('📊 Summary:');
    console.log(`  - ${users.length} users`);
    console.log(`  - ${blogPosts.length} blog posts`);
    console.log(`  - ${analyticsEvents.length} analytics events`);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createTestData();
