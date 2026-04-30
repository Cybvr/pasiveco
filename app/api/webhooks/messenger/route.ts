import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

const SESSION_COLLECTION = "whatsappSessions"; // We'll reuse the same collection for a unified dashboard

function verifyWebhookSignature(req: NextRequest, rawBody: string) {
  const appSecret = process.env.MESSENGER_APP_SECRET || process.env.META_APP_SECRET;
  if (!appSecret) return true; // Only for local dev if secret not set
  
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature?.startsWith("sha256=")) return false;
  
  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
    
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  
  // You should set this in your .env
  const verifyToken = process.env.MESSENGER_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;
  
  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!verifyWebhookSignature(req, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    if (body.object !== "page") {
      return NextResponse.json({ error: "Not a page object" }, { status: 404 });
    }

    // Messenger sends messages in an array
    for (const entry of body.entry) {
      const messaging = entry.messaging;
      if (!messaging) continue;

      for (const event of messaging) {
        const senderId = event.sender.id;
        
        // Handle incoming message
        if (event.message) {
          await handleMessengerMessage(senderId, event.message, event.referral);
        } 
        // Handle postbacks (buttons)
        else if (event.postback) {
          await handleMessengerPostback(senderId, event.postback);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Messenger Webhook Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleMessengerMessage(senderId: string, message: any, referral: any) {
  const text = message.text || "";
  const now = FieldValue.serverTimestamp();
  
  // We'll prefix the ID to avoid collisions with WhatsApp IDs if necessary
  const waId = `msgr_${senderId}`; 

  // Try to fetch profile info
  let customerName = null;
  try {
    const { getMessengerProfile } = await import("@/lib/messenger");
    const profile = await getMessengerProfile(senderId);
    if (profile?.name) customerName = profile.name;
  } catch (err) {
    console.error("Failed to fetch messenger profile:", err);
  }

  // 1. Update/Create Session
  await db.collection(SESSION_COLLECTION).doc(waId).set({
    waId,
    source: "messenger",
    ...(customerName ? { customerName } : {}),
    lastMessage: text || "(Media/Attachment)",
    lastMessageAt: now,
    lastMessageDirection: "inbound",
    unread: true,
    updatedAt: now,
    // Capture ad referral if present (Messenger payload is slightly different)
    ...(referral ? {
      leadSource: "click_to_messenger_ad",
      adHeadline: referral.headline || null,
      adSourceId: referral.source_id || null,
      adSourceType: referral.source_type || null,
      adSourceUrl: referral.source_url || null,
    } : {})
  }, { merge: true });

  // 2. Record Message
  await db.collection(SESSION_COLLECTION).doc(waId).collection("messages").add({
    direction: "inbound",
    content: text,
    type: message.attachments ? "media" : "text",
    createdAt: now,
    raw: message
  });
  
  console.log(`[Messenger] Message from ${customerName || senderId}: ${text}`);
}

async function handleMessengerPostback(senderId: string, postback: any) {
  // Logic for handling button clicks
  console.log(`[Messenger] Postback from ${senderId}:`, postback.payload);
}
