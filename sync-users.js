// Import required Firebase modules
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with your service account
const serviceAccount = require('./users.json');

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

// Function to sync users
async function syncUsersToFirestore() {
  try {
    console.log('Starting user sync...');

    // List all users from Firebase Auth
    // Firebase returns users in batches, so we need to handle pagination
    let nextPageToken;
    let totalProcessed = 0;

    do {
      // Get batch of users (1000 is the max)
      const listUsersResult = nextPageToken 
        ? await auth.listUsers(1000, nextPageToken)
        : await auth.listUsers(1000);

      // Process this batch
      const batch = db.batch();

      for (const userRecord of listUsersResult.users) {
        const user = userRecord.toJSON();

        // Create a reference to the user document
        const userRef = db.collection('users').doc(user.uid);

        // Prepare user data for Firestore
        const userData = {
          email: user.email || '',
          displayName: user.displayName || '',
          phoneNumber: user.phoneNumber || '',
          avatar: user.photoURL || '',
          uid: user.uid,
          plan: 'free',
          referralLink: '',
          isAdmin: user.email === 'admin@pasive.co',
          createdAt: new Date(user.metadata.creationTime)
        };

        // Add to batch
        batch.set(userRef, userData, { merge: true });

        totalProcessed++;
      }

      // Commit the batch
      await batch.commit();
      console.log(`Processed ${totalProcessed} users so far`);

      // Get next page token for next iteration
      nextPageToken = listUsersResult.pageToken;

    } while (nextPageToken);

    console.log(`Sync complete! ${totalProcessed} users processed.`);

  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

// Run the sync function
syncUsersToFirestore();