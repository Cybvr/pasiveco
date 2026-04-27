import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { SESSION_COLLECTION, WhatsAppStep } from "./types";

export function sessionDoc(waId: string) {
  return db.collection(SESSION_COLLECTION).doc(waId);
}

export async function resetWhatsAppSession(from: string, step: WhatsAppStep) {
  await sessionDoc(from).set(
    {
      flow: "commerce",
      step,
      productType: FieldValue.delete(),
      productName: FieldValue.delete(),
      productPrice: FieldValue.delete(),
      productSlug: FieldValue.delete(),
      productId: FieldValue.delete(),
      fileId: FieldValue.delete(),
      fileName: FieldValue.delete(),
      salesLink: FieldValue.delete(),
      bankSetupRequested: FieldValue.delete(),
      bankingDetailsRaw: FieldValue.delete(),
      accountNumber: FieldValue.delete(),
      candidateFullName: FieldValue.delete(),
      candidateAge: FieldValue.delete(),
      candidatePhone: FieldValue.delete(),
      candidateLocation: FieldValue.delete(),
      jobRole: FieldValue.delete(),
      jobId: FieldValue.delete(),
      screeningQuestionIndex: FieldValue.delete(),
      screeningAnswers: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function resetWhatsAppJobSession(from: string) {
  await sessionDoc(from).set(
    {
      flow: "jobs",
      step: "job_full_name",
      productType: FieldValue.delete(),
      productName: FieldValue.delete(),
      productPrice: FieldValue.delete(),
      productSlug: FieldValue.delete(),
      productId: FieldValue.delete(),
      fileId: FieldValue.delete(),
      fileName: FieldValue.delete(),
      salesLink: FieldValue.delete(),
      bankSetupRequested: FieldValue.delete(),
      bankingDetailsRaw: FieldValue.delete(),
      accountNumber: FieldValue.delete(),
      candidateFullName: FieldValue.delete(),
      candidateAge: FieldValue.delete(),
      candidatePhone: from,
      candidateLocation: FieldValue.delete(),
      jobRole: FieldValue.delete(),
      jobId: FieldValue.delete(),
      screeningQuestionIndex: FieldValue.delete(),
      screeningAnswers: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
