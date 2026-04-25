
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('FIREBASE_PRIVATE_KEY is missing');
  process.exit(1);
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const jobs = [
  {
    title: "Social Media Manager",
    slug: "social-media-manager",
    category: "Marketing",
    location: "Remote",
    type: "Full-time",
    active: true,
    description: `Social Media Manager Brief — Pasive.co

The role
Build a culture account for African creators.

The angle
We celebrate the African creative life. The work, the aesthetic, the people, the culture. We spotlight creators and their craft. The audience self-identifies as creatives and gravitates to us because we get them.

What we post
- African creatives and their work — fashion, music, film, design, writing, photography
- Creative setups, aesthetics, moments
- "Show us what you made this week" style community posts
- Spotlighting Lagos, Abuja, Accra, Nairobi creative scenes
- Conversations the creative community is already having

Inspiration
NoteSphere, Kalshi Culture.

Platforms
- x.com/pasivehq
- instagram.com/visualafrica__
- pasive.co`,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function seedJobs() {
  console.log('🚀 Seeding jobs...');
  for (const job of jobs) {
    try {
      // Check if job exists by slug
      const snapshot = await db.collection('jobs').where('slug', '==', job.slug).get();
      if (!snapshot.empty) {
        console.log(`ℹ️ Job with slug "${job.slug}" already exists. Updating...`);
        const docId = snapshot.docs[0].id;
        await db.collection('jobs').doc(docId).update({
          ...job,
          updatedAt: Timestamp.now()
        });
        console.log(`✅ Job updated: ${docId}`);
      } else {
        const docRef = await db.collection('jobs').add(job);
        console.log(`✅ Job added with ID: ${docRef.id}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding job: ${error}`);
    }
  }
  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seedJobs();
