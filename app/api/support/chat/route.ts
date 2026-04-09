import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase-admin"
import { getHelpDocs } from "@/lib/help-docs"

export const runtime = "nodejs"

// ── GET: fetch messages for a session ──────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const userId = req.nextUrl.searchParams.get("userId")

    if (!sessionId && !userId) {
      return NextResponse.json({ error: "sessionId or userId is required" }, { status: 400 })
    }

    let sessionRef = sessionId ? db.collection("supportSessions").doc(sessionId) : null
    let sessionSnap = sessionRef ? await sessionRef.get() : null

    if ((!sessionSnap || !sessionSnap.exists) && userId) {
      let recentSnap
      try {
        recentSnap = await db.collection("supportSessions")
          .where("userId", "==", userId)
          .orderBy("updatedAt", "desc")
          .limit(1)
          .get()
      } catch {
        recentSnap = await db.collection("supportSessions")
          .where("userId", "==", userId)
          .limit(1)
          .get()
      }

      if (!recentSnap.empty) {
        sessionRef = recentSnap.docs[0].ref
        sessionSnap = recentSnap.docs[0]
      }
    }

    if (!sessionSnap?.exists || !sessionRef) {
      return NextResponse.json({ messages: [], ticketId: null })
    }

    const sessionData = sessionSnap.data()
    const messagesSnap = await sessionRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get()

    const messages = messagesSnap.docs
      .map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          role: d.role as "assistant" | "user" | "system",
          content: d.content as string,
          ts: d.createdAt?.toMillis?.() ?? Date.now(),
          ...(d.ctaLabel ? { ctaLabel: d.ctaLabel } : {}),
          ...(d.ctaHref ? { ctaHref: d.ctaHref } : {}),
        }
      })
      .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")

    return NextResponse.json({
      messages,
      ticketId: sessionData?.ticketId ?? null,
      sessionId: sessionSnap.id,
    })
  } catch (error: any) {
    console.error("Support GET error:", error)
    return NextResponse.json({ error: error?.message || "Failed to fetch messages" }, { status: 500 })
  }
}


function genTicket() {
  return `PSV-${Math.floor(10000 + Math.random() * 90000)}`
}

function sanitizeHistory(history: Array<{ role: string; content: string }>) {
  return history
    .filter((item) => item && typeof item.content === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.trim(),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-12)
}

function buildDocsContext() {
  const docs = getHelpDocs()
  return docs
    .map((doc) => {
      const highlights = doc.sections
        .flatMap((section) => [
          ...(section.paragraphs ?? []),
          ...(section.bullets ?? []),
        ])
        .filter(Boolean)
        .slice(0, 2)
      return [
        `Title: ${doc.title}`,
        `Category: ${doc.category}`,
        `Summary: ${doc.summary}`,
        highlights.length ? `Highlights: ${highlights.join(" ")}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    const ticketId = typeof body?.ticketId === "string" && body.ticketId.trim()
      ? body.ticketId.trim()
      : genTicket()

    const sessionId = typeof body?.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : null

    const userInfo = {
      name: typeof body?.userInfo?.name === "string" ? body.userInfo.name.trim() : "",
      email: typeof body?.userInfo?.email === "string" ? body.userInfo.email.trim() : "",
    }

    const userId = typeof body?.userId === "string" ? body.userId : null
    const path = typeof body?.path === "string" ? body.path : null

    const sessionRef = sessionId
      ? db.collection("supportSessions").doc(sessionId)
      : db.collection("supportSessions").doc()

    if (!sessionId) {
      await sessionRef.set({
        ticketId,
        status: "open",
        source: "widget",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        userId,
        userName: userInfo.name || null,
        userEmail: userInfo.email || null,
        path,
        lastMessage: message,
      })
    } else {
      await sessionRef.set(
        {
          updatedAt: FieldValue.serverTimestamp(),
          userId,
          userName: userInfo.name || null,
          userEmail: userInfo.email || null,
          path,
          lastMessage: message,
        },
        { merge: true }
      )
    }

    const userMsgRef = sessionRef.collection("messages").doc()
    await userMsgRef.set({
      role: "user",
      content: message,
      createdAt: FieldValue.serverTimestamp(),
      userId,
      userName: userInfo.name || null,
      userEmail: userInfo.email || null,
    })

    const history = sanitizeHistory(Array.isArray(body?.history) ? body.history : [])

    const docsContext = buildDocsContext()

    const systemPrompt = `You are Pasive support. Be concise (<= 120 words), friendly, and practical.\n\nUse the Help Docs to answer questions accurately. If unsure, ask one clarifying question. If the user asks for a human or an agent, set shouldHandoff to true.\n\nReturn ONLY valid JSON in this format:\n{"reply":"...","shouldHandoff":false}`

    const transcript = history
      .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`)
      .join("\n")

    const prompt = [
      systemPrompt,
      `User name: ${userInfo.name || "Unknown"}`,
      `User email: ${userInfo.email || "Unknown"}`,
      path ? `Page: ${path}` : null,
      "\nHelp Docs:\n" + docsContext,
      transcript ? "\nConversation so far:\n" + transcript : null,
      `\nUser: ${message}`,
    ]
      .filter(Boolean)
      .join("\n")

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    })

    const result = await model.generateContent(prompt)
    const responseText = result.response?.text?.() || ""

    let reply = ""
    let shouldHandoff = false

    try {
      const parsed = JSON.parse(responseText)
      reply = typeof parsed.reply === "string" ? parsed.reply.trim() : ""
      shouldHandoff = Boolean(parsed.shouldHandoff)
    } catch {
      reply = responseText.trim()
    }

    if (!reply) {
      reply = "Thanks for reaching out. I can help with setup, payouts, products, or account questions. What do you need help with?"
    }

    const assistantRef = sessionRef.collection("messages").doc()
    await assistantRef.set({
      role: "assistant",
      content: reply,
      createdAt: FieldValue.serverTimestamp(),
      model: "gemini-2.0-flash",
      shouldHandoff,
    })

    await sessionRef.set(
      {
        updatedAt: FieldValue.serverTimestamp(),
        lastResponse: reply,
        status: shouldHandoff ? "needs_handoff" : "open",
      },
      { merge: true }
    )

    return NextResponse.json({
      sessionId: sessionRef.id,
      ticketId,
      reply,
      shouldHandoff,
    })
  } catch (error: any) {
    console.error("Support chat error:", error)
    return NextResponse.json(
      { error: error?.message || "Support chat failed" },
      { status: 500 }
    )
  }
}
