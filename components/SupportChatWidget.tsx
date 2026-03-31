"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronRight, ExternalLink, MessageCircle, Send, X } from "lucide-react"
import { getHelpDocs, type HelpDoc } from "@/lib/help-docs"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

type Stage = "closed" | "home" | "prechat" | "chat"

type ChatMessage = {
  id: string
  role: "assistant" | "user" | "system"
  content: string
  ts: number
  ctaLabel?: string
  ctaHref?: string
  external?: boolean
}

type UserInfo = { name: string; email: string }

// ── Constants ──────────────────────────────────────────────────────────────

const SUPPORT_EMAIL = "admin@pasive.co"
const TEAM_NAME = "Pasive"
const REPLY_TIME = "Usually replies in a few hours"

const SUGGESTED_ARTICLES = [
  { id: "getting-started", title: "Getting started with Pasive" },
  { id: "payment-payout-integration", title: "Payouts & payment setup" },
  { id: "products-and-sales", title: "Creating and selling products" },
  { id: "affiliate-network", title: "Affiliate network & commissions" },
]

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

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function genTicket() {
  return `PSV-${Math.floor(10000 + Math.random() * 90000)}`
}

function save(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { }
}

function load<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback }
}

function findDoc(query: string, docs: HelpDoc[]) {
  const tokens = query.toLowerCase().split(/[^\w]+/).filter(Boolean)
  const scored = docs.map((doc) => {
    const corpus = [
      doc.title, doc.summary, doc.category,
      ...doc.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? []), ...(s.bullets ?? []), s.note ?? ""]),
      ...(keywordMap[doc.id] ?? []),
    ].join(" ").toLowerCase()
    return { doc, score: tokens.reduce((t, tok) => t + (corpus.includes(tok) ? 1 : 0), 0) }
  }).sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].doc : null
}

