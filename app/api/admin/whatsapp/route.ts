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
        source: data.source || null,
        supportSessionId: data.supportSessionId || null,
        customerName: data.customerName || null,
        leadSource: data.leadSource || null,
        adHeadline: data.adHeadline || null,
        adSourceId: data.adSourceId || null,
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
    const [recentSnap, fallbackSnap] = await Promise.all([
      db.collection(SESSION_COLLECTION).orderBy("lastMessageAt", "desc").limit(100).get(),
      db.collection(SESSION_COLLECTION).orderBy("updatedAt", "desc").limit(100).get(),
    ]);

    const docsById = new Map(recentSnap.docs.map((doc) => [doc.id, doc]));
    for (const doc of fallbackSnap.docs) {
      docsById.set(doc.id, doc);
    }

    return {
      docs: Array.from(docsById.values()).sort((a, b) => {
        const aData = a.data() as any;
        const bData = b.data() as any;
        const aTime = aData.lastMessageAt?.toMillis?.() || aData.updatedAt?.toMillis?.() || 0;
        const bTime = bData.lastMessageAt?.toMillis?.() || bData.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
      }),
    };
  } catch (error) {
    console.warn("WhatsApp ordered query failed, falling back to unsorted query:", error);
    return db.collection(SESSION_COLLECTION).limit(100).get();
  }
}
