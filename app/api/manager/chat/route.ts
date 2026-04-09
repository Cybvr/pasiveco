import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/lib/firebase-admin"
import { getHelpDocs } from "@/lib/help-docs"

export const runtime = "nodejs"

type MetricSummary = {
  productsCount: number
  totalEarnings: number
  availableBalance: number
  successfulTransactions: number
  lastTransactionAt: string | null
  customersCount: number
  refundedCount: number
  refundedAmount: number
  lastPayoutAt: string | null
  topProduct: { id: string; name: string; revenue: number; count: number } | null
  payoutAccountsCount: number
  currency: string | null
  displayName: string | null
}

type AnswerPayload = {
  answer: string
  usedData: boolean
}

async function getMetrics(userId: string): Promise<MetricSummary> {
  const [productsSnap, txSnap, userSnap] = await Promise.all([
    db.collection("products").where("userId", "==", userId).get(),
    db.collection("transactions").where("sellerId", "==", userId).get(),
    db.collection("users").doc(userId).get(),
  ])

  let totalEarnings = 0
  let availableBalance = 0
  let successfulTransactions = 0
  let lastTransactionAt: string | null = null
  let lastPayoutAt: string | null = null
  let currency: string | null = null
  let refundedCount = 0
  let refundedAmount = 0
  const customerEmails = new Set<string>()
  const productTotals = new Map<string, { name: string; revenue: number; count: number }>()

  txSnap.forEach((doc) => {
    const data = doc.data() as any
    const status = data?.status
    if (status === "success") {
      successfulTransactions += 1
      const amount = Number(data?.yourProfit ?? data?.amount ?? 0)
      totalEarnings += amount
      if (!data?.payoutDate) {
        availableBalance += amount
      }
      if (!currency && typeof data?.currency === "string") currency = data.currency
      if (typeof data?.customerEmail === "string") {
        customerEmails.add(data.customerEmail.toLowerCase())
      }
      if (data?.productId) {
        const key = String(data.productId)
        const existing = productTotals.get(key) || { name: data.productName || "Product", revenue: 0, count: 0 }
        existing.revenue += amount
        existing.count += 1
        if (!existing.name && data?.productName) existing.name = data.productName
        productTotals.set(key, existing)
      }
      const createdAt = data?.createdAt?.toDate?.() || null
      if (createdAt) {
        const iso = createdAt.toISOString()
        if (!lastTransactionAt || iso > lastTransactionAt) lastTransactionAt = iso
      }
      const payoutAt = data?.payoutDate?.toDate?.() || null
      if (payoutAt) {
        const iso = payoutAt.toISOString()
        if (!lastPayoutAt || iso > lastPayoutAt) lastPayoutAt = iso
      }
    }
    if (status === "refunded") {
      refundedCount += 1
      refundedAmount += Number(data?.yourProfit ?? data?.amount ?? 0)
    }
  })

  const userData = userSnap.exists ? userSnap.data() as any : null
  const payoutAccounts = Array.isArray(userData?.payoutAccounts) ? userData.payoutAccounts : []
  const payoutAccountsCount = payoutAccounts.length || (userData?.bankingDetails ? 1 : 0)
  const topProduct = Array.from(productTotals.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)[0] || null

  return {
    productsCount: productsSnap.size,
    totalEarnings,
    availableBalance,
    successfulTransactions,
    lastTransactionAt,
    customersCount: customerEmails.size,
    refundedCount,
    refundedAmount,
    lastPayoutAt,
    topProduct,
    payoutAccountsCount,
    currency,
    displayName: userData?.displayName || userData?.username || null,
  }
}

