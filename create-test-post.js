// Simple script to create one blog post
// Copy this code and run it in the browser console at https://toolzhub-5014-31157.web.app
// Make sure you're logged in first

const createTestBlogPost = async () => {
  // Check if Firebase is available
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    console.error(
      "Firebase not available. Make sure you're on the ToolzHub website and logged in."
    );
    return;
  }

  const db = firebase.firestore();

  const testPost = {
    id: 'test-blog-post-1',
    title: 'Welcome to ToolzHub Blog',
    slug: 'welcome-to-toolzhub-blog',
    excerpt:
      'This is our first blog post! Learn about QR codes and how they can transform your business.',
    content: `# Welcome to ToolzHub Blog

We're excited to launch our blog! Here you'll find the latest tips, tricks, and insights about QR codes, digital marketing, and business growth.

## What You'll Find Here

- **QR Code Tutorials**: Step-by-step guides for different QR code types
- **Business Tips**: How to use QR codes to grow your business
- **Industry Trends**: Latest developments in QR code technology
- **Case Studies**: Real examples of successful QR code campaigns

## Get Started

Ready to create your first QR code? Head over to our [QR Generator](/dashboard) and start building your digital presence today!

Stay tuned for more exciting content coming soon.`,
    author: 'ToolzHub Team',
    publishedAt: firebase.firestore.Timestamp.now(),
    updatedAt: firebase.firestore.Timestamp.now(),
    category: 'General',
    tags: ['Welcome', 'QR Codes', 'Getting Started'],
    featured: true,
    imageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    readTime: 3,
    status: 'published',
  };

  try {
    await db.collection('blog').doc(testPost.id).set(testPost);
    console.log('✅ Blog post created successfully!');
    console.log('🔗 Visit /blog to see your post');

    // Refresh the page to see the blog post
    if (window.location.pathname === '/blog') {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Error creating blog post:', error);
  }
};

// Call the function
createTestBlogPost();
