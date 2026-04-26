import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COLLECTION = "whatsappOnboardingSessions";

type RouteContext = {
  params: Promise<{ waId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { waId } = await context.params;
    const sessionRef = db.collection(SESSION_COLLECTION).doc(decodeURIComponent(waId));
    const [sessionSnap, messagesSnap] = await Promise.all([
      sessionRef.get(),
      sessionRef.collection("messages").orderBy("createdAt", "asc").limit(200).get(),
    ]);

    await sessionRef.set(
      { unread: false, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    const session = sessionSnap.exists ? sessionSnap.data() : null;
    const messages = messagesSnap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        direction: data.direction,
        content: data.content || "",
        type: data.type || "text",
        author: data.author || null,
        mediaId: data.mediaId || null,
        fileName: data.fileName || null,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || null,
      };
    });

    return NextResponse.json({
      conversation: {
        waId: decodeURIComponent(waId),
        step: session?.step || "welcome",
        productType: session?.productType || null,
        productName: session?.productName || null,
        productPrice: session?.productPrice || null,
        salesLink: session?.salesLink || null,
      },
      messages,
    });
  } catch (error: any) {
    console.error("WhatsApp thread error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch WhatsApp thread" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { waId } = await context.params;
    const to = decodeURIComponent(waId);
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    const result = await sendWhatsAppMessage(to, text);
    if (!result.success) {
      return NextResponse.json({ error: "Failed to send WhatsApp reply", details: result.error }, { status: 502 });
    }

    const sessionRef = db.collection(SESSION_COLLECTION).doc(to);
    const now = FieldValue.serverTimestamp();

    await sessionRef.set(
      {
        waId: to,
        lastMessage: text,
        lastMessageDirection: "outbound",
        lastMessageAt: now,
        unread: false,
        updatedAt: now,
      },
      { merge: true }
    );

    const messageRef = await sessionRef.collection("messages").add({
      direction: "outbound",
      content: text,
      type: "text",
      author: "admin",
      createdAt: now,
    });

    return NextResponse.json({ success: true, messageId: messageRef.id });
  } catch (error: any) {
    console.error("WhatsApp reply error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send WhatsApp reply" },
      { status: 500 }
    );
  }
}
