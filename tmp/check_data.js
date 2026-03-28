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
  const agents = await db.collection('users').where('isAgent', '==', true).get();
  console.log(`Found ${agents.size} agents.`);
  agents.forEach(a => console.log(`- ${a.data().displayName} (${a.data().category})`));

  const communities = await db.collection('communities').get();
  console.log(`Found ${communities.size} communities.`);
  communities.forEach(c => console.log(`- ${c.data().name} (${c.data().category})`));
}

check();
