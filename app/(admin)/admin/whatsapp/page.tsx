"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Send, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Conversation = {
  waId: string;
  step: string;
  productType: string | null;
  productName: string | null;
  productPrice: number | null;
  salesLink: string | null;
  lastMessage: string;
  lastMessageDirection: "inbound" | "outbound" | null;
  lastMessageAt: string | null;
  unread: boolean;
};

type ThreadMessage = {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  type: string;
  author: "bot" | "admin" | null;
  fileName: string | null;
  createdAt: string | null;
};

type ThreadResponse = {
  conversation: Pick<Conversation, "waId" | "step" | "productType" | "productName" | "productPrice" | "salesLink">;
  messages: ThreadMessage[];
};

function formatTime(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStep(step: string) {
  return step.replace(/_/g, " ");
}

export default function AdminWhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeWaId, setActiveWaId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [reply, setReply] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((item) => item.waId === activeWaId) || null,
    [activeWaId, conversations]
  );

  const loadConversations = async () => {
    setError("");
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load conversations");
      const next = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(next);
      setActiveWaId((current) => current || next[0]?.waId || null);
    } catch (err: any) {
      setError(err?.message || "Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  };

  const loadThread = async (waId: string) => {
    setError("");
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/${encodeURIComponent(waId)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load thread");
      setThread(data);
      setConversations((current) =>
        current.map((item) => (item.waId === waId ? { ...item, unread: false } : item))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to load thread");
    } finally {
      setLoadingThread(false);
    }
  };

  const sendReply = async () => {
    if (!activeWaId || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/whatsapp/${encodeURIComponent(activeWaId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");
      setReply("");
      await Promise.all([loadThread(activeWaId), loadConversations()]);
    } catch (err: any) {
      setError(err?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeWaId) loadThread(activeWaId);
  }, [activeWaId]);

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[640px] flex-col overflow-hidden rounded-lg border bg-background lg:flex-row">
      <aside className="flex h-64 shrink-0 flex-col border-b bg-card lg:h-full lg:w-80 lg:border-b-0 lg:border-r">
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div>
            <h1 className="text-sm font-semibold">WhatsApp</h1>
            <p className="text-xs text-muted-foreground">{conversations.length} conversations</p>
          </div>
          <Button variant="ghost" size="icon" onClick={loadConversations} disabled={loadingList}>
            <RefreshCw className={cn("h-4 w-4", loadingList && "animate-spin")} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.waId}
              type="button"
              onClick={() => setActiveWaId(conversation.waId)}
              className={cn(
                "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60",
                activeWaId === conversation.waId && "bg-muted"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{conversation.waId}</p>
                  {conversation.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.lastMessage || "No messages yet"}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge variant="outline" className="capitalize">
                    {formatStep(conversation.step)}
                  </Badge>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(conversation.lastMessageAt)}</span>
                </div>
              </div>
            </button>
          ))}

          {!loadingList && conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No WhatsApp conversations yet.</div>
          ) : null}
        </div>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{activeConversation?.waId || "Select a conversation"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {thread?.conversation.productName || activeConversation?.productName || "WhatsApp onboarding"}
            </p>
          </div>
          {thread?.conversation.salesLink ? (
            <a
              href={thread.conversation.salesLink}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Sales link
            </a>
          ) : null}
        </div>

        {error ? (
          <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-4">
          {loadingThread ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading conversation...</div>
          ) : null}

          {!loadingThread && thread ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {thread.messages.map((message) => {
                const outbound = message.direction === "outbound";
                return (
                  <div key={message.id} className={cn("flex", outbound ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-lg px-3 py-2 text-sm shadow-sm",
                        outbound ? "bg-primary text-primary-foreground" : "bg-background"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                      <div
                        className={cn(
                          "mt-1 flex justify-end gap-2 text-[10px]",
                          outbound ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {message.author ? <span>{message.author}</span> : null}
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t bg-background p-3">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Reply from Pasive..."
              className="min-h-11 resize-none"
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  sendReply();
                }
              }}
            />
            <Button onClick={sendReply} disabled={!activeWaId || !reply.trim() || sending} className="h-11 shrink-0 gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
