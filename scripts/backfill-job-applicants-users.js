const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const resolveServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
};

const usernameFromEmail = (email) =>
  email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'user';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const docIdFromEmail = (email) => email.replace(/\//g, '-');

const initFirebase = () => {
  if (getApps().length > 0) return;

  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Missing Firebase admin credentials in .env.local');
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
};

async function main() {
  initFirebase();
  const db = getFirestore();
  const now = Timestamp.now();

  const applicationsSnap = await db.collection('job_applications').get();
  const applicationsByEmail = new Map();

  applicationsSnap.docs.forEach((applicationDoc) => {
    const application = applicationDoc.data();
    const email = normalizeEmail(application.email);
    if (!email) return;

    const existing = applicationsByEmail.get(email);
    const createdAtMillis = application.createdAt?.toMillis?.() || 0;
    const existingMillis = existing?.createdAt?.toMillis?.() || 0;

    if (!existing || createdAtMillis > existingMillis) {
      applicationsByEmail.set(email, {
        ...application,
        applicationId: applicationDoc.id,
      });
    }
  });

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const [email, application] of applicationsByEmail.entries()) {
    try {
      const existingUserSnap = await db.collection('users').where('email', '==', email).limit(1).get();

      if (!existingUserSnap.empty) {
        skipped += 1;
        console.log(`SKIP  ${email} already exists`);
        continue;
      }

      const username = usernameFromEmail(email);
      const userRef = db.collection('users').doc(docIdFromEmail(email));

      await userRef.set({
        email,
        displayName: application.fullName || username,
        emailVerified: false,
        plan: 'free',
        role: 'user',
        isAdmin: false,
        isActive: true,
        username,
        slug: username,
        profilePicture: '',
        bio: '',
        brandPreferences: '',
        category: '',
        links: [],
        socialLinks: [],
        createdAt: application.createdAt || now,
        updatedAt: now,
        metadata: {
          signUpMethod: 'job_application',
          sourceJobId: application.jobId || '',
          sourceJobTitle: application.jobTitle || '',
          sourceApplicationId: application.applicationId,
          backfilledAt: now,
        },
      });

      created += 1;
      console.log(`CREATE ${email} (${application.fullName || username})`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL   ${email}: ${error.message}`);
    }
  }

  console.log('');
  console.log(`Done. Applications: ${applicationsSnap.size}`);
  console.log(`Unique emails: ${applicationsByEmail.size}`);
  console.log(`Created users: ${created}`);
  console.log(`Skipped existing users: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
