const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey
};

if (!getFirestore().app) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function checkCommunities() {
  const snapshot = await db.collection('communities').orderBy('createdAt', 'desc').limit(4).get();
  snapshot.forEach(doc => {
    console.log(`${doc.id} => ${doc.data().name}`);
  });
  process.exit(0);
}

checkCommunities();
