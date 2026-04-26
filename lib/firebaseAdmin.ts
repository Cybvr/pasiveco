import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function normalizePrivateKey(value?: string) {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  const withNewlines = trimmed.replace(/\\n/g, "\n");

  if (withNewlines.includes("-----BEGIN PRIVATE KEY-----")) {
    return withNewlines;
  }

  return Buffer.from(withNewlines, "base64").toString("utf8").replace(/\\n/g, "\n");
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
