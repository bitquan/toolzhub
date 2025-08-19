import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
} from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
try {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
} catch (error) {
  console.log('Emulators already connected or not available');
}

async function createAdminUser() {
  console.log('🔐 Creating admin user in Firebase Auth emulator...');

  try {
    const adminEmail = 'sayquanmclaurinwork@gmail.com';
    const adminPassword = 'admin123456'; // For development only

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    const user = userCredential.user;

    console.log('✅ Created Firebase Auth user:', user.uid);

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: 'Sayquan Mclaurin (Admin)',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      qrCodesGenerated: 15,
      lastLogin: new Date().toISOString(),
      subscription: {
        plan: 'pro',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year
      },
      usageStats: {
        qrCodesCreated: 15,
        qrCodesThisMonth: 5,
        totalScans: 245,
        lastResetDate: new Date().toISOString(),
      },
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ Created Firestore user document');

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🔗 Login at: http://localhost:3000/dev-admin-login');
    console.log('🎯 Or direct access: http://localhost:3000/admin?dev=true');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("✅ Admin user already exists - that's fine!");
      console.log('📧 Email: sayquanmclaurinwork@gmail.com');
      console.log('🔑 Password: admin123456');
      console.log('🔗 Login at: http://localhost:3000/dev-admin-login');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Admin user setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
