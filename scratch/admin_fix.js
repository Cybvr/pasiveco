const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function fix() {
  const reference = 'gift_KLRoXmT4f0LovoUEznA5_1776508126502';
  console.log('Admin Syncing reference:', reference);
  
  const snap = await db.collection('gifts').where('reference', '==', reference).get();
  
  if (snap.empty) {
    console.log('Not found');
    return;
  }
  
  const doc = snap.docs[0];
  await doc.ref.update({
    status: 'success',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    notes: 'Admin manual sync after webhook fail'
  });
  
  console.log('SUCCESS: Gift updated to success!');
  process.exit(0);
}

fix();
