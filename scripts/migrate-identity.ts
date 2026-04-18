import { config } from 'dotenv';
import { resolve } from 'path';
import * as admin from 'firebase-admin';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawPrivateKey) {
  console.error("Missing Firebase admin credentials in .env.local");
  process.exit(1);
}

const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

const sanitize = (val: any) => (typeof val === 'string' ? val.trim().replace(/^@/, '') : '');

const migrate = async () => {
  console.log('--- Starting User Identity Migration ---');
  
  const usersSnap = await db.collection('users').get();
  console.log(`Found ${usersSnap.size} users.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const userId = doc.id;
    const email = data.email || '';
    const username = sanitize(data.username);
    const slug = sanitize(data.slug);
    
    let newUsername = username;
    let reason = '';

    // Migration Logic (Phase 2)
    if (username && !slug) {
      // Case A: username set, no slug
      skippedCount++;
      continue;
    } else if (slug && !username) {
      // Case B: slug set, no username
      newUsername = slug;
      reason = 'Backfilled from slug';
    } else if (username && slug && username !== slug) {
      // Case C: Both set, but different (Prefer slug)
      newUsername = slug;
      reason = `Overwrote username (${username}) with slug (${slug}) for consistency`;
    } else if (!username && !slug) {
      // Case D: Neither set
      newUsername = email.split('@')[0] || `user_${Math.random().toString(36).substring(2, 7)}`;
      reason = 'Generated from email prefix';
    } else if (username === slug) {
      // Case E: already in sync
      skippedCount++;
      continue;
    }

    if (newUsername) {
      console.log(`Updating user ${userId} (${email}): ${newUsername} [${reason}]`);
      await db.collection('users').doc(userId).update({
        username: newUsername,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updatedCount++;
    }
  }

  console.log('--- Migration Complete ---');
  console.log(`Total users: ${usersSnap.size}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped/Already Correct: ${skippedCount}`);
};

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
