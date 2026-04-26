import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COLLECTION = "whatsappSessions";

export async function GET() {
  try {
    const snap = await getSessionSnapshot();

    const conversations = snap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        waId: doc.id,
        step: data.step || "welcome",
        productType: data.productType || null,
        productName: data.productName || null,
        productPrice: data.productPrice || null,
        salesLink: data.salesLink || null,
        lastMessage: data.lastMessage || "",
        lastMessageDirection: data.lastMessageDirection || null,
        lastMessageAt: data.lastMessageAt?.toDate?.().toISOString?.() || null,
        unread: Boolean(data.unread),
      };
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("WhatsApp conversations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch WhatsApp conversations" },
      { status: 500 }
    );
  }
}

async function getSessionSnapshot() {
  try {
    return await db.collection(SESSION_COLLECTION).orderBy("lastMessageAt", "desc").limit(100).get();
  } catch (error) {
    console.warn("WhatsApp ordered query failed, falling back to unsorted query:", error);
    return db.collection(SESSION_COLLECTION).limit(100).get();
  }
}
