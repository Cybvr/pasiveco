import { FieldValue } from "firebase-admin/firestore";

export const normalize = (value?: string) => value?.trim().toLowerCase() || "";

export const creatorHandleFromPhone = (phone: string) => `creator-${phone.slice(-6) || "new"}`;

export const creatorIdFromPhone = (phone: string) => `whatsapp_${phone}`;

export const cleanWhatsAppName = (name?: string) => {
  const trimmed = name?.trim();
  return trimmed || null;
};

export const getMessageText = (message: any) =>
  message.text?.body?.trim() ||
  message.button?.text?.trim() ||
  message.interactive?.button_reply?.title?.trim() ||
  message.interactive?.list_reply?.title?.trim() ||
  "";

export const withSessionTimestamps = (sessionExists: boolean) => ({
  updatedAt: FieldValue.serverTimestamp(),
  ...(!sessionExists ? { createdAt: FieldValue.serverTimestamp() } : {}),
});

export const getInboundPreview = (message: any) => {
  const text = getMessageText(message);
  if (text) return text;
  if (message.document?.filename) return `Document: ${message.document.filename}`;
  if (message.document) return "Document received";
  return "Unsupported WhatsApp message";
};

export const isJobApplicationIntent = (value: string) =>
  /\b(job|jobs|career|careers|apply|application|candidate|vacancy|hiring)\b/i.test(value) ||
  value.includes("apply for a job");

export function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}

export function parseNairaPrice(value: string) {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[₦,\s]/g, "")
    .replace(/k$/i, "000");
  return Number(compact);
}
