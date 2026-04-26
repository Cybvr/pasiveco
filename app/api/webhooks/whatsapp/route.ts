import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { downloadWhatsAppMedia, sendWhatsAppMessage } from "@/lib/whatsapp";
import { db, storageBucket } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { slugify } from "@/utils/slugify";

export const runtime = "nodejs";

type WhatsAppStep =
  | "welcome"
  | "product_type"
  | "product_name"
  | "product_price"
  | "product_file"
  | "bank_prompt"
  | "bank_details"
  | "discount_create"
  | "complete";

type WhatsAppSession = {
  step?: WhatsAppStep;
  productType?: string;
  productName?: string;
  productPrice?: number;
  productSlug?: string;
  fileId?: string;
  fileName?: string;
  salesLink?: string;
};

const SESSION_COLLECTION = "whatsappSessions";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pasive.co";

const PRODUCT_TYPES: Record<string, string> = {
  "1": "Ebooks / PDFs",
  "ebooks": "Ebooks / PDFs",
  "ebooks / pdfs": "Ebooks / PDFs",
  "pdf": "Ebooks / PDFs",
  "pdfs": "Ebooks / PDFs",
  "2": "Courses / Videos",
  "courses": "Courses / Videos",
  "courses / videos": "Courses / Videos",
  "videos": "Courses / Videos",
  "3": "Templates / Tools",
  "templates": "Templates / Tools",
  "templates / tools": "Templates / Tools",
  "tools": "Templates / Tools",
  "4": "Something else",
  "something else": "Something else",
};

const PRODUCT_CATEGORY_BY_TYPE: Record<string, string> = {
  "Ebooks / PDFs": "ebook",
  "Courses / Videos": "courses",
  "Templates / Tools": "digital-download",
  "Something else": "digital-download",
};

const normalize = (value?: string) => value?.trim().toLowerCase() || "";

const GREETINGS = ["hello", "hi", "hey"];

const creatorHandleFromPhone = (phone: string) => `creator-${phone.slice(-6) || "new"}`;

const creatorIdFromPhone = (phone: string) => `whatsapp_${phone}`;

const getMessageText = (message: any) =>
  message.text?.body?.trim() ||
  message.button?.text?.trim() ||
  message.interactive?.button_reply?.title?.trim() ||
  message.interactive?.list_reply?.title?.trim() ||
  "";

const withSessionTimestamps = (sessionExists: boolean) => ({
  updatedAt: FieldValue.serverTimestamp(),
  ...(!sessionExists ? { createdAt: FieldValue.serverTimestamp() } : {}),
});

const getInboundPreview = (message: any) => {
  const text = getMessageText(message);
  if (text) return text;
  if (message.document?.filename) return `Document: ${message.document.filename}`;
  if (message.document) return "Document received";
  return "Unsupported WhatsApp message";
};

const welcomeMessage =
  "Hey! Welcome to Pasive — sell your digital products and get paid instantly. Want to get started?\n\nReply with:\n1. Yes, let's go\n2. Tell me more first";

const productTypeMessage =
  "You create once, we handle payments, delivery, and payouts. No website needed. What do you sell?\n\nReply with:\n1. Ebooks / PDFs\n2. Courses / Videos\n3. Templates / Tools\n4. Something else";

type GlobalCommandHandler = (from: string, session: WhatsAppSession) => Promise<string>;

const GLOBAL_COMMANDS: Record<string, GlobalCommandHandler> = {
  earnings: handleEarningsCommand,
  balance: handleEarningsCommand,
  customers: handleCustomersCommand,
  discount: handleDiscountCommand,
  "new product": handleNewProductCommand,
};

