const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const comms = await db.collection('communities').get();
  const cats = [...new Set(comms.docs.map(d => d.data().category))];
  console.log(`Available categories: ${JSON.stringify(cats)}`);
}

check();
