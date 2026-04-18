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

async function check() {
  console.log('Listing last 5 gifts:');
  const snap = await db.collection('gifts').orderBy('createdAt', 'desc').limit(5).get();
  
  if (snap.empty) {
    console.log('No gifts found in collection.');
  } else {
    snap.forEach(doc => {
      console.log(`ID: ${doc.id} | Ref: ${doc.get('reference')} | Status: ${doc.get('status')}`);
    });
  }
  process.exit(0);
}

check();
