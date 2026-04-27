import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { slugify } from "@/utils/slugify";
import {
  WhatsAppSession,
  PRODUCT_TYPES,
  welcomeMessage,
  productTypeMessage,
  SITE_URL,
  GREETINGS,
} from "../types";
import {
  normalize,
  parseNairaPrice,
  creatorHandleFromPhone,
  creatorIdFromPhone,
  withSessionTimestamps,
  getMessageText,
} from "../utils";
import { sessionDoc, resetWhatsAppSession } from "../session";
import { storeWhatsAppDocument } from "../actions/storeDocument";
import { createWhatsAppProduct } from "../actions/createProduct";
import { handleWhatsAppJobApplication } from "./jobs";

export async function handleCommerceFlow(
  from: string,
  session: WhatsAppSession,
  message: any,
  sessionSnap: any
) {
  const sessionRef = sessionDoc(from);
  const textBody = getMessageText(message);
  const normalizedText = normalize(textBody);
  const step = session.step || "welcome";

  if (step === "complete" && GREETINGS.includes(normalizedText)) {
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  if (step === "welcome") {
    if (
      ["1", "yes", "yes let's go", "yes lets go", "let's go", "lets go"].includes(
        normalizedText
      )
    ) {
      await sessionRef.set(
        { step: "product_type", ...withSessionTimestamps(sessionSnap.exists) },
        { merge: true }
      );
      return productTypeMessage;
    }

    if (
      ["2", "tell me more", "tell me more first", "more"].includes(
        normalizedText
      )
    ) {
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

    const productSlug =
      session.productSlug || slugify(session.productName || "product");
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
        {
          step: "bank_details",
          bankSetupRequested: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return "Great. Bank setup is next. For now, send your bank name, account number, and account name in one message.";
    }

    if (
      ["2", "later", "i'll do it later", "ill do it later"].includes(
        normalizedText
      )
    ) {
      await sessionRef.set(
        {
          step: "complete",
          bankSetupRequested: false,
          updatedAt: FieldValue.serverTimestamp(),
        },
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
