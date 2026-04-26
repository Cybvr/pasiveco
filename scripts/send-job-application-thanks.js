const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const RESEND_API_BASE = 'https://api.resend.com';

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

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const firstNameFrom = (fullName) => String(fullName || '').trim().split(/\s+/)[0] || 'there';

const buildHtml = ({ firstName, jobTitle }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h1 style="color: #4F46E5;">Thanks for applying!</h1>
    <p>Hi ${firstName},</p>
    <p>Thanks for applying for the <strong>${jobTitle}</strong> role at Pasive.</p>
    <p>We've received your application and our team will review it carefully. If your experience looks like a fit, we'll reach out with next steps.</p>
    <p>In the meantime, you can learn more about what we're building at <a href="https://pasive.co">pasive.co</a>.</p>
    <p>Best,<br>The Pasive Team</p>
  </div>
`;

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || process.env.MAIL_FROM;

  if (!apiKey || !from) {
    throw new Error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL');
  }

  const response = await fetch(`${RESEND_API_BASE}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error?.message || 'Failed to send email');
  }

  return data;
}

async function main() {
  initFirebase();
  const db = getFirestore();
  const now = Timestamp.now();
  const applicationsSnap = await db.collection('job_applications').get();
  const latestByEmail = new Map();

  applicationsSnap.docs.forEach((applicationDoc) => {
    const application = applicationDoc.data();
    const email = normalizeEmail(application.email);
    if (!email) return;

    const existing = latestByEmail.get(email);
    const createdAtMillis = application.createdAt?.toMillis?.() || 0;
    const existingMillis = existing?.createdAt?.toMillis?.() || 0;

    if (!existing || createdAtMillis > existingMillis) {
      latestByEmail.set(email, {
        id: applicationDoc.id,
        ...application,
        email,
      });
    }
  });

  let sent = 0;
  let failed = 0;

  for (const application of latestByEmail.values()) {
    try {
      const firstName = firstNameFrom(application.fullName);
      await sendEmail({
        to: application.email,
        subject: `Thanks for applying to Pasive, ${firstName}`,
        html: buildHtml({
          firstName,
          jobTitle: application.jobTitle || 'the role',
        }),
      });

      await db.collection('job_applications').doc(application.id).set(
        {
          thankYouEmailSentAt: now,
        },
        { merge: true }
      );

      sent += 1;
      console.log(`SENT ${application.email}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${application.email}: ${error.message}`);
    }
  }

  console.log('');
  console.log(`Applications: ${applicationsSnap.size}`);
  console.log(`Unique emails: ${latestByEmail.size}`);
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