function botReply(query: string, docs: HelpDoc[], userEmail: string): Omit<ChatMessage, "id" | "ts"> {
  const q = query.toLowerCase()
  if (q.includes("contact") || q.includes("human") || q.includes("agent") || q.includes("person")) {
    return { role: "assistant", content: "I'll connect you with the team. A support agent will follow up at the email you provided." }
  }
  const doc = findDoc(query, docs)
  if (!doc) {
    return { role: "assistant", content: "I couldn't find an exact match. The team has been notified and will follow up by email." }
  }
  const highlight = doc.sections.flatMap((s) => [...(s.paragraphs ?? []), ...(s.bullets ?? [])]).filter(Boolean)[0] ?? ""
  return {
    role: "assistant",
    content: [doc.summary, highlight].filter(Boolean).join(" "),
    ctaLabel: "Read full guide",
    ctaHref: `/dashboard/help/${doc.id}`,
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SupportChatWidget() {
  const pathname = usePathname()
  const docs = useMemo(() => getHelpDocs(), [])

  const [stage, setStage] = useState<Stage>("closed")
  const [userInfo, setUserInfo] = useState<UserInfo>(() => load("psv_user", { name: "", email: "" }))
  const [formName, setFormName] = useState(userInfo.name)
  const [formEmail, setFormEmail] = useState(userInfo.email)
  const [formError, setFormError] = useState("")
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [ticketId] = useState<string>(() => load("psv_ticket", genTicket()))
  const [messages, setMessages] = useState<ChatMessage[]>(() => load("psv_msgs", []))

  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const isDashboard = pathname?.startsWith("/dashboard")
  const bottomOffset = isDashboard
    ? "calc(env(safe-area-inset-bottom, 0px) + 5.75rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)"

  const hasInfo = Boolean(userInfo.name && userInfo.email)

  useEffect(() => { save("psv_msgs", messages) }, [messages])
  useEffect(() => { save("psv_ticket", ticketId) }, [ticketId])

  useEffect(() => {
    if (stage === "chat") setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [stage, messages, typing])

  useEffect(() => {
    if (stage === "prechat") setTimeout(() => nameRef.current?.focus(), 100)
    if (stage === "chat") setTimeout(() => textareaRef.current?.focus(), 100)
  }, [stage])

  function open() {
    setStage(messages.length > 0 || hasInfo ? "chat" : "home")
  }

  function addMsg(msg: Omit<ChatMessage, "id" | "ts">) {
    const full = { ...msg, id: makeId(), ts: Date.now() }
    setMessages((p) => [...p, full])
    return full
  }

  function submitPrechat(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) { setFormError("Name is required."); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) { setFormError("Enter a valid email."); return }
    const info = { name: formName.trim(), email: formEmail.trim() }
    setUserInfo(info)
    save("psv_user", info)
    setFormError("")
    addMsg({ role: "assistant", content: `Hi ${formName.trim().split(" ")[0]} 👋 How can we help you today?` })
    setStage("chat")
  }

  function send(text: string) {
    const t = text.trim()
    if (!t) return
    addMsg({ role: "user", content: t })
    setInput("")
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const reply = botReply(t, docs, userInfo.email)
      addMsg(reply)
      if (!reply.ctaHref) {
        setTimeout(() => {
          addMsg({ role: "system", content: `Ticket ${ticketId} created · reply to ${userInfo.email}` })
        }, 500)
      }
    }, 1200 + Math.random() * 500)
  }

  return (
    <div
      className="fixed right-4 z-[70] flex flex-col items-end gap-3 sm:right-6"
      style={{ bottom: bottomOffset }}
    >
      {stage !== "closed" && (
        <section
          className="flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl sm:w-[24rem]"
          style={{ maxHeight: `min(38rem, calc(100dvh - ${bottomOffset} - 5rem))` }}
        >

          {/* ── HOME ── */}
          {stage === "home" && (
            <>
              <div className="shrink-0 bg-primary px-5 pb-7 pt-5 text-primary-foreground">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-semibold">{TEAM_NAME}</p>
                  <button type="button" onClick={() => setStage("closed")}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    aria-label="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-2xl font-semibold leading-snug">Hi there 👋<br />How can we help?</p>
                <p className="mt-1.5 text-[12px] text-primary-foreground/60">{REPLY_TIME}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <button type="button" onClick={() => setStage(hasInfo ? "chat" : "prechat")}
                  className="mb-5 flex w-full items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-accent">
                  <div>
                    <p className="text-sm font-medium">Send us a message</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{REPLY_TIME}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>

                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                  Popular articles
                </p>
                <div className="flex flex-col divide-y divide-border/40">
                  {SUGGESTED_ARTICLES.map((a) => (
                    <Link key={a.id} href={`/dashboard/help/${a.id}`}
                      className="flex items-center justify-between py-2.5 text-[13px] text-foreground transition-colors hover:text-primary">
                      <span className="line-clamp-1">{a.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PRE-CHAT ── */}
          {stage === "prechat" && (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
                <button type="button" onClick={() => setStage("home")}
                  className="text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                  ← Back
                </button>
                <p className="text-sm font-medium">New conversation</p>
                <button type="button" onClick={() => setStage("closed")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                  aria-label="Close">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={submitPrechat} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
                <p className="text-[13px] text-muted-foreground">
                  We'll need your details so the team can follow up.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pc-name" className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Name</label>
                  <input ref={nameRef} id="pc-name" type="text" value={formName}
                    onChange={(e) => setFormName(e.target.value)} placeholder="Your name"
                    className="rounded-lg border border-input bg-muted/40 px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pc-email" className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">Email</label>
                  <input id="pc-email" type="email" value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)} placeholder="you@example.com"
                    className="rounded-lg border border-input bg-muted/40 px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" />
                </div>
                {formError && <p className="text-[12px] text-destructive">{formError}</p>}
                <button type="submit"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Start conversation
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </>
          )}

          {/* ── CHAT ── */}
          {stage === "chat" && (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {TEAM_NAME[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{TEAM_NAME} support</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{REPLY_TIME}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setStage("closed")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                  aria-label="Close">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex min-h-[10rem] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => {
                  if (msg.role === "system") {
                    return (
                      <div key={msg.id} className="flex items-center justify-center gap-1.5 py-1">
                        <Check className="h-3 w-3 text-muted-foreground/40" />
                        <p className="text-[11px] text-muted-foreground/50">{msg.content}</p>
                      </div>
                    )
                  }
                  return (
                    <div key={msg.id} className={cn("flex flex-col gap-0.5", msg.role === "user" ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                        msg.role === "assistant" ? "rounded-tl-sm bg-muted text-foreground" : "rounded-tr-sm bg-primary text-primary-foreground"
                      )}>
                        <p>{msg.content}</p>
                        {msg.ctaHref && msg.ctaLabel && (
                          <div className="mt-2">
                            <Link href={msg.ctaHref}
                              className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4">
                              {msg.ctaLabel}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                      <p className="px-1 text-[10px] text-muted-foreground/40">{fmt(msg.ts)}</p>
                    </div>
                  )
                })}

                {typing && (
                  <div className="flex items-start">
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"
                            style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); send(input) }}
                className="shrink-0 border-t border-border/60 p-3">
                <label htmlFor="chat-input" className="sr-only">Send a message</label>
                <div className="flex items-end rounded-xl border border-input bg-muted/40 px-3 py-2 transition-colors focus-within:border-primary">
                  <textarea ref={textareaRef} id="chat-input" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
                    rows={2} placeholder="Type a message…"
                    className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
                  <button type="submit" disabled={!input.trim() || typing} aria-label="Send"
                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-35">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
                  {ticketId} · replies to {userInfo.email}
                </p>
              </form>
            </>
          )}

        </section>
      )}

      {/* FAB */}
      <button type="button"
        onClick={() => stage === "closed" ? open() : setStage("closed")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        aria-label={stage === "closed" ? "Open support" : "Close support"}>
        {stage !== "closed" ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  )
}