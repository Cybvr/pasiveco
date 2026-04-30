import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getWhatsAppMediaType, sendWhatsAppMediaMessage, sendWhatsAppMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COLLECTION = "whatsappSessions";

type RouteContext = {
  params: Promise<{ waId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { waId } = await context.params;
    const decodedWaId = decodeURIComponent(waId);
    const sessionRef = db.collection(SESSION_COLLECTION).doc(decodedWaId);
    const [sessionSnap, messagesSnap] = await Promise.all([
      sessionRef.get(),
      sessionRef.collection("messages").orderBy("createdAt", "asc").limit(200).get(),
    ]);

    if (sessionSnap.exists) {
      await sessionRef.set(
        { unread: false, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

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
        waId: decodedWaId,
        step: session?.step || "welcome",
        productType: session?.productType || null,
        productName: session?.productName || null,
        productPrice: session?.productPrice || null,
        salesLink: session?.salesLink || null,
        source: session?.source || null,
        supportSessionId: session?.supportSessionId || null,
        customerName: session?.customerName || null,
        leadSource: session?.leadSource || null,
        adHeadline: session?.adHeadline || null,
        adSourceId: session?.adSourceId || null,
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
    const contentType = req.headers.get("content-type") || "";
    let text = "";
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const formText = formData.get("text");
      const formFile = formData.get("file");
      text = typeof formText === "string" ? formText.trim() : "";
      file = formFile instanceof File && formFile.size > 0 ? formFile : null;
    } else {
      const body = await req.json();
      text = typeof body?.text === "string" ? body.text.trim() : "";
    }

    if (!text && !file) {
      return NextResponse.json({ error: "Reply text or attachment is required" }, { status: 400 });
    }

    if (file && file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Attachment must be 100MB or less" }, { status: 400 });
    }

    const sessionRef = db.collection(SESSION_COLLECTION).doc(to);
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.exists ? (sessionSnap.data() as any) : {};
    const supportSessionId = typeof session?.supportSessionId === "string" ? session.supportSessionId : null;
    const isMessenger = session?.source === "messenger" || to.startsWith("msgr_");

    let result;
    if (isMessenger) {
      const { sendMessengerMediaMessage, sendMessengerMessage } = await import("@/lib/messenger");
      result = file
        ? await sendMessengerMediaMessage({ to, file, caption: text })
        : await sendMessengerMessage(to, text);
    } else {
      result = file
        ? await sendWhatsAppMediaMessage({ to, file, caption: text })
        : await sendWhatsAppMessage(to, text);
    }

    if (!result.success && !supportSessionId) {
      return NextResponse.json({ error: `Failed to send ${isMessenger ? "Messenger" : "WhatsApp"} reply`, details: result.error }, { status: 502 });
    }

    const now = FieldValue.serverTimestamp();
    const messageType = file ? getWhatsAppMediaType(file.type || "application/octet-stream") : "text";
    const lastMessage = text || (file ? `Sent ${messageType}: ${file.name || "attachment"}` : "");

    await sessionRef.set(
      {
        waId: to,
        lastMessage,
        lastMessageDirection: "outbound",
        lastMessageAt: now,
        unread: false,
        lastSendStatus: result.success ? "sent" : "failed",
        lastSendError: result.success ? null : result.error,
        updatedAt: now,
      },
      { merge: true }
    );

    const messageRef = await sessionRef.collection("messages").add({
      direction: "outbound",
      content: text,
      type: messageType,
      author: "admin",
      mediaId: file ? (result as any).mediaId || null : null,
      fileName: file?.name || null,
      mimeType: file?.type || null,
      fileSize: file?.size || null,
      sendStatus: result.success ? "sent" : "failed",
      sendError: result.success ? null : result.error,
      createdAt: now,
    });

    if (supportSessionId) {
      const supportRef = db.collection("supportSessions").doc(supportSessionId);
      await supportRef.set(
        {
          status: "agent_replied",
          lastResponse: lastMessage,
          updatedAt: now,
          lastMessage,
        },
        { merge: true }
      );
      await supportRef.collection("messages").add({
        role: "assistant",
        content: lastMessage,
        createdAt: now,
        author: "admin",
        source: "whatsapp_admin",
        waId: to,
        attachment: file
          ? {
              fileName: file.name || null,
              mimeType: file.type || null,
              fileSize: file.size || null,
              whatsappMediaId: (result as any).mediaId || null,
              type: messageType,
            }
          : null,
        whatsappSendStatus: result.success ? "sent" : "failed",
        whatsappSendError: result.success ? null : result.error,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: messageRef.id,
      whatsappSent: result.success,
      whatsappError: result.success ? null : result.error,
    });
  } catch (error: any) {
    console.error("WhatsApp reply error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send WhatsApp reply" },
      { status: 500 }
    );
  }
}
