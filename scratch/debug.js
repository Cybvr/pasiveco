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
  console.log('\n=== ALL GIFTS ===');
  const gifts = await db.collection('gifts').get();
  if (gifts.empty) {
    console.log('EMPTY - No gifts in collection at all.');
  } else {
    gifts.forEach(d => console.log(JSON.stringify({ id: d.id, ...d.data() }, null, 2)));
  }

  console.log('\n=== ALL USERS (first 3) ===');
  const users = await db.collection('users').limit(3).get();
  users.forEach(d => console.log({ id: d.id, email: d.get('email'), username: d.get('username') }));

  process.exit(0);
}

debug();
