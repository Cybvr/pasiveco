import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY
const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error("Missing Firebase admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)")
}

function normalizePrivateKey(value: string) {
  const trimmed = value.trim().replace(/^["']|["']$/g, "")
  const withNewlines = trimmed.replace(/\\n/g, "\n")

  if (withNewlines.includes("-----BEGIN PRIVATE KEY-----")) {
    return withNewlines
  }

  return Buffer.from(withNewlines, "base64").toString("utf8").replace(/\\n/g, "\n")
}

const privateKey = normalizePrivateKey(rawPrivateKey)

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      ...(storageBucketName ? { storageBucket: storageBucketName } : {}),
    })

const auth = getAuth(app)
const db = getFirestore(app)
const storageBucket = getStorage(app).bucket()

export { app, auth, db, storageBucket }
