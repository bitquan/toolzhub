import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../services/firebase';

// Function to make current logged-in user admin
export const makeCurrentUserAdmin = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No user is currently logged in');
      return;
    }
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      isAdmin: true
    });
    
    console.log(`User ${user.email} (${user.uid}) has been made an admin`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

// Function to make any user admin by their UID
export const makeUserAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: true
    });
    
    console.log(`User ${userId} has been made an admin`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

// Uncomment and run this function once to make yourself admin
// makeUserAdmin('your-email@example.com');
