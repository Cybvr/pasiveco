import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
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
        const ctaHref = typeof d.ctaHref === "string" ? d.ctaHref : ""
        const showCta = Boolean(ctaHref && !isWhatsAppCtaHref(ctaHref))
        return {
          id: doc.id,
          role: d.role as "assistant" | "user" | "system",
          content: d.content as string,
          ts: d.createdAt?.toMillis?.() ?? Date.now(),
          ...(showCta && d.ctaLabel ? { ctaLabel: d.ctaLabel, ctaHref } : {}),
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

function isWhatsAppCtaHref(href?: string) {
  return Boolean(href && /(wa\.me|whatsapp)/i.test(href))
}

function sanitizeHistory(history: Array<{ role: string; content: string }>) {
  return history
    .filter((item) => item && typeof item.content === "string")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" as const : "user" as const,
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

function isAgentHandoffMessage(message: string) {
  const normalized = message.toLowerCase()
  return /\b(agent|human|person|support team|customer support|representative)\b/.test(normalized)
}

function normalizePhoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "")
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || ""
}

async function saveUserPhoneNumber(userId: string | null, phone: string) {
  const trimmedPhone = phone.trim()
  if (!userId || !trimmedPhone) return

  await db.collection("users").doc(userId).set(
    {
      phoneNumber: trimmedPhone,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

async function bridgeSupportSessionToWhatsAppInbox({
  supportSessionId,
  ticketId,
  userInfo,
  userId,
  path,
  message,
}: {
  supportSessionId: string
  ticketId: string
  userInfo: { name: string; email: string; phone: string }
  userId: string | null
  path: string | null
  message: string
}) {
  const waId = normalizePhoneForWhatsApp(userInfo.phone)
  if (!waId) return null

  const now = FieldValue.serverTimestamp()
  const sessionRef = db.collection("whatsappSessions").doc(waId)

  await sessionRef.set(
    {
      waId,
      flow: "support",
      step: "support_handoff",
      source: "support_widget",
      supportSessionId,
      supportTicketId: ticketId,
      supportUserId: userId,
      supportPath: path,
      customerName: userInfo.name || null,
      customerEmail: userInfo.email || null,
      customerPhone: userInfo.phone || null,
      productName: "Support widget",
      lastMessage: message,
      lastMessageDirection: "inbound",
      lastMessageAt: now,
      unread: true,
      updatedAt: now,
    },
    { merge: true }
  )

  await sessionRef.collection("messages").add({
    direction: "inbound",
    content: message,
    type: "text",
    author: "widget",
    source: "support_widget",
    supportSessionId,
    createdAt: now,
  })

  return waId
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
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
      phone: typeof body?.userInfo?.phone === "string" ? body.userInfo.phone.trim() : "",
    }

    const userId = typeof body?.userId === "string" ? body.userId : null
    const path = typeof body?.path === "string" ? body.path : null
    await saveUserPhoneNumber(userId, userInfo.phone)

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
        userPhone: userInfo.phone || null,
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
          userPhone: userInfo.phone || null,
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
      userPhone: userInfo.phone || null,
    })

    const currentSessionSnap = await sessionRef.get()
    const currentSession = currentSessionSnap.exists ? (currentSessionSnap.data() as any) : {}
    const alreadyHandedOff = Boolean(
      currentSession?.supportWaId ||
      currentSession?.status === "needs_handoff" ||
      currentSession?.status === "agent_replied"
    )

    if (alreadyHandedOff && !isAgentHandoffMessage(message)) {
      const bridgedWaId = await bridgeSupportSessionToWhatsAppInbox({
        supportSessionId: sessionRef.id,
        ticketId,
        userInfo: {
          ...userInfo,
          phone: userInfo.phone || currentSession?.userPhone || currentSession?.supportWaId || "",
        },
        userId,
        path,
        message,
      })

      await sessionRef.set(
        {
          updatedAt: FieldValue.serverTimestamp(),
          status: "needs_handoff",
          supportWaId: bridgedWaId || currentSession?.supportWaId || null,
        },
        { merge: true }
      )

      return NextResponse.json({
        sessionId: sessionRef.id,
        ticketId,
        reply: "",
        shouldHandoff: true,
      })
    }

    if (isAgentHandoffMessage(message)) {
      const bridgedWaId = await bridgeSupportSessionToWhatsAppInbox({
        supportSessionId: sessionRef.id,
        ticketId,
        userInfo,
        userId,
        path,
        message,
      })

      const name = firstName(userInfo.name)
      const reply = name
        ? `Hi ${name}, I've connected this chat to our support team. What can we help you with?`
        : "I've connected this chat to our support team. What can we help you with?"

      const assistantRef = sessionRef.collection("messages").doc()
      await assistantRef.set({
        role: "assistant",
        content: reply,
        createdAt: FieldValue.serverTimestamp(),
        shouldHandoff: true,
      })

      await sessionRef.set(
        {
          updatedAt: FieldValue.serverTimestamp(),
          lastResponse: reply,
          status: "needs_handoff",
          handoffRequestedAt: FieldValue.serverTimestamp(),
          supportWaId: bridgedWaId,
        },
        { merge: true }
      )

      return NextResponse.json({
        sessionId: sessionRef.id,
        ticketId,
        reply,
        shouldHandoff: true,
      })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 })
    }
    const openai = new OpenAI({ apiKey })

    const history = sanitizeHistory(Array.isArray(body?.history) ? body.history : [])
    const docsContext = buildDocsContext()

    const systemPrompt = `You are Pasive support. Be concise (<= 120 words), friendly, and practical.
Use the Help Docs to answer questions accurately. If unsure, ask one clarifying question. 

IMPORTANT: If the user asks for a human, an agent, or if you cannot resolve their issue, keep them in this support chat and say our support team will reply here in Messages. Do not mention WhatsApp or external chat links.
Return ONLY valid JSON in this format:
{"reply":"...","shouldHandoff":false}

If shouldHandoff is true, your reply should mention that the conversation has been flagged for the support team to reply here in Messages.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({ role: m.role === "assistant" ? "assistant" as const : "user" as const, content: m.content })),
        { role: "user", content: `User details: ${JSON.stringify(userInfo)}. Current page: ${path}. Help Docs: ${docsContext}\n\nUser Message: ${message}` }
      ],
      response_format: { type: "json_object" }
    })

    const responseText = completion.choices[0].message.content || ""
    
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
      model: "gpt-4o-mini",
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