function buildGreeting(metrics: MetricSummary) {
  const name = metrics.displayName ? `, ${metrics.displayName}` : ""
  const balance = metrics.currency
    ? `${metrics.currency} ${Math.round(metrics.availableBalance).toLocaleString()}`
    : `${Math.round(metrics.availableBalance).toLocaleString()}`
  return `Hey${name}! Your available balance is ${balance} across ${metrics.productsCount} products. What do you need help with today?`
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

function fmtMoney(amount: number, currency?: string | null) {
  if (!currency) return amount.toLocaleString()
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

// Keywords that signal an off-topic, non-business question
const OFF_TOPIC_SIGNALS = [
  "weather", "temperature", "forecast", "rain", "sunny", "celsius", "fahrenheit",
  "news", "sport", "football", "soccer", "basketball", "cricket", "nba", "nfl",
  "movie", "film", "song", "music", "recipe", "cook", "food",
  "joke", "poem", "write me", "tell me a story",
  "politics", "election", "president", "government",
  "stock price", "bitcoin", "crypto", "forex",
]

// Keywords that signal a question about the Pasive platform itself
const PLATFORM_SIGNALS = [
  "what is pasive", "how does pasive", "pasive work", "about pasive",
  "how do i get paid", "how do payouts work", "payout work", "how are payouts",
  "stripe", "flutterwave", "affiliate", "commission",
  "how do i add a product", "how to add product", "add an offer",
  "how do i set up", "set up my page", "set up my profile",
  "what is the affiliate", "affiliate network", "how does affiliate",
  "platform", "pricing", "plan", "subscription", "free plan", "creator plus",
  "analytics", "how do i track", "clicks", "traffic",
  "getting started", "onboarding",
]

function detectIntent(message: string) {
  const t = message.toLowerCase()

  // Off-topic check first
  if (OFF_TOPIC_SIGNALS.some((s) => t.includes(s))) return "off_topic"

  // Pasive platform questions
  if (PLATFORM_SIGNALS.some((s) => t.includes(s))) return "platform_question"

  if (t.includes("recent sale") || t.includes("recent sales") || t.includes("latest sale")) return "recent_sales"
  if (t.includes("how many products") || t.includes("products count")) return "products_count"
  if (t.includes("available balance") || t.includes("balance")) return "available_balance"
  if (t.includes("payout account") || t.includes("payout method") || t.includes("bank")) return "payout_accounts"
  if (t.includes("refund") || t.includes("refunded")) return "refunds"
  if (t.includes("top product") || t.includes("best product")) return "top_product"
  if (t.includes("last payout") || t.includes("payout date")) return "last_payout"
  if (t.includes("customers") || t.includes("customer count")) return "customers_count"
  return "unknown"
}

function buildDocsContext() {
  const docs = getHelpDocs()
  return docs
    .map((doc) => {
      const highlights = doc.sections
        .flatMap((section: any) => [
          ...(section.paragraphs ?? []),
          ...(section.bullets ?? []),
        ])
        .filter(Boolean)
        .slice(0, 3)
      return [
        `Title: ${doc.title}`,
        `Summary: ${doc.summary}`,
        highlights.length ? `Details: ${highlights.join(" ")}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n")
}

/**
 * Returns true if the message looks like gibberish or is too unclear to act on.
 * Heuristics:
 *  - Very short (≤3 chars)
 *  - No vowels in any word longer than 2 chars (e.g. "dcnkcdc")
 *  - High ratio of non-alpha characters mixed in a short string
 */
function isGibberish(message: string): boolean {
  const trimmed = message.trim()
  if (trimmed.length <= 3) return true

  // If the whole message is a single token with no vowels and length > 3, it's gibberish
  const words = trimmed.split(/\s+/)
  const vowelRe = /[aeiou]/i
  const allWordsGibberish = words.every((w) => {
    if (w.length <= 2) return true // short tokens are ambiguous; skip
    // word has no vowels at all
    if (!vowelRe.test(w)) return true
    return false
  })

  if (allWordsGibberish) return true

  // If the string is very short and has no common English words, flag it
  const commonWords = new Set([
    "hi", "hey", "hello", "ok", "okay", "yes", "no", "thanks", "thank", "help",
    "show", "get", "give", "what", "how", "when", "my", "me", "i", "the", "a",
    "is", "are", "can", "do", "did", "will", "have", "has",
  ])
  const hasCommonWord = words.some((w) => commonWords.has(w.toLowerCase().replace(/[^a-z]/g, "")))
  if (!hasCommonWord && trimmed.length < 20 && words.length <= 3) {
    // Check if most characters are consonants (no vowels in the whole message)
    const letters = trimmed.replace(/[^a-zA-Z]/g, "")
    if (letters.length > 0 && !vowelRe.test(letters)) return true
  }

  return false
}

async function buildAnswer(userId: string, message: string, metrics: MetricSummary): Promise<AnswerPayload> {
  const intent = detectIntent(message)
  if (intent === "products_count") {
    return { answer: `You currently have ${metrics.productsCount} products.`, usedData: true }
  }
  if (intent === "available_balance") {
    return { answer: `Your available balance is ${fmtMoney(metrics.availableBalance, metrics.currency)}.`, usedData: true }
  }
  if (intent === "payout_accounts") {
    const has = metrics.payoutAccountsCount > 0
    return { answer: has ? `You have ${metrics.payoutAccountsCount} payout account${metrics.payoutAccountsCount > 1 ? "s" : ""} connected.` : "You don't have a payout account connected yet.", usedData: true }
  }
  if (intent === "refunds") {
    if (metrics.refundedCount === 0) {
      return { answer: "No refunds yet.", usedData: true }
    }
    return { answer: `You have ${metrics.refundedCount} refund${metrics.refundedCount > 1 ? "s" : ""} totaling ${fmtMoney(metrics.refundedAmount, metrics.currency)}.`, usedData: true }
  }
  if (intent === "top_product") {
    if (!metrics.topProduct) {
      return { answer: "I don’t see a top product yet.", usedData: true }
    }
    return { answer: `Your top product is ${metrics.topProduct.name}, with ${metrics.topProduct.count} sale${metrics.topProduct.count > 1 ? "s" : ""} and ${fmtMoney(metrics.topProduct.revenue, metrics.currency)} in revenue.`, usedData: true }
  }
  if (intent === "last_payout") {
    if (!metrics.lastPayoutAt) return { answer: "I don't see a completed payout yet.", usedData: true }
    const date = new Date(metrics.lastPayoutAt).toLocaleDateString()
    return { answer: `Your last payout was on ${date}.`, usedData: true }
  }
  if (intent === "customers_count") {
    return { answer: `You have ${metrics.customersCount} unique customers.`, usedData: true }
  }
  if (intent === "recent_sales") {
    const txSnap = await db.collection("transactions")
      .where("sellerId", "==", userId)
      .where("status", "==", "success")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get()

    if (txSnap.empty) {
      return { answer: "No recent sales yet.", usedData: true }
    }

    const lines = txSnap.docs.map((doc) => {
      const d = doc.data() as any
      const amount = Number(d?.yourProfit ?? d?.amount ?? 0)
      const money = fmtMoney(amount, d?.currency || metrics.currency)
      const name = d?.productName || "Product"
      const when = d?.createdAt?.toDate?.() ? d.createdAt.toDate().toLocaleDateString() : ""
      return `• ${name} — ${money}${when ? ` (${when})` : ""}`
    })
    return { answer: `Here are your most recent sales:\n${lines.join("\n")}`, usedData: true }
  }

  return {
    answer: "",
    usedData: false,
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const userId = req.nextUrl.searchParams.get("userId")
    if (!sessionId && !userId) {
      return NextResponse.json({ error: "sessionId or userId is required" }, { status: 400 })
    }

    let sessionRef = sessionId ? db.collection("managerSessions").doc(sessionId) : null
    let sessionSnap = sessionRef ? await sessionRef.get() : null

    // Only fall back to most-recent session when NO specific sessionId was requested.
    // If a sessionId was given but the doc doesn't exist, return empty rather than
    // silently loading a different session.
    if (!sessionSnap?.exists && !sessionId && userId) {
      const recentSnap = await db.collection("managerSessions")
        .where("userId", "==", userId)
        .get()
      if (!recentSnap.empty) {
        const sortedDocs = recentSnap.docs.sort((a, b) => {
          const aTime = a.data().updatedAt?.toMillis?.() ?? 0
          const bTime = b.data().updatedAt?.toMillis?.() ?? 0
          return bTime - aTime
        })
        sessionRef = sortedDocs[0].ref
        sessionSnap = sortedDocs[0]
      }
    }

    if (!sessionSnap?.exists || !sessionRef) {
      if (!userId) return NextResponse.json({ messages: [], sessionId: null })
      const metrics = await getMetrics(userId)
      const sessionCreateRef = db.collection("managerSessions").doc()
      await sessionCreateRef.set({
        userId,
        status: "open",
        source: "manager",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastMessage: null,
        title: "New chat",
      })
      const greeting = buildGreeting(metrics)
      const msgRef = sessionCreateRef.collection("messages").doc()
      await msgRef.set({
        role: "assistant",
        content: greeting,
        createdAt: FieldValue.serverTimestamp(),
        model: "seed",
      })
      return NextResponse.json({
        sessionId: sessionCreateRef.id,
        messages: [{ id: msgRef.id, role: "assistant", content: greeting, ts: Date.now() }],
      })
    }

    const messagesSnap = await sessionRef.collection("messages").orderBy("createdAt", "asc").get()
    const messages = messagesSnap.docs
      .map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          role: d.role as "assistant" | "user" | "system",
          content: d.content as string,
          ts: d.createdAt?.toDate?.().getTime?.() ?? Date.now(),
        }
      })
      .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")

    return NextResponse.json({
      sessionId: sessionSnap.id,
      messages,
    })
  } catch (error: any) {
    console.error("Manager GET error:", error)
    return NextResponse.json({ error: error?.message || "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const userId = typeof body?.userId === "string" ? body.userId : null

    if (!message || !userId) {
      return NextResponse.json({ error: "message and userId are required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    const sessionId = typeof body?.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : null

    const step = typeof body?.step === "string" ? body.step : "both"

    const sessionRef = sessionId
      ? db.collection("managerSessions").doc(sessionId)
      : db.collection("managerSessions").doc()

    // ---- STEP: ACK ----
    if (step === "ack") {
      if (!sessionId) {
        await sessionRef.set({
          userId,
          status: "open",
          source: "manager",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          lastMessage: message,
          title: message.slice(0, 60),
        })
      } else {
        const existingSnap = await sessionRef.get()
        const existing = existingSnap.exists ? (existingSnap.data() as any) : null
        await sessionRef.set(
          {
            updatedAt: FieldValue.serverTimestamp(),
            lastMessage: message,
            ...(existing?.title && existing?.title !== "New chat" ? {} : { title: message.slice(0, 60) }),
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
      })

      // If the message looks like gibberish, skip the "looking it up" ack — the data
      // step will handle it with a clarification response instead.
      if (isGibberish(message)) {
        await sessionRef.set({ updatedAt: FieldValue.serverTimestamp() }, { merge: true })
        return NextResponse.json({ sessionId: sessionRef.id, ack: "", gibberish: true })
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" },
      })
      
      const prompt = `You are Pasive's Business Manager assistant. The user just asked a question. Write a very short, natural conversational acknowledgement (1 sentence) saying you are going to look that up from the records right now. Do not include any data or numbers. Return ONLY valid JSON: {"ack":"..."}\n\nUser: ${message}`
      
      let ack = ""
      try {
        const result = await model.generateContent(prompt)
        const responseText = result.response?.text?.() || ""
        const cleaned = responseText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim()
        try {
          const parsed = JSON.parse(cleaned)
          ack = typeof parsed.ack === "string" ? parsed.ack.trim() : ""
        } catch {
          ack = cleaned
        }
      } catch {
        ack = ""
      }

      let ackMessageId: string | null = null
      if (ack) {
        const assistantRef = sessionRef.collection("messages").doc()
        ackMessageId = assistantRef.id
        await assistantRef.set({
          role: "assistant",
          content: ack,
          createdAt: FieldValue.serverTimestamp(),
          model: "gemini-2.0-flash",
        })
      }

      if (ack) {
        await sessionRef.set(
          { updatedAt: FieldValue.serverTimestamp(), lastMessage: ack, lastAckMessageId: ackMessageId },
          { merge: true }
        )
      } else {
        await sessionRef.set({ updatedAt: FieldValue.serverTimestamp() }, { merge: true })
      }

      return NextResponse.json({ sessionId: sessionRef.id, ack })
    }

    // ---- STEP: DATA ----
    if (step === "data") {
      const metrics = await getMetrics(userId)
      const computed = await buildAnswer(userId, message, metrics)
      let answer = computed.answer
      
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" },
      })

      const intent = detectIntent(message)

      // If the input looks like gibberish or is completely unclear, ask for clarification.
      if (isGibberish(message)) {
        const clarifyPrompt = `You are Pasive's Business Manager assistant. The user sent a message that is unclear or unrecognizable. Politely let them know you didn't understand and ask them to rephrase or try one of the things you can help with (sales, balance, products, customers, refunds, payouts). Keep it concise (1-2 sentences). Return ONLY valid JSON: {"answer":"..."}\n\nUser message: ${message}`
        try {
          const result = await model.generateContent(clarifyPrompt)
          const responseText = result.response?.text?.() || ""
          const cleaned = responseText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim()
          const parsed = JSON.parse(cleaned)
          answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "I didn't quite catch that — could you rephrase? I can help with things like sales, balance, products, customers, refunds, or payouts."
        } catch {
          answer = "I didn't quite catch that — could you rephrase? I can help with things like sales, balance, products, customers, refunds, or payouts."
        }

        const sessionSnap2 = await sessionRef.get()
        const lastAckMessageId2 = sessionSnap2.exists ? (sessionSnap2.data() as any)?.lastAckMessageId : null
        if (lastAckMessageId2) {
          const ackRef = sessionRef.collection("messages").doc(lastAckMessageId2)
          await ackRef.set({ content: answer, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
          await sessionRef.set({ lastAckMessageId: null }, { merge: true })
        } else {
          const answerRef = sessionRef.collection("messages").doc()
          await answerRef.set({ role: "assistant", content: answer, createdAt: FieldValue.serverTimestamp(), model: "gemini-2.0-flash" })
        }
        await sessionRef.set({ updatedAt: FieldValue.serverTimestamp(), lastMessage: answer }, { merge: true })
        return NextResponse.json({ sessionId: sessionRef.id, answer, followup: "" })
      }

      // Off-topic: politely redirect to business topics
      if (intent === "off_topic") {
        answer = "I'm your Pasive Business Manager, so I can only help with your store data and platform questions. Is there something about your sales, balance, products, or how Pasive works that I can help with?"
        const sessionSnapOT = await sessionRef.get()
        const lastAckOT = sessionSnapOT.exists ? (sessionSnapOT.data() as any)?.lastAckMessageId : null
        if (lastAckOT) {
          await sessionRef.collection("messages").doc(lastAckOT).set({ content: answer, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
          await sessionRef.set({ lastAckMessageId: null }, { merge: true })
        } else {
          await sessionRef.collection("messages").doc().set({ role: "assistant", content: answer, createdAt: FieldValue.serverTimestamp(), model: "gemini-2.0-flash" })
        }
        await sessionRef.set({ updatedAt: FieldValue.serverTimestamp(), lastMessage: answer }, { merge: true })
        return NextResponse.json({ sessionId: sessionRef.id, answer, followup: "" })
      }

      // Platform question: answer from help docs
      if (intent === "platform_question") {
        const docsContext = buildDocsContext()
        const platformPrompt = `You are Pasive's Business Manager assistant. Answer the user's question about the Pasive platform using ONLY the Help Docs provided. Be concise (1-3 sentences). Do NOT invent features. Return ONLY valid JSON: {"answer":"..."}\n\nHelp Docs:\n${docsContext}\n\nUser: ${message}`
        try {
          const result = await model.generateContent(platformPrompt)
          const responseText = result.response?.text?.() || ""
          const cleaned = responseText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim()
          const parsed = JSON.parse(cleaned)
          answer = typeof parsed.answer === "string" ? parsed.answer.trim() : ""
        } catch {
          answer = "I'm not sure about that — check out the Help section in your dashboard for detailed guides on how Pasive works."
        }
        if (!answer) answer = "I'm not sure about that — check out the Help section in your dashboard for detailed guides on how Pasive works."
        const sessionSnapPQ = await sessionRef.get()
        const lastAckPQ = sessionSnapPQ.exists ? (sessionSnapPQ.data() as any)?.lastAckMessageId : null
        if (lastAckPQ) {
          await sessionRef.collection("messages").doc(lastAckPQ).set({ content: answer, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
          await sessionRef.set({ lastAckMessageId: null }, { merge: true })
        } else {
          await sessionRef.collection("messages").doc().set({ role: "assistant", content: answer, createdAt: FieldValue.serverTimestamp(), model: "gemini-2.0-flash" })
        }
        await sessionRef.set({ updatedAt: FieldValue.serverTimestamp(), lastMessage: answer }, { merge: true })
        return NextResponse.json({ sessionId: sessionRef.id, answer, followup: "" })
      }

      if (!computed.usedData) {
        const noDataPrompt = `You are Pasive's Business Manager assistant. The user asked a question but there is no data available to answer it yet. Respond helpfully in 1-2 sentences, acknowledge the limitation, and suggest the best next step in the dashboard. Do NOT invent data. Return ONLY valid JSON: {"answer":"..."}\n\nUser: ${message}`
        try {
          const result = await model.generateContent(noDataPrompt)
          const responseText = result.response?.text?.() || ""
          const cleaned = responseText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim()
          const parsed = JSON.parse(cleaned)
          answer = typeof parsed.answer === "string" ? parsed.answer.trim() : answer
        } catch {
          // leave answer as-is; UI will still show follow-up
        }
      }

      const prompt = `You are Pasive's Business Manager assistant. Write a short, natural conversational follow-up (1 sentence) asking if they need anything else or suggesting a related action. Do NOT mention any numbers or specific data. Return ONLY valid JSON: {"followup":"..."}\n\nUser intent: ${intent}\nUser message: ${message}`

      let followup = ""
      try {
        const result = await model.generateContent(prompt)
        const responseText = result.response?.text?.() || ""
        const cleaned = responseText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim()
        const parsed = JSON.parse(cleaned)
        followup = typeof parsed.followup === "string" ? parsed.followup.trim() : ""
      } catch {
        followup = "Is there anything else I can help you with?"
      }
      if (/\d/.test(followup)) {
        followup = "Is there anything else I can help you with?"
      }

      const sessionSnap = await sessionRef.get()
      const lastAckMessageId = sessionSnap.exists ? (sessionSnap.data() as any)?.lastAckMessageId : null
      if (lastAckMessageId) {
        const ackRef = sessionRef.collection("messages").doc(lastAckMessageId)
        // Replace the ack message with answer + followup only (drop the transient ack text).
        const parts = [answer, followup].filter(Boolean)
        if (parts.length > 0) {
          await ackRef.set(
            { content: parts.join("\n\n"), updatedAt: FieldValue.serverTimestamp() },
            { merge: true }
          )
        }
        // Clear lastAckMessageId so a future data call doesn't clobber this message again
        await sessionRef.set({ lastAckMessageId: null }, { merge: true })
      } else {
        if (answer || followup) {
          const combined = [answer, followup].filter(Boolean).join("\n\n")
          const answerRef = sessionRef.collection("messages").doc()
          await answerRef.set({ role: "assistant", content: combined, createdAt: FieldValue.serverTimestamp(), model: "gemini-2.0-flash" })
        }
      }

      await sessionRef.set({ updatedAt: FieldValue.serverTimestamp(), lastMessage: `${answer}${followup ? `\n\n${followup}` : ""}` }, { merge: true })

      return NextResponse.json({ sessionId: sessionRef.id, answer, followup })
    }

    // ---- STEP: BOTH (Fallback) ----
    return NextResponse.json({ error: "Please specify step 'ack' or 'data'." }, { status: 400 })
  } catch (error: any) {
    console.error("Manager POST error:", error)
    return NextResponse.json({ error: error?.message || "Manager chat failed" }, { status: 500 })
  }
}
