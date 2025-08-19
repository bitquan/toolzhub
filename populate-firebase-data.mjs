import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'toolzhub-5014-31157',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id',
  measurementId: 'G-XXXXXXXXXX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators
try {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
} catch (error) {
  console.log('Emulators already connected or not available');
}

async function populateFirebaseData() {
  console.log('🔄 Populating Firebase with test data...');

  try {
    // Create sample users
    console.log('📝 Creating sample users...');

    const users = [
      {
        email: 'sayquanmclaurinwork@gmail.com',
        displayName: 'Sayquan Mclaurin',
        isAdmin: true,
        createdAt: new Date('2025-08-15T10:30:00Z'),
        qrCodesGenerated: 15,
        lastLogin: new Date(),
        subscription: { plan: 'pro', status: 'active' },
      },
      {
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        isAdmin: false,
        createdAt: new Date('2025-08-12T09:20:00Z'),
        qrCodesGenerated: 8,
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
        subscription: { plan: 'free', status: 'active' },
      },
      {
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        isAdmin: false,
        createdAt: new Date('2025-08-16T16:45:00Z'),
        qrCodesGenerated: 22,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        subscription: { plan: 'pro', status: 'active' },
      },
      {
        email: 'mike.wilson@example.com',
        displayName: 'Mike Wilson',
        isAdmin: false,
        createdAt: new Date('2025-08-18T14:20:00Z'),
        qrCodesGenerated: 3,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
        subscription: { plan: 'free', status: 'active' },
      },
    ];

    for (const userData of users) {
      try {
        await setDoc(
          doc(
            db,
            'users',
            userData.email.replace('@', '_at_').replace('.', '_dot_')
          ),
          userData
        );
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        console.log(`⚠️  User might already exist: ${userData.email}`);
      }
    }

    // Create sample blog posts
    console.log('📝 Creating sample blog posts...');

    const blogPosts = [
      {
        title: 'Getting Started with QR Codes for Your Business',
        slug: 'getting-started-qr-codes-business',
        excerpt:
          'Learn how QR codes can transform your business operations and customer engagement.',
        content:
          'QR codes have become an essential tool for modern businesses. They bridge the gap between physical and digital experiences, allowing customers to access information, promotions, and services with a simple scan...',
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-15T10:00:00Z'),
        createdAt: new Date('2025-08-15T10:00:00Z'),
        updatedAt: new Date('2025-08-15T10:00:00Z'),
        featured: true,
        status: 'published',
        tags: ['qr-codes', 'business', 'digital-marketing'],
        category: 'Business',
        readTime: 5,
        views: 245,
        likes: 18,
      },
      {
        title: 'Advanced QR Code Customization Techniques',
        slug: 'advanced-qr-customization-techniques',
        excerpt:
          'Take your QR codes to the next level with advanced customization options and branding.',
        content:
          "While basic QR codes are functional, customized QR codes can significantly enhance your brand identity and user engagement. In this comprehensive guide, we'll explore advanced techniques...",
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-17T14:30:00Z'),
        createdAt: new Date('2025-08-17T14:30:00Z'),
        updatedAt: new Date('2025-08-17T14:30:00Z'),
        featured: false,
        status: 'published',
        tags: ['qr-codes', 'customization', 'branding', 'design'],
        category: 'Tutorial',
        readTime: 8,
        views: 156,
        likes: 12,
      },
      {
        title: 'QR Codes in Marketing: Best Practices and Case Studies',
        slug: 'qr-codes-marketing-best-practices',
        excerpt:
          'Discover how successful brands are using QR codes in their marketing campaigns.',
        content:
          "Marketing with QR codes has evolved far beyond simple URL redirects. Today's innovative brands are using QR codes to create immersive experiences, track customer journeys...",
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-18T09:15:00Z'),
        createdAt: new Date('2025-08-18T09:15:00Z'),
        updatedAt: new Date('2025-08-18T09:15:00Z'),
        featured: true,
        status: 'published',
        tags: ['qr-codes', 'marketing', 'case-studies', 'strategy'],
        category: 'Marketing',
        readTime: 12,
        views: 89,
        likes: 7,
      },
      {
        title: 'The Future of QR Codes: Trends to Watch in 2025',
        slug: 'future-qr-codes-trends-2025',
        excerpt:
          'Explore emerging trends and technologies shaping the future of QR codes.',
        content:
          'As we progress through 2025, QR codes continue to evolve with new technologies and use cases. From AI integration to augmented reality experiences...',
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-19T11:45:00Z'),
        createdAt: new Date('2025-08-19T11:45:00Z'),
        updatedAt: new Date('2025-08-19T11:45:00Z'),
        featured: false,
        status: 'published',
        tags: ['qr-codes', 'trends', 'future-tech', 'innovation'],
        category: 'Technology',
        readTime: 10,
        views: 67,
        likes: 5,
      },
      {
        title: 'Building a QR Code Analytics Dashboard',
        slug: 'qr-code-analytics-dashboard',
        excerpt:
          'Learn how to track and analyze QR code performance with comprehensive analytics.',
        content:
          "Understanding how your QR codes perform is crucial for optimizing your campaigns. In this technical guide, we'll walk through building a comprehensive analytics dashboard...",
        author: 'Sayquan Mclaurin',
        publishedAt: new Date('2025-08-19T15:20:00Z'),
        createdAt: new Date('2025-08-19T15:20:00Z'),
        updatedAt: new Date('2025-08-19T15:20:00Z'),
        featured: false,
        status: 'draft',
        tags: ['analytics', 'dashboard', 'tracking', 'performance'],
        category: 'Technical',
        readTime: 15,
        views: 23,
        likes: 2,
      },
    ];

    for (const post of blogPosts) {
      try {
        await addDoc(collection(db, 'blog'), post);
        console.log(`✅ Created blog post: ${post.title}`);
      } catch (error) {
        console.log(
          `❌ Error creating blog post: ${post.title}`,
          error.message
        );
      }
    }

    // Create analytics data
    console.log('📝 Creating analytics data...');

    const analyticsData = {
      routes: {
        '/': { count: 1247, lastVisit: new Date().toISOString() },
        '/generate': { count: 892, lastVisit: new Date().toISOString() },
        '/blog': { count: 445, lastVisit: new Date().toISOString() },
        '/pricing': { count: 334, lastVisit: new Date().toISOString() },
        '/admin': { count: 89, lastVisit: new Date().toISOString() },
        '/login': { count: 156, lastVisit: new Date().toISOString() },
      },
      qrTypes: {
        url: { count: 145 },
        wifi: { count: 32 },
        vcard: { count: 28 },
        text: { count: 67 },
        email: { count: 19 },
        phone: { count: 15 },
      },
      qrGenerated: 306,
      totalScans: 1847,
      lastUpdated: new Date().toISOString(),
      sessions: 1156,
      pageviews: 3163,
      bounceRate: 24.5,
      avgSessionDuration: 185,
    };

    await setDoc(doc(db, 'analytics', 'platform'), analyticsData);
    console.log('✅ Created analytics data');

    // Create QR scan tracking data
    console.log('📝 Creating QR scan tracking data...');

    const qrScans = [
      {
        qrId: 'qr_001',
        userId: 'sayquanmclaurinwork_at_gmail_dot_com',
        scannedAt: new Date(),
        location: 'San Francisco, CA',
        deviceType: 'mobile',
        userAgent: 'iPhone',
      },
      {
        qrId: 'qr_002',
        userId: 'john_dot_doe_at_example_dot_com',
        scannedAt: new Date(Date.now() - 3600000),
        location: 'New York, NY',
        deviceType: 'desktop',
        userAgent: 'Chrome',
      },
      {
        qrId: 'qr_003',
        userId: 'jane_dot_smith_at_example_dot_com',
        scannedAt: new Date(Date.now() - 7200000),
        location: 'Los Angeles, CA',
        deviceType: 'mobile',
        userAgent: 'Android',
      },
    ];

    for (const scan of qrScans) {
      try {
        await addDoc(collection(db, 'qr_scans'), scan);
        console.log(`✅ Created QR scan record for: ${scan.qrId}`);
      } catch (error) {
        console.log(`❌ Error creating QR scan: ${scan.qrId}`, error.message);
      }
    }

    console.log('🎉 Successfully populated Firebase with test data!');
    console.log('📊 Data Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${blogPosts.length} blog posts created`);
    console.log(`   - 1 analytics document created`);
    console.log(`   - ${qrScans.length} QR scan records created`);
    console.log('');
    console.log(
      '🔗 View data in Firebase Emulator UI: http://localhost:4000/firestore'
    );
    console.log('🎯 Check admin dashboard: http://localhost:3000/admin');
  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

// Run the script
populateFirebaseData()
  .then(() => {
    console.log('✅ Data population complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
