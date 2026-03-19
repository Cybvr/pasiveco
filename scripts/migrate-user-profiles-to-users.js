require('dotenv').config({ path: '.env.local' });
const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  const localServiceAccountPath = path.join(process.cwd(), 'users.json');
  if (fs.existsSync(localServiceAccountPath)) {
    return cert(require(localServiceAccountPath));
  }

  return applicationDefault();
}

if (!getApps().length) {
  initializeApp({ credential: resolveCredential() });
}

const db = getFirestore();

async function migrateUserProfilesToUsers() {
  const userProfilesSnapshot = await db.collection('user_profiles').get();

  if (userProfilesSnapshot.empty) {
    console.log('No user_profiles documents found. Nothing to migrate.');
    return;
  }

  let migratedCount = 0;
  let deletedCount = 0;

  for (const profileDoc of userProfilesSnapshot.docs) {
    const profile = profileDoc.data();
    const userId = profile.userId;

    if (!userId) {
      console.warn(`Skipping profile ${profileDoc.id}: missing userId.`);
      continue;
    }

    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    const existingUser = userSnapshot.exists ? userSnapshot.data() : {};

    const migratedProfileFields = {
      username: (profile.username || '').replace(/^@/, '').trim(),
      displayName: profile.displayName || existingUser.displayName || '',
      bio: profile.bio || '',
      profilePicture: profile.profilePicture ?? existingUser.profilePicture ?? existingUser.photoURL ?? null,
      bannerImage: profile.bannerImage ?? null,
      slug: profile.slug || (profile.username || '').replace(/^@/, '').trim(),
      links: Array.isArray(profile.links) ? profile.links : [],
      socialLinks: Array.isArray(profile.socialLinks) ? profile.socialLinks : [],
      theme: profile.theme || existingUser.theme || 'default',
      appearance: profile.appearance || existingUser.appearance || {},
      gender: profile.gender || existingUser.gender || '',
      dob: profile.dob || existingUser.dob || '',
      phoneNumber: profile.phoneNumber || existingUser.phoneNumber || '',
      source: profile.source || existingUser.source || '',
      backgroundType: profile.backgroundType || existingUser.backgroundType || 'color',
      backgroundColor: profile.backgroundColor || existingUser.backgroundColor || '',
      backgroundImage: profile.backgroundImage ?? existingUser.backgroundImage ?? null,
      pageBackgroundType: profile.pageBackgroundType || existingUser.pageBackgroundType || 'color',
      pageBackgroundColor: profile.pageBackgroundColor || existingUser.pageBackgroundColor || '',
      pageBackgroundImage: profile.pageBackgroundImage ?? existingUser.pageBackgroundImage ?? null,
      updatedAt: Timestamp.now(),
      createdAt: existingUser.createdAt || profile.createdAt || Timestamp.now(),
    };

    await userRef.set(
      {
        email: existingUser.email || profile.email || '',
        emailVerified: existingUser.emailVerified || false,
        isActive: existingUser.isActive !== false,
        isAdmin: existingUser.isAdmin || false,
        role: existingUser.role || 'user',
        metadata: existingUser.metadata || { signUpMethod: 'email' },
        photoURL: existingUser.photoURL || profile.profilePicture || null,
        ...migratedProfileFields,
      },
      { merge: true },
    );

    migratedCount += 1;
    await profileDoc.ref.delete();
    deletedCount += 1;
    console.log(`Migrated profile ${profileDoc.id} into users/${userId}.`);
  }

  console.log(`Done. Migrated ${migratedCount} profiles and deleted ${deletedCount} user_profiles documents.`);
}

migrateUserProfilesToUsers().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
