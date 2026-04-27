import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { PRODUCT_CATEGORY_BY_TYPE } from "../types";
import { stripUndefined } from "../utils";

export async function createWhatsAppProduct({
  creatorId,
  creatorHandle,
  from,
  productSlug,
  productName,
  productType,
  productPrice,
  fileId,
  fileName,
  fileUrl,
}: {
  creatorId: string;
  creatorHandle: string;
  from: string;
  productSlug: string;
  productName: string;
  productType: string;
  productPrice: number;
  fileId: string;
  fileName: string;
  fileUrl: string;
}) {
  const now = FieldValue.serverTimestamp();
  const userRef = db.collection("users").doc(creatorId);
  const userSnap = await userRef.get();
  const existingUser = userSnap.exists ? (userSnap.data() as Record<string, any>) : {};
  const category = PRODUCT_CATEGORY_BY_TYPE[productType] || "digital-download";
  const isEbook = category === "ebook";
  const details = isEbook
    ? {
        fileName,
        fileUrl,
        whatsappMediaId: fileId,
        ebookFormat: "PDF",
        enableReader: false,
      }
    : {
        fileName,
        fileUrl,
        whatsappMediaId: fileId,
        deliveryMode: "silent_email",
      };

  await userRef.set(
    stripUndefined({
      email: existingUser.email || `${creatorId}@whatsapp.pasiveco.local`,
      emailVerified: existingUser.emailVerified ?? false,
      isActive: existingUser.isActive ?? true,
      role: existingUser.role || "user",
      username: existingUser.username || creatorHandle,
      slug: existingUser.slug || creatorHandle,
      phoneNumber: existingUser.phoneNumber || from,
      source: existingUser.source || "whatsapp",
      accountStatus: existingUser.accountStatus || "whatsapp_unclaimed",
      authProvider: existingUser.authProvider || "whatsapp_unclaimed",
      canLogin: existingUser.canLogin ?? false,
      links: Array.isArray(existingUser.links) ? existingUser.links : [],
      socialLinks: Array.isArray(existingUser.socialLinks) ? existingUser.socialLinks : [],
      createdAt: existingUser.createdAt || now,
      whatsappOnboardingStartedAt: now,
      updatedAt: now,
    }),
    { merge: true }
  );

  const productRef = db.collection("products").doc();
  await productRef.set({
    userId: creatorId,
    name: productName,
    description: `${productType} created from WhatsApp onboarding.`,
    price: productPrice,
    currency: "NGN",
    category,
    images: [],
    thumbnail: "",
    status: "active",
    tags: [isEbook ? "Ebooks" : "Digital Download", "WhatsApp"],
    details,
    inventory: {
      quantity: 0,
      trackInventory: false,
    },
    shipping: {
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      shippingRequired: false,
    },
    seo: {
      title: productName,
      description: `${productType} by ${creatorHandle}`,
      keywords: [isEbook ? "Ebooks" : "Digital Download", "WhatsApp", "digital product"],
    },
    slug: productSlug,
    createdAt: now,
    updatedAt: now,
  });

  return productRef;
}
