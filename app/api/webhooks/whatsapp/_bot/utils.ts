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
  // WhatsApp Flow / Chat Builder NFM reply body
  message.interactive?.nfm_reply?.body?.trim() ||
  "";

export const withSessionTimestamps = (sessionExists: boolean) => ({
  updatedAt: FieldValue.serverTimestamp(),
  ...(!sessionExists ? { createdAt: FieldValue.serverTimestamp() } : {}),
});

export const getInboundPreview = (message: any) => {
  const text = getMessageText(message);
  if (text) return text;

  // WhatsApp Flow / Chat Builder: parse and summarise the response_json answers
  const nfmReply = message.interactive?.nfm_reply;
  if (nfmReply) {
    try {
      const answers = JSON.parse(nfmReply.response_json || "{}");
      const summary = Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return summary ? `Chat Builder: ${summary}` : "Chat Builder response received";
    } catch {
      return "Chat Builder response received";
    }
  }

  if (message.document?.filename) return `Document: ${message.document.filename}`;
  if (message.document) return "Document received";
  return "Unsupported WhatsApp message";
};

export const isJobApplicationIntent = (value: string) =>
  /\b(job|jobs|career|careers|apply|application|candidate|vacancy|hiring)\b/i.test(value) ||
  value.includes("apply for a job");

export const hasPortfolioReference = (value: string) =>
  /(https?:\/\/|www\.|[a-z0-9.-]+\.[a-z]{2,}|@[a-z0-9._-]{2,})/i.test(value);

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
