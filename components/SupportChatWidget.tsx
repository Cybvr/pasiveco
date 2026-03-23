"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, ExternalLink, LifeBuoy, Mail, MessageCircle, Send, X } from "lucide-react"
import { getHelpDocs, type HelpDoc } from "@/lib/help-docs"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
  ctaLabel?: string
  ctaHref?: string
  external?: boolean
}

const QUICK_PROMPTS = [
  "How do I get started?",
  "How do payouts work?",
  "How do I set up products?",
  "How do I contact support?",
]

const SUPPORT_EMAIL = "admin@pasive.co"

const keywordMap: Record<string, string[]> = {
  "getting-started": ["start", "setup", "set up", "begin", "profile", "page", "onboarding"],
  "profile-and-page-setup": ["profile", "bio", "page", "customize", "customise", "layout", "brand"],
  "products-and-sales": ["product", "products", "sell", "sales", "checkout", "offer", "price"],
  "analytics-and-growth": ["analytics", "growth", "traffic", "clicks", "performance", "data"],
  "paystack-integration-overview": ["paystack", "payment", "payments", "payout", "payouts", "subscription", "invoice", "withdrawal"],
}

function createAssistantMessage(message: Omit<ChatMessage, "id" | "role">): ChatMessage {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "assistant",
    ...message,
  }
}

function findRelevantDoc(query: string, docs: HelpDoc[]) {
  const normalizedQuery = query.toLowerCase()
  const tokens = normalizedQuery
    .split(/[^\w]+/)
    .map((token) => token.trim())
    .filter(Boolean)

  const scored = docs
    .map((doc) => {
      const corpus = [
        doc.title,
        doc.summary,
        doc.category,
        ...doc.sections.flatMap((section) => [
          section.title,
          ...(section.paragraphs ?? []),
          ...(section.bullets ?? []),
          section.note ?? "",
        ]),
        ...(keywordMap[doc.id] ?? []),
      ]
        .join(" ")
        .toLowerCase()

      const score = tokens.reduce((total, token) => total + (corpus.includes(token) ? 1 : 0), 0)

      return { doc, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored[0]?.score > 0 ? scored[0].doc : null
}

function buildDocResponse(query: string, docs: HelpDoc[]): ChatMessage {
  const normalizedQuery = query.toLowerCase()

  if (normalizedQuery.includes("contact") || normalizedQuery.includes("human") || normalizedQuery.includes("support")) {
    return createAssistantMessage({
      content: "You can reach the Pasive team directly by email. If you need account or payment help, include the email tied to your account and a short description of the issue.",
      ctaLabel: "Email support",
      ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Pasive%20Support`,
      external: true,
    })
  }

  const matchedDoc = findRelevantDoc(query, docs)

  if (!matchedDoc) {
    return createAssistantMessage({
      content: "I could not match that to a help article yet. Open the help center for the full docs library, or send a message to support for a direct response.",
      ctaLabel: "Open help center",
      ctaHref: "/dashboard/help",
    })
  }

  const highlights = matchedDoc.sections
    .flatMap((section) => [...(section.paragraphs ?? []), ...(section.bullets ?? [])])
    .filter(Boolean)
    .slice(0, 2)

  return createAssistantMessage({
    content: [matchedDoc.summary, ...highlights].join(" "),
    ctaLabel: "Read full guide",
    ctaHref: `/dashboard/help/${matchedDoc.id}`,
  })
}

export default function SupportChatWidget() {
  const pathname = usePathname()
  const docs = useMemo(() => getHelpDocs(), [])
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      createAssistantMessage({
        content: "Need help with Pasive? Ask about setup, products, payouts, analytics, or billing and I'll point you to the right guide.",
      }),
    ],
    []
  )

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const isDashboardRoute = pathname?.startsWith("/dashboard")
  const bottomOffset = isDashboardRoute
    ? "calc(env(safe-area-inset-bottom, 0px) + 5.75rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)"

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen, messages])

  const suggestedLinks = docs.slice(0, 3)

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }

    const assistantMessage = buildDocResponse(trimmed, docs)

    setMessages((current) => [...current, userMessage, assistantMessage])
    setInput("")
    setIsOpen(true)
  }

  return (
    <div
      className="fixed right-3 z-[70] flex flex-col items-end gap-2 sm:right-6 sm:gap-3"
      style={{ bottom: bottomOffset }}
    >
      {isOpen ? (
        <section 
          className="flex flex-col w-[calc(100vw-1.5rem)] sm:w-[22rem] overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl"
          style={{ maxHeight: `min(36rem, calc(100dvh - ${bottomOffset} - 4.5rem))` }}
        >
          <div className="border-b border-border/70 bg-gradient-to-br from-primary/20 via-background to-background px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                  <LifeBuoy className="h-3.5 w-3.5" />
                  Support
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold sm:text-lg">Pasive support</h2>
                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                    Help docs first, direct support when needed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close support chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:px-4",
                  message.role === "assistant"
                    ? "mr-auto bg-muted text-foreground"
                    : "ml-auto bg-primary text-primary-foreground"
                )}
              >
                <p>{message.content}</p>
                {message.ctaHref && message.ctaLabel ? (
                  <div className="mt-3">
                    {message.external ? (
                      <a
                        href={message.ctaHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                      >
                        {message.ctaLabel}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={message.ctaHref}
                        className="inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                      >
                        {message.ctaLabel}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            ))}

            <div className="space-y-2">
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Quick prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-dashed border-border/80 bg-muted/40 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpenText className="h-4 w-4 text-primary" />
                Popular guides
              </div>
              <div className="space-y-2">
                {suggestedLinks.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/dashboard/help/${doc.id}`}
                    className="flex items-center justify-between gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="line-clamp-1">{doc.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSend(input)
            }}
            className="border-t border-border/70 p-3 sm:p-4"
          >
            <label htmlFor="support-chat-input" className="sr-only">
              Ask support a question
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="support-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Ask about products, payouts, analytics, or billing"
                className="min-h-16 flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard/help" className="inline-flex items-center gap-1 hover:text-foreground">
                <BookOpenText className="h-3.5 w-3.5" />
                Help center
              </Link>
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Pasive%20Support`} className="inline-flex items-center gap-1 hover:text-foreground">
                <Mail className="h-3.5 w-3.5" />
                {SUPPORT_EMAIL}
              </a>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-xl transition-all hover:translate-y-[-1px] hover:bg-primary/90 sm:h-11 sm:w-11"
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
      </button>
    </div>
  )
}
