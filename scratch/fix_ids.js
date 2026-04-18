const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// Your real Firebase Auth UID
const REAL_UID = 'pPqq5vya93OlQNvNlZwRSgNFco22';
// Old Firestore doc ID being incorrectly used as creatorId
const OLD_ID = 'KLRoXmT4f0LovoUEznA5';

async function fixIds() {
  console.log('Fixing gift records...\n');

  const snap = await db.collection('gifts').get();

  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = {};

    if (data.creatorId === OLD_ID) {
      updates.creatorId = REAL_UID;
      console.log(`Fixing creatorId on gift ${doc.id}`);
    }
    if (data.senderId === OLD_ID) {
      updates.senderId = REAL_UID;
      console.log(`Fixing senderId on gift ${doc.id}`);
    }
    // Also mark pending ones as success since payment confirmed on Paystack
    if (data.status === 'pending') {
      updates.status = 'success';
      updates.notes = 'Status corrected - payment confirmed on Paystack';
      console.log(`Marking gift ${doc.id} as success (was pending)`);
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await doc.ref.update(updates);
    }
  }

  console.log('\nDone! Verifying...');
  const verify = await db.collection('gifts').where('creatorId', '==', REAL_UID).get();
  console.log(`Gifts now readable for your account: ${verify.size}`);
  verify.forEach(d => console.log(` - ${d.get('reference')} | ${d.get('amount')} NGN | ${d.get('status')}`));
  process.exit(0);
}

fixIds();
