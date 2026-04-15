"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, MessageCircle, X, Send, ChevronRight, Search, HelpCircle, Home, ArrowLeft, Plus } from "lucide-react"
import { getHelpDocs, type HelpDoc } from "@/lib/help-docs"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

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

type UserInfo = { name: string; email: string }

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

  seedMessages.push(
    {
      id: makeId(),
      role: "assistant" as const,
      content: "We are currently experiencing a high volume of requests, which may delay our response. Rest assured, we'll get back to you as soon as possible.",
      ts: now + (seedMessages.length ? 1 : 0),
    },
    {
      id: makeId(),
      role: "assistant" as const,
      content: "For faster assistance, please select the option that best matches your inquiry. Thank you!",
      ts: now + (seedMessages.length ? 2 : 1),
      quickReplies,
    }
  )

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12.04 2C6.52 2 2.05 6.46 2.05 11.96c0 1.76.46 3.49 1.33 5.01L2 22l5.19-1.36a9.94 9.94 0 0 0 4.85 1.24h.01c5.51 0 9.98-4.46 9.98-9.96A9.95 9.95 0 0 0 12.04 2Zm0 18.23h-.01a8.26 8.26 0 0 1-4.21-1.15l-.3-.18-3.08.81.82-3-.2-.31a8.27 8.27 0 0 1-1.27-4.42 8.3 8.3 0 0 1 8.31-8.29 8.3 8.3 0 0 1 8.29 8.3 8.3 8.3 0 0 1-8.35 8.24Zm4.55-6.18c-.25-.12-1.5-.74-1.73-.83-.23-.08-.4-.12-.57.12-.17.25-.65.83-.8 1-.15.17-.3.19-.56.07-.25-.12-1.07-.39-2.04-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.1-.51.11-.11.25-.3.37-.45.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.11s.91 2.46 1.03 2.63c.12.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.43.54.6.19 1.14.16 1.57.1.48-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.15-.48-.27Z" />
    </svg>
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

  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "" })
  const [nameInput, setNameInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)

  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [ticketId, setTicketId] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
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

  // Auto-fill from auth
  useEffect(() => {
    if (user && !userInfo.name && !userInfo.email) {
      const name = user.displayName || ""
      const email = user.email || ""
      if (name || email) {
        const info = { name, email }
        setUserInfo(info)
      }
    }
  }, [user, userInfo.name, userInfo.email])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesView === "chat") {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60)
    }
  }, [messagesView, messages, typing])

  // Focus input when chat opens
  useEffect(() => {
    if (messagesView === "chat") {
      const needsInfo = !userInfo.name || !userInfo.email
      if (needsInfo) setTimeout(() => nameRef.current?.focus(), 150)
      else setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [messagesView, userInfo.name, userInfo.email])

  if (!hydrated) return null

  const isDashboard = pathname?.startsWith("/dashboard")
  const offsetClass = isDashboard
    ? "[--support-offset:calc(env(safe-area-inset-bottom,0px)+5.5rem)] sm:[--support-offset:calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
    : "[--support-offset:calc(env(safe-area-inset-bottom,0px)+0.25rem)]"

  const needsInfo = !userInfo.name || !userInfo.email
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
    const eErr = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)
    setNameError(nErr)
    setEmailError(eErr)
    if (nErr || eErr) return
    const info = { name: nameInput.trim(), email: emailInput.trim() }
    setUserInfo(info)
    if (!sessionId) {
      try {
        const res = await fetch("/api/support/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId,
            userInfo: info,
            userId: user?.uid || null,
            path: pathname,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.sessionId) setSessionId(data.sessionId)
          if (data?.ticketId) setTicketId(data.ticketId)
        }
      } catch {
        // Lead capture failed; continue UX without blocking
      }
    }
    addMsg({ role: "assistant", content: `Hi ${info.name.split(" ")[0]} 👋 What can we help you with today?` })
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function send(text: string) {
    const t = text.trim()
    if (!t || needsInfo) return
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
      if (data?.ticketId || userInfo.email) {
        setTimeout(() => {
          addMsg({ role: "system", content: `Ticket ${data?.ticketId || ticketId} · reply to ${userInfo.email}` })
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
                      onClick={() => { setActiveTab("help") }}
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
                  <Link
                    href={`/dashboard/help/${docs[0].id}`}
                    className="mx-4 mt-3 block rounded-xl bg-background px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="text-[13px] font-bold text-foreground leading-snug">{docs[0].title}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{docs[0].summary}</p>
                  </Link>
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
                        Ask anything — we'll reply here or by email.
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
                            {msg.ctaHref && msg.ctaLabel && (
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

                  {/* Pre-chat info form */}
                  {needsInfo ? (
                    <form onSubmit={submitInfo} className="flex-shrink-0 border-t border-border bg-background p-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          ref={nameRef}
                          type="text"
                          value={nameInput}
                          onChange={(e) => { setNameInput(e.target.value); setNameError(false) }}
                          placeholder="Name"
                          className={cn(
                            "flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary",
                            nameError ? "border-destructive" : "border-input"
                          )}
                        />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => { setEmailInput(e.target.value); setEmailError(false) }}
                          placeholder="Email"
                          className={cn(
                            "flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary",
                            emailError ? "border-destructive" : "border-input"
                          )}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Start chatting
                      </button>
                    </form>
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
          {activeTab === "help" && (
            <div className="flex flex-1 flex-col overflow-hidden">
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
                  <h2 className="flex-1 text-center text-[15px] font-bold text-primary-foreground">Help Center</h2>
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

              <div className="flex-1 overflow-y-auto bg-muted/30 pb-2">
                <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-background shadow-sm">
                  {docs.map((doc, i) => (
                    <Link
                      key={doc.id}
                      href={`/dashboard/help/${doc.id}`}
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
                    </Link>
                  ))}
                </div>
                <div className="h-4" />
              </div>
            </div>
          )}

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

            <a
              href="https://wa.me/2349053066692?text=Hi%20%F0%9F%91%8B"
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-0.5 px-5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="text-[9px] font-semibold">Whatsapp</span>
            </a>

            <button
              type="button"
              onClick={() => { setActiveTab("help") }}
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
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          aria-label="Open support"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
