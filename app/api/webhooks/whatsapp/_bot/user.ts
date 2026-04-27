import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { WhatsAppContact } from "./types";
import { creatorIdFromPhone, creatorHandleFromPhone, cleanWhatsAppName, stripUndefined } from "./utils";

export function getWhatsAppContact(value: any, from: string): WhatsAppContact | undefined {
  const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
  return contacts.find((c: WhatsAppContact) => c?.wa_id === from) || contacts[0];
}

export async function upsertWhatsAppUserFromContact(from: string, contact?: WhatsAppContact) {
  const creatorId = creatorIdFromPhone(from);
  const creatorHandle = creatorHandleFromPhone(from);
  const profileName = cleanWhatsAppName(contact?.profile?.name);
  const userRef = db.collection("users").doc(creatorId);
  const userSnap = await userRef.get();
  const existing = userSnap.exists ? (userSnap.data() as Record<string, any>) : {};
  const existingDisplayName = cleanWhatsAppName(existing.displayName);
  const shouldUseProfileName = profileName && (!existingDisplayName || existingDisplayName === creatorHandle);
  const now = FieldValue.serverTimestamp();

  await userRef.set(
    stripUndefined({
      email: existing.email || `${creatorId}@whatsapp.pasiveco.local`,
      emailVerified: existing.emailVerified ?? false,
      isActive: existing.isActive ?? true,
      isAdmin: existing.isAdmin ?? false,
      role: existing.role || "user",
      plan: existing.plan || "free",
      displayName: shouldUseProfileName ? profileName : existingDisplayName || creatorHandle,
      username: existing.username || creatorHandle,
      slug: existing.slug || creatorHandle,
      phoneNumber: existing.phoneNumber || from,
      whatsappId: contact?.wa_id || existing.whatsappId || from,
      whatsappProfileName: profileName || existing.whatsappProfileName || null,
      source: existing.source || "whatsapp",
      accountStatus: existing.accountStatus || "whatsapp_unclaimed",
      authProvider: existing.authProvider || "whatsapp_unclaimed",
      canLogin: existing.canLogin ?? false,
      links: Array.isArray(existing.links) ? existing.links : [],
      socialLinks: Array.isArray(existing.socialLinks) ? existing.socialLinks : [],
      firstContactAt: existing.firstContactAt || now,
      lastWhatsAppContactAt: now,
      createdAt: existing.createdAt || now,
      updatedAt: now,
    }),
    { merge: true }
  );
}
