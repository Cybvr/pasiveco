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

async function debug() {
  // Find jide's actual user record
  console.log('\n=== JIDE USER RECORD ===');
  const users = await db.collection('users').where('email', '==', 'jide@visual.ng').get();
  if (users.empty) {
    // Try username
    const byUsername = await db.collection('users').where('username', '==', 'jide').get();
    byUsername.forEach(d => console.log({ id: d.id, email: d.get('email'), username: d.get('username'), userId: d.get('userId') }));
  } else {
    users.forEach(d => console.log({ id: d.id, email: d.get('email'), username: d.get('username'), userId: d.get('userId') }));
  }

  console.log('\n=== ALL GIFTS ===');
  const gifts = await db.collection('gifts').get();
  gifts.forEach(d => console.log({
    id: d.id,
    creatorId: d.get('creatorId'),
    senderId: d.get('senderId'),
    status: d.get('status'),
    reference: d.get('reference'),
    amount: d.get('amount')
  }));

  process.exit(0);
}

debug();
