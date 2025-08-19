// COMPREHENSIVE BLOG CLEANUP SCRIPT
// Run this in the browser console at localhost:3000/admin
// Make sure you're logged in to the admin panel first

const comprehensiveBlogCleanup = async () => {
  console.log('🚀 COMPREHENSIVE CLEANUP: Starting complete blog wipe...');

  // Check if we're in the right environment
  if (
    !window.location.origin.includes('localhost:3000') &&
    !window.location.origin.includes('toolzhub')
  ) {
    console.error('❌ Please run this script on the admin panel');
    return;
  }

  try {
    // Use Firebase from the window object (should be available in React app)
    if (typeof window.firebase === 'undefined') {
      console.error(
        '❌ Firebase not found on window object. Trying alternative approach...'
      );

      // Alternative: create our own Firebase connection
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
      document.head.appendChild(script);

      const firestoreScript = document.createElement('script');
      firestoreScript.src =
        'https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js';
      document.head.appendChild(firestoreScript);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Initialize Firebase with your config
      const firebaseConfig = {
        apiKey: 'AIzaSyDvKKBaVqsf6fVjClUF5FNCOGVp8p8UQo8',
        authDomain: 'toolzhub-45dd3.firebaseapp.com',
        projectId: 'toolzhub-45dd3',
        storageBucket: 'toolzhub-45dd3.firebasestorage.app',
        messagingSenderId: '484630524587',
        appId: '1:484630524587:web:83d5de62a6e3e6c6e6b1c4',
      };

      firebase.initializeApp(firebaseConfig);
    }

    console.log('✅ Firebase loaded');

    // Get Firestore instance
    const db = firebase.firestore();

    // Get all documents from blog collection
    const snapshot = await db.collection('blog').get();

    console.log(`💥 Found ${snapshot.size} documents to delete`);

    if (snapshot.size === 0) {
      console.log('✅ Blog collection is already empty');
      return;
    }

    // Log all documents before deletion
    const docs = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      docs.push({
        id: docSnapshot.id,
        title: data.title,
        author: data.author,
      });
      console.log(
        `📄 Found: ${docSnapshot.id} - "${data.title}" by ${data.author}`
      );
    });

    // Confirm deletion
    const confirm = window.confirm(
      `Found ${snapshot.size} blog posts to delete:\n\n` +
        docs.map((d) => `• ${d.title} (by ${d.author})`).join('\n') +
        '\n\nAre you sure you want to delete ALL of these?'
    );

    if (!confirm) {
      console.log('❌ Cleanup cancelled by user');
      return;
    }

    // Delete all documents
    console.log('🗑️ Starting deletion process...');
    const batch = db.batch();
    snapshot.forEach((docSnapshot) => {
      batch.delete(db.collection('blog').doc(docSnapshot.id));
    });

    await batch.commit();
    console.log('✅ All blog posts deleted successfully!');

    // Verify deletion
    const verifySnapshot = await db.collection('blog').get();
    console.log(`🔍 Verification: ${verifySnapshot.size} documents remaining`);

    if (verifySnapshot.size === 0) {
      console.log('🎉 CLEANUP COMPLETE! Blog collection is now empty.');
      alert('✅ All blog posts have been successfully deleted!');
    } else {
      console.log('⚠️ Some documents may remain. Refresh and try again.');
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    alert('❌ Cleanup failed. Check console for details.');
  }
};

// Auto-run the cleanup
comprehensiveBlogCleanup();
