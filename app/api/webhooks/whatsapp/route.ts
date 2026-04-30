import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import {
  WhatsAppSession,
  welcomeMessage,
  productTypeMessage,
} from "./_bot/types";
import {
  normalize,
  getMessageText,
  getInboundPreview,
  isJobApplicationIntent,
  creatorIdFromPhone,
} from "./_bot/utils";
import {
  sessionDoc,
  resetWhatsAppSession,
  resetWhatsAppJobSession,
} from "./_bot/session";
import {
  getWhatsAppContact,
  upsertWhatsAppUserFromContact,
} from "./_bot/user";
import {
  claimWhatsAppMessage,
  recordWhatsAppMessage,
  recordWhatsAppWebhookError,
  markWhatsAppMessageProcessed,
} from "./_bot/db";
import { handleCommerceFlow } from "./_bot/flows/commerce";
import { handleWhatsAppJobApplication } from "./_bot/flows/jobs";

export const runtime = "nodejs";

type GlobalCommandHandler = (
  from: string,
  session: WhatsAppSession
) => Promise<string>;

const GLOBAL_COMMANDS: Record<string, GlobalCommandHandler> = {
  earnings: handleEarningsCommand,
  balance: handleEarningsCommand,
  customers: handleCustomersCommand,
  discount: handleDiscountCommand,
  "new product": handleNewProductCommand,
  jobs: handleJobsCommand,
  job: handleJobsCommand,
  apply: handleJobsCommand,
  careers: handleJobsCommand,
};

async function handleEarningsCommand(from: string) {
  const productSnap = await db
    .collection("products")
    .where("userId", "==", creatorIdFromPhone(from))
    .get();
  return `Your WhatsApp store has ${productSnap.size} product${
    productSnap.size === 1 ? "" : "s"
  } live. Full earnings lookup is coming here soon.`;
}

