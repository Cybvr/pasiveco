import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const snap = await db.collection("managerSessions")
      .where("userId", "==", userId)
      .get()

    const sortedDocs = snap.docs.sort((a, b) => {
      const aTime = a.data().updatedAt?.toMillis?.() ?? 0
      const bTime = b.data().updatedAt?.toMillis?.() ?? 0
      return bTime - aTime
    }).slice(0, 8)

    const sessions = sortedDocs.map((doc) => {
      const d = doc.data() as any
      return {
        id: doc.id,
        title: d.title || "Chat",
        lastMessage: d.lastMessage || "",
        updatedAt: d.updatedAt?.toDate?.().toISOString?.() ?? null,
      }
    })

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error("Manager sessions error:", error)
    return NextResponse.json({ error: error?.message || "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    if (!sessionId || !title) {
      return NextResponse.json({ error: "sessionId and title are required" }, { status: 400 })
    }

    await db.collection("managerSessions").doc(sessionId).set(
      { title },
      { merge: true }
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Manager sessions PATCH error:", error)
    return NextResponse.json({ error: error?.message || "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }

    const sessionRef = db.collection("managerSessions").doc(sessionId)
    const messagesRef = sessionRef.collection("messages")
    const messagesSnap = await messagesRef.get()

    const chunks: any[] = []
    let batch = db.batch()
    let count = 0

    messagesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref)
      count += 1
      if (count === 400) {
        chunks.push(batch)
        batch = db.batch()
        count = 0
      }
    })
    chunks.push(batch)
    await Promise.all(chunks.map((b) => b.commit()))

    await sessionRef.delete()

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Manager sessions DELETE error:", error)
    return NextResponse.json({ error: error?.message || "Failed to delete session" }, { status: 500 })
  }
}
