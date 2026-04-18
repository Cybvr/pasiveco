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

async function recover() {
  const reference = 'gift_KLRoXmT4f0LovoUEznA5_1776508126502';
  console.log('Manually recovering gift:', reference);
  
  const giftData = {
    creatorId: 'KLRoXmT4f0LovoUEznA5',
    creatorName: 'jide', // Fallback name
    senderId: 'KLRoXmT4f0LovoUEznA5', // Since they sent it to themselves
    senderName: 'Jide',
    senderEmail: 'jide@visual.ng',
    amount: 500,
    currency: 'NGN',
    message: 'Test Gift (Recovered)',
    status: 'success',
    paymentMethod: 'paystack',
    reference: reference,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(1776508126502)),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    notes: 'Manually recovered after initialization crash'
  };

  await db.collection('gifts').add(giftData);
  console.log('RECOVERY COMPLETE: Gift record created and marked as SUCCESS.');
  process.exit(0);
}

recover();