async function handleCustomersCommand(from: string) {
  const transactionSnap = await db
    .collection("transactions")
    .where("sellerId", "==", creatorIdFromPhone(from))
    .limit(20)
    .get();
  return `You have ${transactionSnap.size} recent customer record${
    transactionSnap.size === 1 ? "" : "s"
  } connected to this WhatsApp store.`;
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

async function handleJobsCommand(from: string) {
  await resetWhatsAppJobSession(from);
  await db
    .collection("users")
    .doc(creatorIdFromPhone(from))
    .set(
      {
        whatsappFlows: FieldValue.arrayUnion("jobs"),
        lastWhatsAppFlow: "jobs",
        lastJobContactAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  return "Amazing. Let's get your application started.\n\nWhat's your full name?";
}

function verifyWebhookSignature(req: NextRequest, rawBody: string) {
  const appSecret =
    process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;
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

function getWhatsAppAdReferral(message: any) {
  const referral = message?.referral || message?.context?.ad || message?.context?.referral;
  if (!referral || typeof referral !== "object") return null;

  return {
    sourceUrl: referral.source_url || null,
    sourceId: referral.source_id || null,
    sourceType: referral.source_type || null,
    headline: referral.headline || null,
    body: referral.body || null,
    mediaType: referral.media_type || null,
    imageUrl: referral.image_url || referral.image?.url || null,
    videoUrl: referral.video_url || referral.video?.url || null,
    thumbnailUrl: referral.thumbnail_url || referral.video?.thumbnail_url || null,
    ctwaClid: referral.ctwa_clid || referral.conversion?.ctwa_clid || null,
    welcomeMessage: referral.welcome_message || null,
    raw: referral,
  };
}

async function captureWhatsAppAdLead({
  from,
  messageId,
  referral,
  contact,
  preview,
}: {
  from: string;
  messageId?: string;
  referral: ReturnType<typeof getWhatsAppAdReferral>;
  contact?: any;
  preview: string;
}) {
  if (!referral) return;

  const now = FieldValue.serverTimestamp();
  const lead = {
    waId: from,
    messageId: messageId || null,
    profileName: contact?.profile?.name || null,
    preview,
    referral,
    source: "click_to_whatsapp_ad",
    sourceId: referral.sourceId,
    sourceType: referral.sourceType,
    sourceUrl: referral.sourceUrl,
    headline: referral.headline,
    ctwaClid: referral.ctwaClid,
    createdAt: now,
    updatedAt: now,
  };

  await Promise.all([
    db.collection("whatsappAdLeads").add(lead),
    sessionDoc(from).set(
      {
        leadSource: "click_to_whatsapp_ad",
        lastAdReferral: referral,
        adSourceId: referral.sourceId,
        adSourceType: referral.sourceType,
        adSourceUrl: referral.sourceUrl,
        adHeadline: referral.headline,
        adClickId: referral.ctwaClid,
        adLeadCapturedAt: now,
        updatedAt: now,
      },
      { merge: true }
    ),
    db.collection("users").doc(creatorIdFromPhone(from)).set(
      {
        leadSource: "click_to_whatsapp_ad",
        lastWhatsAppAdReferral: referral,
        lastWhatsAppAdMessageId: messageId || null,
        lastWhatsAppAdContactAt: now,
        updatedAt: now,
      },
      { merge: true }
    ),
  ]);
}

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

export async function POST(req: NextRequest) {
  let messageId: string | undefined;
  try {
    const rawBody = await req.text();
    if (!verifyWebhookSignature(req, rawBody)) {
      await recordWhatsAppWebhookError("Invalid WhatsApp webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    const body = JSON.parse(rawBody);
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // No message in this webhook payload. This can happen with Click-to-WhatsApp
      // ads that use Chat Builder — Meta fires a lead notification with contacts
      // data before the user has sent any WhatsApp message. Capture the contact
      // so the conversation appears in the admin dashboard straight away.
      const ctwaContacts = Array.isArray(value?.contacts) ? value.contacts : [];
      const ctwaContact = ctwaContacts[0];
      const ctwaFrom = ctwaContact?.wa_id;
      if (ctwaFrom) {
        try {
          await upsertWhatsAppUserFromContact(ctwaFrom, ctwaContact);
          const ctwaName = ctwaContact?.profile?.name?.trim() || null;
          await sessionDoc(ctwaFrom).set(
            {
              waId: ctwaFrom,
              ...(ctwaName ? { customerName: ctwaName } : {}),
              source: "click_to_whatsapp_ad",
              lastMessage: "(Ad lead — awaiting first message)",
              lastMessageAt: FieldValue.serverTimestamp(),
              unread: true,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          // Send welcome so the user sees something immediately.
          const welcomeReply = await handleWhatsAppMessage(ctwaFrom, {
            from: ctwaFrom,
            type: "text",
            text: { body: "" },
          });
          const sendResult = await sendWhatsAppMessage(ctwaFrom, welcomeReply);
          await recordWhatsAppMessage(ctwaFrom, {
            direction: "outbound",
            content: welcomeReply,
            type: "text",
            author: "bot",
            sendStatus: sendResult.success ? "sent" : "failed",
          });
        } catch (ctwaErr) {
          console.error("Failed to capture CTWA contact without message:", ctwaErr);
        }
      }
      return NextResponse.json({ status: "ignored" });
    }

    // Guard against malformed payloads where from is missing.
    if (!value?.messages?.[0]?.from) {
      return NextResponse.json({ status: "ignored" });
    }

    messageId = message.id;
    if (messageId) {
      const processResult = await claimWhatsAppMessage(messageId);
      if (!processResult) {
        return NextResponse.json({ status: "duplicate" });
      }
    }

    const from = message.from;
    const contact = getWhatsAppContact(value, from);
    await upsertWhatsAppUserFromContact(from, contact);

    // Mirror the contact's display name onto the session doc so the admin
    // WhatsApp dashboard can show a human-readable name instead of the raw
    // phone number. The users collection is never read by the admin API.
    const contactProfileName = contact?.profile?.name?.trim() || null;
    if (contactProfileName) {
      await sessionDoc(from).set(
        { customerName: contactProfileName, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    const preview = getInboundPreview(message);
    const adReferral = getWhatsAppAdReferral(message);
    await captureWhatsAppAdLead({
      from,
      messageId,
      referral: adReferral,
      contact,
      preview,
    });

    await recordWhatsAppMessage(from, {
      direction: "inbound",
      content: preview,
      type: message.type || "unknown",
      mediaId: message.document?.id,
      fileName: message.document?.filename,
      referral: adReferral,
      raw: message,
    });

    const supportBridgeSnap = await sessionDoc(from).get();
    const supportBridge = supportBridgeSnap.exists ? (supportBridgeSnap.data() as any) : null;
    if (supportBridge?.source === "support_widget" && supportBridge?.supportSessionId) {
      await db
        .collection("supportSessions")
        .doc(supportBridge.supportSessionId)
        .collection("messages")
        .add({
          role: "user",
          content: preview,
          createdAt: FieldValue.serverTimestamp(),
          source: "whatsapp_inbound",
          waId: from,
          referral: adReferral,
        });

      await db
        .collection("supportSessions")
        .doc(supportBridge.supportSessionId)
        .set(
          {
            status: "needs_handoff",
            lastMessage: preview,
            lastAdReferral: adReferral,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      if (messageId) {
        await markWhatsAppMessageProcessed(messageId, "completed");
      }
      return NextResponse.json({ status: "support_bridge" });
    }

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

async function handleWhatsAppMessage(from: string, message: any) {
  const sessionRef = sessionDoc(from);
  const sessionSnap = await sessionRef.get();
  let session = (
    sessionSnap.exists ? sessionSnap.data() : {}
  ) as WhatsAppSession;

  const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  if (sessionSnap.exists && session.updatedAt) {
    try {
      const lastUpdate = session.updatedAt.toDate().getTime();
      if (Date.now() - lastUpdate > SESSION_EXPIRY_MS) {
        session = {};
      }
    } catch (e) {
      // Ignore timestamp errors
    }
  }

  const textBody = getMessageText(message);
  const normalizedText = normalize(textBody);
  const hasJobIntent = isJobApplicationIntent(normalizedText);

  // Explicit reset commands always take priority.
  if (["restart", "start over", "reset"].includes(normalizedText)) {
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  // Brand-new users (no established flow/step) must go through the welcome
  // message first. This prevents broad job-intent regex matches on a user's
  // very first text (e.g. "Hi, I'd like to apply for something") from
  // silently routing them into the job application flow.
  // We still honour an explicit, standalone job command from a fresh start.
  const EXPLICIT_JOB_COMMANDS = new Set(["jobs", "job", "apply", "careers", "career"]);
  const isNewSession = !session.flow && !session.step;
  if (isNewSession) {
    if (EXPLICIT_JOB_COMMANDS.has(normalizedText)) {
      return handleJobsCommand(from);
    }
    // All other first messages → welcome screen.
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  // Completed jobs flow + no further job intent → back to main menu.
  if (session.flow === "jobs" && session.step === "complete" && !hasJobIntent) {
    await resetWhatsAppSession(from, "welcome");
    return welcomeMessage;
  }

  // Mid-session job intent (user is in commerce flow but mentions jobs).
  if (
    hasJobIntent &&
    (session.flow !== "jobs" || session.step === "complete")
  ) {
    return handleJobsCommand(from);
  }

  const globalHandler = GLOBAL_COMMANDS[normalizedText];
  if (globalHandler) {
    return globalHandler(from, session);
  }

  if (session.flow === "jobs" || (session.step && session.step.startsWith("job_"))) {
    return handleWhatsAppJobApplication(from, session, textBody, normalizedText);
  }

  return handleCommerceFlow(from, session, message, sessionSnap);
}
