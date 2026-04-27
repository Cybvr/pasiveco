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
      phone: typeof body?.userInfo?.phone === "string" ? body.userInfo.phone.trim() : "",
    }

    if (!userInfo.name || !userInfo.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const ticketId = typeof body?.ticketId === "string" && body.ticketId.trim()
      ? body.ticketId.trim()
      : `PSV-${Math.floor(10000 + Math.random() * 90000)}`

    const userId = typeof body?.userId === "string" ? body.userId : null
    const path = typeof body?.path === "string" ? body.path : null

    if (userId) {
      await db.collection("users").doc(userId).set(
        {
          phoneNumber: userInfo.phone,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
    }

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
      userPhone: userInfo.phone || null,
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
