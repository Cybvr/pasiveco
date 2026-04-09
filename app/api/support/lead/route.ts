import { NextRequest, NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const userInfo = {
      name: typeof body?.userInfo?.name === "string" ? body.userInfo.name.trim() : "",
      email: typeof body?.userInfo?.email === "string" ? body.userInfo.email.trim() : "",
    }

    if (!userInfo.name || !userInfo.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const ticketId = typeof body?.ticketId === "string" && body.ticketId.trim()
      ? body.ticketId.trim()
      : `PSV-${Math.floor(10000 + Math.random() * 90000)}`

    const userId = typeof body?.userId === "string" ? body.userId : null
    const path = typeof body?.path === "string" ? body.path : null

    const sessionRef = db.collection("supportSessions").doc()
    await sessionRef.set({
      ticketId,
      status: "lead",
      source: "widget",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      userId,
      userName: userInfo.name || null,
      userEmail: userInfo.email || null,
      path,
      lastMessage: null,
    })

    return NextResponse.json({
      sessionId: sessionRef.id,
      ticketId,
    })
  } catch (error: any) {
    console.error("Support lead error:", error)
    return NextResponse.json({ error: error?.message || "Failed to capture lead" }, { status: 500 })
  }
}
