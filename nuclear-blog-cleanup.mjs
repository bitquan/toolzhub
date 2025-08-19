import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';

// Firebase config
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

async function nukeAllBlogPosts() {
  try {
    console.log(
      '🚀 NUCLEAR CLEANUP: Starting complete blog collection wipe...'
    );

    // Get ALL documents from the blog collection
    const q = query(collection(db, 'blog'));
    const querySnapshot = await getDocs(q);

    console.log(
      `💥 NUCLEAR CLEANUP: Found ${querySnapshot.size} documents to delete`
    );

    if (querySnapshot.size === 0) {
      console.log('✅ NUCLEAR CLEANUP: Collection is already empty');
      return;
    }

    // Delete each document
    const deletePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      console.log(
        `🗑️ NUCLEAR CLEANUP: Queueing deletion of ${docSnapshot.id}: "${
          docSnapshot.data().title
        }"`
      );
      deletePromises.push(deleteDoc(doc(db, 'blog', docSnapshot.id)));
    });

    // Execute all deletions
    console.log('💣 NUCLEAR CLEANUP: Executing batch deletion...');
    await Promise.all(deletePromises);

    console.log('✅ NUCLEAR CLEANUP: All blog posts successfully deleted!');
    console.log('🧹 NUCLEAR CLEANUP: Collection is now completely empty');

    // Verify deletion
    const verifySnapshot = await getDocs(q);
    console.log(
      `🔍 NUCLEAR CLEANUP: Verification - ${verifySnapshot.size} documents remaining`
    );
  } catch (error) {
    console.error('❌ NUCLEAR CLEANUP: Error during deletion:', error);
  }
}

// Execute the nuclear cleanup
nukeAllBlogPosts();
