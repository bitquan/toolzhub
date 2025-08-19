// ✨ BLOG CATEGORIES CREATION SCRIPT ✨
// Run this first to create blog categories
// Copy this entire script and run it in your browser console at https://toolzhub-5014-31157.web.app
// Make sure you're logged in first!

const createBlogCategories = async () => {
  console.log('🚀 Creating Blog Categories...');

  if (typeof firebase === 'undefined') {
    console.error(
      '❌ Firebase not loaded. Please run this on https://toolzhub-5014-31157.web.app'
    );
    return;
  }

  const db = firebase.firestore();

  const categories = [
    {
      id: 'business',
      name: 'Business',
      slug: 'business',
      description: 'QR codes for business growth and marketing',
      color: '#3B82F6',
    },
    {
      id: 'tutorial',
      name: 'Tutorial',
      slug: 'tutorial',
      description: 'Step-by-step guides and how-tos',
      color: '#10B981',
    },
    {
      id: 'technology',
      name: 'Technology',
      slug: 'technology',
      description: 'Latest tech trends and innovations',
      color: '#8B5CF6',
    },
    {
      id: 'design',
      name: 'Design',
      slug: 'design',
      description: 'Design tips and best practices',
      color: '#F59E0B',
    },
  ];

  try {
    for (const category of categories) {
      await db.collection('blog_categories').doc(category.id).set(category);
      console.log(`✅ Created category: ${category.name}`);
    }
    console.log('🎉 All categories created successfully!');
  } catch (error) {
    console.error('❌ Error creating categories:', error);
  }
};

// Auto-execute
createBlogCategories();
