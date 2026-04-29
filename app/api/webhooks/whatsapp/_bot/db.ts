import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { sessionDoc } from "./session";
import { stripUndefined } from "./utils";

export async function claimWhatsAppMessage(messageId: string): Promise<boolean> {
  const messageRef = db.collection("processedWhatsAppMessages").doc(messageId);
  try {
    await messageRef.create({
      status: "processing",
      attempts: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error: any) {
    if (error?.code === 6 || error?.code === "already-exists") {
      const snap = await messageRef.get();
      if (snap.data()?.status === "failed") {
        await messageRef.set(
          {
            status: "processing",
            attempts: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        return true;
      }
      return false;
    }
    throw error;
  }
}

export async function markWhatsAppMessageProcessed(
  messageId: string,
  status: "completed" | "failed",
  error?: unknown
) {
  await db
    .collection("processedWhatsAppMessages")
    .doc(messageId)
    .set(
      stripUndefined({
        status,
        error: error instanceof Error ? error.message : error ? String(error) : undefined,
        updatedAt: FieldValue.serverTimestamp(),
      }),
      { merge: true }
    );
}

export async function recordWhatsAppMessage(
  waId: string,
  message: {
    direction: "inbound" | "outbound";
    content: string;
    type: string;
    author?: "bot" | "admin";
    mediaId?: string;
    fileName?: string;
    raw?: any;
    referral?: any;
    sendStatus?: "sent" | "failed";
    sendError?: any;
  }
) {
  const sessionRef = sessionDoc(waId);
  const now = FieldValue.serverTimestamp();

  await sessionRef.set(
    {
      waId,
      lastMessage: message.content,
      lastMessageDirection: message.direction,
      lastMessageAt: now,
      unread: message.direction === "inbound",
      updatedAt: now,
    },
    { merge: true }
  );

  await sessionRef.collection("messages").add({
    ...stripUndefined(message),
    createdAt: now,
  });
}

export async function recordWhatsAppWebhookError(error: unknown) {
  try {
    await db.collection("whatsappWebhookErrors").add({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (writeError) {
    console.error("Failed to record WhatsApp webhook error:", writeError);
  }
}