function verifyWebhookSignature(req: NextRequest, rawBody: string) {
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

  if (!appSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const signature = req.headers.get("x-hub-signature-256");
  if (!signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}

// --- GET: Webhook Verification ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// --- POST: Handle Incoming Messages ---
export async function POST(req: NextRequest) {
  let messageId: string | undefined;

  try {
    const rawBody = await req.text();

    if (!verifyWebhookSignature(req, rawBody)) {
      await recordWhatsAppWebhookError("Invalid WhatsApp webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Check if it's a WhatsApp message event
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "ignored" });
    }

    messageId = message.id;
    if (messageId) {
      const processResult = await claimWhatsAppMessage(messageId);
      if (!processResult) {
        return NextResponse.json({ status: "duplicate" });
      }
    }

    const from = message.from; // User's WhatsApp ID/Phone Number
    await recordWhatsAppMessage(from, {
      direction: "inbound",
      content: getInboundPreview(message),
      type: message.type || "unknown",
      mediaId: message.document?.id,
      fileName: message.document?.filename,
      raw: message,
    });

    const reply = await handleWhatsAppMessage(from, message);

    const sendResult = await sendWhatsAppMessage(from, reply);
    await recordWhatsAppMessage(from, {
      direction: "outbound",
      content: reply,
      type: "text",
      author: "bot",
      sendStatus: sendResult.success ? "sent" : "failed",
      sendError: sendResult.success ? undefined : sendResult.error,
    });

    if (messageId) {
      await markWhatsAppMessageProcessed(messageId, "completed");
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    await recordWhatsAppWebhookError(error);
    if (messageId) {
      await markWhatsAppMessageProcessed(messageId, "failed", error);
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function claimWhatsAppMessage(messageId: string) {
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

async function markWhatsAppMessageProcessed(messageId: string, status: "completed" | "failed", error?: unknown) {
  await db.collection("processedWhatsAppMessages").doc(messageId).set(
    stripUndefined({
      status,
      error: error instanceof Error ? error.message : error ? String(error) : undefined,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    { merge: true }
  );
}

async function recordWhatsAppMessage(
  waId: string,
  message: {
    direction: "inbound" | "outbound";
    content: string;
    type: string;
    author?: "bot" | "admin";
    mediaId?: string;
    fileName?: string;
    raw?: any;
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
      unread: message.direction === "inbound" ? true : false,
      updatedAt: now,
    },
    { merge: true }
  );

  await sessionRef.collection("messages").add({
    ...stripUndefined(message),
    createdAt: now,
  });
}

function sessionDoc(waId: string) {
  return db.collection(SESSION_COLLECTION).doc(waId);
}

async function handleEarningsCommand(from: string) {
  const productSnap = await db.collection("products").where("userId", "==", creatorIdFromPhone(from)).get();

  return `Your WhatsApp store has ${productSnap.size} product${productSnap.size === 1 ? "" : "s"} live. Full earnings lookup is coming here soon.`;
}

async function handleCustomersCommand(from: string) {
  const transactionSnap = await db.collection("transactions").where("sellerId", "==", creatorIdFromPhone(from)).limit(20).get();

  return `You have ${transactionSnap.size} recent customer record${transactionSnap.size === 1 ? "" : "s"} connected to this WhatsApp store.`;
}

async function handleDiscountCommand(from: string) {
  await sessionDoc(from).set(
    {
      step: "discount_create",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return "Discounts are almost ready here. For now, send the product link and discount amount you want to create.";
}

async function handleNewProductCommand(from: string) {
  await resetWhatsAppSession(from, "product_type");
  return productTypeMessage;
}

async function resetWhatsAppSession(from: string, step: WhatsAppStep) {
  await sessionDoc(from).set(
    {
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
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

function stripUndefined<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );
}

async function recordWhatsAppWebhookError(error: unknown) {
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

async function handleWhatsAppMessage(from: string, message: any) {
  const sessionRef = sessionDoc(from);
  const sessionSnap = await sessionRef.get();
  const session = (sessionSnap.exists ? sessionSnap.data() : {}) as WhatsAppSession;
  const textBody = getMessageText(message);
  const normalizedText = normalize(textBody);

  if (["restart", "start over", "reset"].includes(normalizedText)) {
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  const step = session.step || "welcome";

  const globalHandler = GLOBAL_COMMANDS[normalizedText];
  if (globalHandler) {
    return globalHandler(from, session);
  }

  if (step === "complete" && GREETINGS.includes(normalizedText)) {
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  if (step === "welcome") {
    if (["1", "yes", "yes let's go", "yes lets go", "let's go", "lets go"].includes(normalizedText)) {
      await sessionRef.set(
        { step: "product_type", ...withSessionTimestamps(sessionSnap.exists) },
        { merge: true }
      );
      return productTypeMessage;
    }

    if (["2", "tell me more", "tell me more first", "more"].includes(normalizedText)) {
      await sessionRef.set(
        { step: "product_type", ...withSessionTimestamps(sessionSnap.exists) },
        { merge: true }
      );
      return productTypeMessage;
    }

    await sessionRef.set(
      { step: "welcome", ...withSessionTimestamps(sessionSnap.exists) },
      { merge: true }
    );
    return welcomeMessage;
  }

  if (step === "product_type") {
    const productType = PRODUCT_TYPES[normalizedText];

    if (!productType) {
      return `${productTypeMessage}\n\nPlease reply with 1, 2, 3, or 4.`;
    }

    await sessionRef.set(
      {
        step: "product_name",
        productType,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (productType === "Something else") {
      return "No problem. We'll treat it as a digital file for now. What's your first product called?";
    }

    return "Perfect. What's your first product called?";
  }

  if (step === "product_name") {
    if (!textBody || textBody.length < 2) {
      return "Send the product name as text. For example: My Crypto Guide for Beginners";
    }

    const baseSlug = slugify(textBody) || "product";
    const productSlug = `${baseSlug}-${from.slice(-4) || "wa"}`;

    await sessionRef.set(
      {
        step: "product_price",
        productName: textBody,
        productSlug,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return "Nice. How much are you selling it for? (in Naira)";
  }

  if (step === "product_price") {
    const price = parseNairaPrice(textBody);

    if (!Number.isFinite(price) || price <= 0) {
      return "Please send a valid price in Naira. For example: 5000";
    }

    await sessionRef.set(
      {
        step: "product_file",
        productPrice: price,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return "Got it. Now send me the PDF file directly in this chat.";
  }

  if (step === "product_file") {
    const document = message.document;

    if (!document) {
      return "Send the PDF file directly in this chat so I can attach it to your product.";
    }

    const productSlug = session.productSlug || slugify(session.productName || "product");
    const creatorHandle = creatorHandleFromPhone(from);
    const creatorId = creatorIdFromPhone(from);
    const salesLink = `${SITE_URL}/${creatorHandle}/product/${productSlug}`;
    const storedFile = await storeWhatsAppDocument({
      creatorId,
      mediaId: document.id,
      fileName: document.filename || "product.pdf",
    });
    const productRef = await createWhatsAppProduct({
      creatorId,
      creatorHandle,
      from,
      productSlug,
      productName: session.productName || "Untitled product",
      productType: session.productType || "Digital product",
      productPrice: session.productPrice || 0,
      fileId: document.id,
      fileName: storedFile.fileName,
      fileUrl: storedFile.fileUrl,
    });

    await sessionRef.set(
      {
        step: "bank_prompt",
        productId: productRef.id,
        fileId: document.id,
        fileName: storedFile.fileName,
        fileUrl: storedFile.fileUrl,
        salesLink,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection("whatsappProductDrafts").add({
      waId: from,
      productId: productRef.id,
      productType: session.productType,
      productName: session.productName,
      productPrice: session.productPrice,
      productSlug,
      fileId: document.id,
      fileName: storedFile.fileName,
      fileUrl: storedFile.fileUrl,
      salesLink,
      status: "draft",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return `Uploaded. Your product is ready. Here's your personal sales link:\n${salesLink}\n\nShare that link anywhere — Instagram, Twitter, WhatsApp groups. When someone buys, you'll get notified here and paid straight to your account.\n\nWant to add your bank details now so you can withdraw?\n\nReply with:\n1. Yes, add bank\n2. I'll do it later`;
  }

  if (step === "bank_prompt") {
    if (["1", "yes", "yes add bank", "add bank"].includes(normalizedText)) {
      await sessionRef.set(
        { step: "bank_details", bankSetupRequested: true, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      return "Great. Bank setup is next. For now, send your bank name, account number, and account name in one message.";
    }

    if (["2", "later", "i'll do it later", "ill do it later"].includes(normalizedText)) {
      await sessionRef.set(
        { step: "complete", bankSetupRequested: false, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      return "No problem. Your product draft is saved and your sales link is ready. Reply restart anytime to add another product.";
    }

    return "Reply with 1 to add bank details now, or 2 to do it later.";
  }

  if (step === "bank_details") {
    if (!textBody || textBody.length < 8) {
      return "Send your bank name, account number, and account name in one message.";
    }

    const accountNumber = textBody.match(/\b\d{10}\b/)?.[0] || null;

    await sessionRef.set(
      {
        step: "complete",
        bankingDetailsRaw: textBody,
        accountNumber,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection("whatsappBankDetails").add({
      waId: from,
      details: textBody,
      accountNumber,
      status: "needs_review",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return "Bank details saved. Your WhatsApp onboarding is complete. Reply restart anytime to add another product.";
  }

  return "Your onboarding is complete. Reply restart anytime to add another product.";
}

function parseNairaPrice(value: string) {
  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[₦,\s]/g, "")
    .replace(/k$/i, "000");

  return Number(compact);
}

async function storeWhatsAppDocument({
  creatorId,
  mediaId,
  fileName,
}: {
  creatorId: string;
  mediaId: string;
  fileName: string;
}) {
  const media = await downloadWhatsAppMedia(mediaId);
  const safeFileName = fileName.replace(/[^\w.\-]+/g, "-") || "product-file";
  const storagePath = `whatsapp-products/${creatorId}/${Date.now()}-${safeFileName}`;
  const file = storageBucket.file(storagePath);

  await file.save(media.buffer, {
    contentType: media.contentType,
    resumable: false,
    metadata: {
      cacheControl: "private, max-age=0",
      metadata: {
        whatsappMediaId: mediaId,
      },
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: "01-01-2100",
  });

  return {
    fileName: safeFileName,
    fileUrl: signedUrl,
  };
}

async function createWhatsAppProduct({
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

  await db.collection("users").doc(creatorId).set(
    {
      email: `${creatorId}@whatsapp.pasiveco.local`,
      displayName: creatorHandle,
      emailVerified: false,
      isActive: true,
      role: "user",
      username: creatorHandle,
      slug: creatorHandle,
      phoneNumber: from,
      source: "whatsapp_onboarding",
      links: [],
      socialLinks: [],
      createdAt: now,
      updatedAt: now,
    },
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
