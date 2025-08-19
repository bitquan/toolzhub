import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
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

async function checkBlogPosts() {
  try {
    console.log('🔍 Checking Firebase blog collection...');

    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    console.log(`📊 Total documents found: ${querySnapshot.size}`);

    if (querySnapshot.size === 0) {
      console.log('✅ Blog collection is empty - no posts found');
    } else {
      console.log('📝 Blog posts found:');
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}`);
        console.log(`     Title: ${data.title}`);
        console.log(`     Author: ${data.author}`);
        console.log(`     Status: ${data.status}`);
        console.log(
          `     Created: ${data.createdAt?.toDate?.() || data.createdAt}`
        );
        console.log('---');
      });
    }
  } catch (error) {
    console.error('❌ Error checking blog posts:', error);
  }
}

checkBlogPosts();
