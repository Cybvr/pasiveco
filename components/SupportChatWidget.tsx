"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, MessageCircle, X, Send, ChevronRight, Search, HelpCircle, Home, ArrowLeft } from "lucide-react"
import { getHelpDocs, type HelpDoc } from "@/lib/help-docs"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { PhoneInput } from "./PhoneInput"

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "home" | "messages" | "help"
type MessagesView = "list" | "chat"

type ChatMessage = {
  id: string
  role: "assistant" | "user" | "system"
  content: string
  ts: number
  ctaLabel?: string
  ctaHref?: string
  quickReplies?: Array<{ label: string; message: string }>
}

type UserInfo = { name: string; email: string; phone: string }

// ── Constants ──────────────────────────────────────────────────────────────

const TEAM_LABEL = "Ronke (bot)"

const keywordMap: Record<string, string[]> = {
  "getting-started": ["start", "setup", "set up", "begin", "profile", "page", "onboarding"],
  "profile-and-page-setup": ["profile", "bio", "page", "customize", "customise", "layout", "brand"],
  "products-and-sales": ["product", "products", "sell", "sales", "checkout", "offer", "price"],
  "analytics-and-growth": ["analytics", "growth", "traffic", "clicks", "performance", "data"],
  "payment-payout-integration": ["stripe", "flutterwave", "payment", "payments", "payout", "payouts", "withdrawal", "billing", "webhook"],
  "affiliate-network": ["affiliate", "affiliates", "commission", "commissions", "merchant", "promote", "promotion", "network", "referral"],
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()
}

function genTicket() {
  return `PSV-${Math.floor(10000 + Math.random() * 90000)}`
}

function isWhatsAppCtaHref(href?: string) {
  return Boolean(href && /(wa\.me|whatsapp)/i.test(href))
}

function isWithinSupportHours() {
  const lagosTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    hour12: false,
  }).format(new Date())

  const hour = Number.parseInt(lagosTime, 10)
  return hour >= 9 && hour < 18
}

function buildNewChatSeedMessages(docs: HelpDoc[]) {
  const now = Date.now()
  const getTitle = (id: string, fallback: string) => docs.find((d) => d.id === id)?.title ?? fallback
  const quickReplies = [
    { label: "Payouts", message: "How do I get paid out on Pasive?" },
    { label: "Add products", message: "How do I add a product or offer on Pasive?" },
    { label: "Set up my page", message: "How do I set up my profile and page?" },
    { label: "Analytics", message: "Where do I find analytics and what should I track?" },
    { label: "Payments", message: "How do payments work for buyers (Stripe/Flutterwave)?" },
    { label: "Affiliates", message: "How does the affiliate network work?" },
    { label: "Talk to an agent", message: "I'd like to talk to an agent" },
  ].map((item) => {
    if (item.label === "Payouts") return { ...item, label: getTitle("payment-payout-integration", item.label) }
    if (item.label === "Add products") return { ...item, label: getTitle("products-and-sales", item.label) }
    if (item.label === "Set up my page") return { ...item, label: getTitle("profile-and-page-setup", item.label) }
    if (item.label === "Analytics") return { ...item, label: getTitle("analytics-and-growth", item.label) }
    if (item.label === "Affiliates") return { ...item, label: getTitle("affiliate-network", item.label) }
    return item
  })
  const seedMessages: ChatMessage[] = []

  if (!isWithinSupportHours()) {
    seedMessages.push({
      id: makeId(),
      role: "assistant" as const,
      content: "We're online to assist you Monday – Sunday from 9:00 am – 6:00 pm (WAT). If you reach us outside these hours, don't worry — we'll reply as soon as we're back.",
      ts: now,
    })
  }

  seedMessages.push({
    id: makeId(),
    role: "assistant" as const,
    content: "Hi 👋 What can we help you with today?",
    ts: now + (seedMessages.length ? 1 : 0),
    quickReplies,
  })

  return seedMessages
}

// ── Single Avatar ─────────────────────────────────────────────────────────

function SupportAvatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 ring-2 ring-primary-foreground/20">
      <img src="/images/ronke.jpg" alt="Ronke" className="h-full w-full rounded-full object-cover" />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SupportChatWidget() {
  const pathname = usePathname()
  const docs = useMemo(() => getHelpDocs(), [])
  const { user } = useAuth()

  const [hydrated, setHydrated] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [messagesView, setMessagesView] = useState<MessagesView>("list")

  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", phone: "" })
  const [nameInput, setNameInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [phoneInput, setPhoneInput] = useState("")
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)

  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [ticketId, setTicketId] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [showInfoForm, setShowInfoForm] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const didLoadRemoteRef = useRef(false)

  // ── Persistence & hydration ───────────────────────────────────────────────

  useEffect(() => {
    setHydrated(true)
    setTicketId(genTicket())
  }, [])

  // If we don't have a session on this device, load the latest by userId once auth is ready.
  useEffect(() => {
    if (!hydrated || didLoadRemoteRef.current) return
    if (sessionId || !user?.uid) return
    didLoadRemoteRef.current = true
    fetch(`/api/support/chat?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages)
        }
        if (data.ticketId) {
          setTicketId(data.ticketId)
        }
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }
      })
      .catch(() => {
        setMessages([])
      })
  }, [hydrated, sessionId, user?.uid])

  useEffect(() => {
    if (!open || activeTab !== "messages" || messagesView !== "chat" || !sessionId) return

    let stopped = false
    const loadSessionMessages = async () => {
      try {
        const res = await fetch(`/api/support/chat?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (stopped) return
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages)
        }
        if (data.ticketId) {
          setTicketId(data.ticketId)
        }
      } catch {
        // Polling is best-effort; the user can keep chatting if it misses once.
      }
    }

    loadSessionMessages()
    const interval = window.setInterval(loadSessionMessages, 5000)
    return () => {
      stopped = true
      window.clearInterval(interval)
    }
  }, [open, activeTab, messagesView, sessionId])

  // Auto-fill from auth
  useEffect(() => {
    if (user && !userInfo.name && !userInfo.email && !userInfo.phone) {
      const name = user.displayName || ""
      const email = user.email || ""
      const phone = user.phoneNumber || ""
      if (name || email || phone) {
        const info = { name, email, phone }
        setUserInfo(info)
        setNameInput(name)
        setEmailInput(email)
        setPhoneInput(phone)
      }
    }
  }, [user, userInfo.name, userInfo.email, userInfo.phone])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesView === "chat") {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60)
    }
  }, [messagesView, messages, typing])

  // Focus input when chat opens
  useEffect(() => {
    if (messagesView === "chat") {
      const needsName = !userInfo.name
      const needsPhone = !userInfo.phone
      if (needsName && !user?.displayName) setTimeout(() => nameRef.current?.focus(), 150)
      else if (needsPhone) setTimeout(() => phoneRef.current?.focus(), 150)
      else setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [messagesView, userInfo.name, userInfo.phone, user?.displayName])

  if (!hydrated) return null

  const isDashboard = pathname?.startsWith("/dashboard")
  const offsetClass = isDashboard
    ? "[--support-offset:calc(env(safe-area-inset-bottom,0px)+5.5rem)] sm:[--support-offset:calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
    : "[--support-offset:calc(env(safe-area-inset-bottom,0px)+0.25rem)]"

  const needsInfo = !userInfo.name || !userInfo.phone
  const firstName = userInfo.name?.split(" ")[0] || user?.displayName?.split(" ")[0] || ""

  // ── Message helpers ───────────────────────────────────────────────────────

  function addMsg(msg: Omit<ChatMessage, "id" | "ts">) {
    const full = { ...msg, id: makeId(), ts: Date.now() }
    setMessages((p) => [...p, full])
    return full
  }

  async function submitInfo(e: React.FormEvent) {
    e.preventDefault()
    const nErr = !nameInput.trim()
    const eErr = Boolean(emailInput.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)
    const pErr = phoneInput.replace(/\D/g, "").length < 7
    setNameError(nErr)
    setEmailError(eErr)
    setPhoneError(pErr)
    if (nErr || eErr || pErr) return
    const info = { name: nameInput.trim(), email: emailInput.trim(), phone: phoneInput.trim() }
    setUserInfo(info)
    setShowInfoForm(false)
    await requestAgentHandoff(info)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function requestAgentHandoff(info: UserInfo = userInfo) {
    setTyping(true)
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || null,
          ticketId,
          message: "I'd like to talk to an agent",
          userInfo: info,
          userId: user?.uid || null,
          path: pathname,
          history: messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error("Support handoff failed")
      const data = await res.json()
      if (data?.sessionId && data.sessionId !== sessionId) setSessionId(data.sessionId)
      if (data?.ticketId && data.ticketId !== ticketId) setTicketId(data.ticketId)
      const replyText = typeof data?.reply === "string" ? data.reply : ""
      addMsg({
        role: "assistant",
        content: replyText || `Hi ${info.name.split(/\s+/)[0] || "there"}, I've connected this chat to our support team. What can we help you with?`,
      })
      addMsg({ role: "system", content: `Ticket ${data?.ticketId || ticketId} · Agent request sent` })
    } catch {
      addMsg({ role: "assistant", content: "I couldn't flag this for an agent just now. Please send your message again here and we'll keep it in this chat." })
    } finally {
      setTyping(false)
    }
  }

  async function send(text: string, skipInfoCheck = false) {
    const t = text.trim()
    if (!t) return
    
    // If they want an agent and we don't have their info, prompt for it naturally
    if (!skipInfoCheck && (t.toLowerCase().includes("agent") || t.toLowerCase().includes("human")) && needsInfo) {
      addMsg({ role: "user", content: t })
      setInput("")
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        addMsg({ 
          role: "assistant", 
          content: "I'll connect you with a member of our team. First, I just need a few details to help them reach you if we get disconnected." 
        })
        setShowInfoForm(true)
      }, 600)
      return
    }

    const userMsg = addMsg({ role: "user", content: t })
    setInput("")
    setTyping(true)

    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || null,
          ticketId,
          message: t,
          userInfo,
          userId: user?.uid || null,
          path: pathname,
          history,
        }),
      })
      if (!res.ok) throw new Error("Support chat failed")
      const data = await res.json()
      if (data?.sessionId && data.sessionId !== sessionId) setSessionId(data.sessionId)
      if (data?.ticketId && data.ticketId !== ticketId) setTicketId(data.ticketId)
      const replyText = typeof data?.reply === "string" ? data.reply : ""
      if (replyText) addMsg({ role: "assistant", content: replyText })
      if (replyText && (data?.ticketId || userInfo.phone || userInfo.email)) {
        setTimeout(() => {
          addMsg({ role: "system", content: `Ticket ${data?.ticketId || ticketId} · Messages` })
        }, 300)
      }
    } catch {
      addMsg({ role: "assistant", content: "Something went wrong. Please try again or email us directly." })
    } finally {
      setTyping(false)
    }
  }

  // ── Filtered search ───────────────────────────────────────────────────────

  const filteredDocs = searchQuery.trim()
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docs.slice(0, 4)

  // Last user-visible message for conversation list preview
  const lastMsg = [...messages].reverse().find((m) => m.role !== "system")

  // ── Nav helpers ───────────────────────────────────────────────────────────

  function openChat() {
    setActiveTab("messages")
    setMessagesView("chat")
  }

  function startNewChat() {
    const freshTicket = genTicket()
    const seedMessages = buildNewChatSeedMessages(docs)
    setActiveTab("messages")
    setMessagesView("chat")
    setInput("")
    setTyping(false)
    setSessionId("")
    setTicketId(freshTicket)
    setMessages(seedMessages)
    setShowInfoForm(false)
  }

  function goToMessagesList() {
    setMessagesView("list")
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "fixed right-4 z-[100] flex flex-col items-end gap-3 sm:right-6 bottom-[var(--support-offset)]",
        offsetClass
      )}
    >
      {/* ── Widget ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[101] flex h-dvh w-screen flex-col overflow-hidden bg-background sm:absolute sm:bottom-0 sm:right-0 sm:inset-auto sm:w-80 sm:rounded-2xl sm:border sm:border-border sm:bg-background sm:shadow-2xl"
          style={{
            height: typeof window === "undefined"
              ? "100dvh"
              : window.innerWidth < 640
                ? "100dvh"
                : "min(38rem, calc(100dvh - var(--support-offset) - 5rem))",
          }}
        >

          {/* ════════════════════ HOME TAB ════════════════════ */}
          {activeTab === "home" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 bg-primary px-4 pb-4 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/images/logo.svg" alt="Pasive" className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <SupportAvatar />
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/20"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h1 className="text-[19px] font-bold leading-tight text-primary-foreground">
                  {firstName ? `Hello ${firstName} 👋,` : "Hello there 👋,"}<br />
                  How can we help?
                </h1>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="inline-flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Send className="h-3.5 w-3.5 text-primary" />
                    Send us a message
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-muted/30 pb-2">
                {/* Search for help */}
                <div className="mx-4 mt-3 overflow-hidden rounded-xl bg-background shadow-sm">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for help"
                      className="flex-1 bg-transparent text-sm font-semibold text-foreground placeholder:font-semibold placeholder:text-foreground outline-none"
                    />
                    <Search className="h-5 w-5 flex-shrink-0 text-primary/60" />
                  </div>

                  {filteredDocs.map((doc, i) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => { setSelectedDocId(doc.id); setActiveTab("help") }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                        i > 0 && "border-t border-border"
                      )}
                    >
                      <span className="pr-3 text-[13px] leading-snug text-muted-foreground">{doc.title}</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-primary/50" />
                    </button>
                  ))}
                  {filteredDocs.length === 0 && (
                    <p className="px-4 py-4 text-[13px] text-muted-foreground">No results found.</p>
                  )}
                </div>

                {/* Featured article */}
                {docs[0] && (
                  <button
                    type="button"
                    onClick={() => { setSelectedDocId(docs[0].id); setActiveTab("help") }}
                    className="mx-4 mt-3 block w-[calc(100%-2rem)] rounded-xl bg-background px-4 py-4 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="text-[13px] font-bold text-foreground leading-snug">{docs[0].title}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{docs[0].summary}</p>
                  </button>
                )}

                <div className="h-4" />
              </div>
            </div>
          )}

          {/* ════════════════════ MESSAGES TAB ════════════════════ */}
          {activeTab === "messages" && (
            <div className="flex flex-1 flex-col overflow-hidden">

              {/* ── List view ── */}
              {messagesView === "list" && (
                <>
                  <div className="flex-shrink-0 bg-primary px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("home")}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                        aria-label="Back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h2 className="flex-1 text-center text-[15px] font-bold text-primary-foreground">Messages</h2>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col overflow-y-auto bg-muted/30">
                    {messages.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <MessageCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground">Send us a message and we'll get back to you.</p>
                      </div>
                    ) : (
                      <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-background shadow-sm">
                        <button
                          type="button"
                          onClick={() => setMessagesView("chat")}
                          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                            <img src="/images/ronke.jpg" alt="Ronke" className="h-full w-full rounded-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13px] font-semibold text-foreground">{TEAM_LABEL}</p>
                              {lastMsg && (
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtTime(lastMsg.ts)}</span>
                              )}
                            </div>
                            {lastMsg && (
                              <p className="mt-0.5 text-[12px] text-muted-foreground truncate">{lastMsg.content}</p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Send new message button */}
                  <div className="flex-shrink-0 border-t border-border bg-background p-4">
                    <button
                      type="button"
                      onClick={startNewChat}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send us a message</span>
                    </button>
                  </div>
                </>
              )}

              {/* ── Chat view ── */}
              {messagesView === "chat" && (
                <>
                  {/* Chat header */}
                  <div className="flex-shrink-0 bg-primary flex items-center gap-3 px-4 py-4">
                    <button
                      type="button"
                      onClick={goToMessagesList}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <SupportAvatar />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary-foreground">{TEAM_LABEL}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-primary-foreground/60">Online</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex min-h-[10rem] flex-1 flex-col gap-3 overflow-y-auto bg-muted/20 px-4 py-4">
                    {messages.length === 0 && !needsInfo && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Ask anything — we'll reply here in Messages.
                      </p>
                    )}

                    {messages.map((msg) => {
                      if (msg.role === "system") {
                        return (
                          <div key={msg.id} className="flex items-center justify-center gap-2 py-2">
                            <Check className="h-2.5 w-2.5 text-muted-foreground/40" />
                            <p className="text-[10px] text-muted-foreground/50">{msg.content}</p>
                          </div>
                        )
                      }
                      const showCta = Boolean(msg.ctaHref && msg.ctaLabel && !isWhatsAppCtaHref(msg.ctaHref))
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                          <div className={cn(
                            "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                            msg.role === "assistant"
                              ? "rounded-tl-sm bg-background text-foreground shadow-sm border border-border/50"
                              : "rounded-tr-sm bg-primary text-primary-foreground"
                          )}>
                            <p>{msg.content}</p>
                            {showCta && (
                              <Link
                                href={msg.ctaHref}
                                className="mt-2 block text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100"
                              >
                                {msg.ctaLabel}
                              </Link>
                            )}
                          </div>
                          {msg.role === "assistant" && msg.quickReplies && msg.quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.quickReplies.map((label, idx) => (
                                <button
                                  key={`${label.label}-${label.message}-${idx}`}
                                  type="button"
                                  onClick={() => send(label.message)}
                                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/50"
                                >
                                  {label.label}
                                </button>
                              ))}
                            </div>
                          )}
                          <span className="px-1 text-[10px] text-muted-foreground/50">{fmtTime(msg.ts)}</span>
                          </div>
                        </div>
                      )
                    })}

                    {typing && (
                      <div className="flex items-start">
                        <div className="rounded-2xl rounded-tl-sm bg-background px-4 py-3 shadow-sm border border-border/50">
                          <div className="flex gap-1">
                            {[0, 150, 300].map((delay) => (
                              <span
                                key={delay}
                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Input Area */}
                  {showInfoForm && needsInfo ? (
                    <div className="flex-shrink-0 border-t border-border bg-muted/20 p-3 animate-in slide-in-from-bottom-2 duration-300">
                      <form onSubmit={submitInfo} className="space-y-3">
                        <div className="space-y-2">
                          {!user?.displayName && (
                            <input
                              ref={nameRef}
                              type="text"
                              value={nameInput}
                              onChange={(e) => { setNameInput(e.target.value); setNameError(false) }}
                              placeholder="Your Name"
                              className={cn(
                                "w-full rounded-xl border bg-background px-4 py-2.5 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/5",
                                nameError ? "border-destructive/50" : "border-border/50"
                              )}
                            />
                          )}

                          <PhoneInput
                            ref={phoneRef}
                            value={phoneInput}
                            onChange={(val) => { setPhoneInput(val); setPhoneError(false) }}
                            placeholder="Phone Number"
                            error={phoneError}
                            className="bg-background focus-within:ring-4 focus-within:ring-primary/5 border-border/50"
                          />

                          {!user?.email && (
                            <input
                              type="email"
                              value={emailInput}
                              onChange={(e) => { setEmailInput(e.target.value); setEmailError(false) }}
                              placeholder="Email Address (Optional)"
                              className={cn(
                                "w-full rounded-xl border bg-background px-4 py-2.5 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/5",
                                emailError ? "border-destructive/50" : "border-border/50"
                              )}
                            />
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
                        >
                          Start Chatting
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => { e.preventDefault(); send(input) }}
                      className="flex-shrink-0 border-t border-border bg-background p-3"
                    >
                      <div className="flex items-end gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2 transition-colors focus-within:border-primary">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
                          rows={1}
                          placeholder="Message…"
                          className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                        />
                        <button
                          type="submit"
                          disabled={!input.trim() || typing}
                          aria-label="Send"
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════ HELP TAB ════════════════════ */}
          {activeTab === "help" && (() => {
            const selectedDoc = selectedDocId ? docs.find((d) => d.id === selectedDocId) : null
            return (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 bg-primary px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedDoc) { setSelectedDocId(null) }
                        else { setActiveTab("home") }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <h2 className="flex-1 text-center text-[15px] font-bold text-primary-foreground">
                      {selectedDoc ? selectedDoc.title : "Help Center"}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Article detail view */}
                {selectedDoc ? (
                  <div className="flex-1 overflow-y-auto bg-muted/30 pb-4">
                    <div className="mx-4 mt-4 rounded-xl bg-background p-4 shadow-sm">
                      <p className="mb-3 text-[11px] text-muted-foreground">{selectedDoc.readTime}</p>
                      {selectedDoc.sections.map((section) => (
                        <div key={section.id} className="mb-4">
                          <h3 className="mb-1.5 text-[13px] font-bold text-foreground">{section.title}</h3>
                          {section.paragraphs?.map((p, idx) => (
                            <p key={idx} className="mb-1.5 text-[12px] leading-relaxed text-muted-foreground">{p}</p>
                          ))}
                          {section.bullets && (
                            <ul className="mt-1 space-y-1 pl-3">
                              {section.bullets.map((b, idx) => (
                                <li key={idx} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                          {section.table && (
                            <div className="mt-2 overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="border-b border-border bg-muted/50">
                                    {section.table.headers.map((h) => (
                                      <th key={h} className="px-3 py-2 text-left font-semibold text-foreground">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.table.rows.map((row, ri) => (
                                    <tr key={ri} className={ri > 0 ? "border-t border-border" : ""}>
                                      {row.map((cell, ci) => (
                                        <td key={ci} className="px-3 py-2 text-muted-foreground">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {section.note && (
                            <p className="mt-2 rounded-lg bg-primary/8 px-3 py-2 text-[11px] italic text-primary">{section.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="h-4" />
                  </div>
                ) : (
                  /* Article list view */
                  <div className="flex-1 overflow-y-auto bg-muted/30 pb-2">
                    <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-background shadow-sm">
                      {docs.map((doc, i) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDocId(doc.id)}
                          className={cn(
                            "flex w-full items-start justify-between px-4 py-4 text-left transition-colors hover:bg-muted/50",
                            i > 0 && "border-t border-border"
                          )}
                        >
                          <div className="flex-1 pr-3">
                            <p className="text-[13px] font-semibold text-foreground leading-snug">{doc.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{doc.readTime}</p>
                          </div>
                          <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/50" />
                        </button>
                      ))}
                    </div>
                    <div className="h-4" />
                  </div>
                )}
              </div>
            )
          })()}

          {/* ════════════════════ BOTTOM TABS ════════════════════ */}
          <div className="flex-shrink-0 flex items-center justify-around border-t border-border bg-background px-2 py-2">
            <button
              type="button"
              onClick={() => { setActiveTab("home") }}
              className={cn(
                "flex flex-col items-center gap-0.5 px-5 transition-colors",
                activeTab === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              <span className="text-[9px] font-semibold">Home</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("messages"); setMessagesView("list") }}
              className={cn(
                "flex flex-col items-center gap-0.5 px-5 transition-colors",
                activeTab === "messages" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-[9px] font-semibold">Messages</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedDocId(null); setActiveTab("help") }}
              className={cn(
                "flex flex-col items-center gap-0.5 px-5 transition-colors",
                activeTab === "help" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-[9px] font-semibold">Help</span>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          aria-label="Open support"
        >
          <img src="/images/catfoxdog.png" alt="" className="h-full w-full rounded-full object-cover" />
        </button>
      )}
    </div>
  )
}
