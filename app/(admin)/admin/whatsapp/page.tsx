"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, FileText, ImageIcon, Music, Paperclip, RefreshCw, Send, Smartphone, Video, X } from "lucide-react";
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
  source: string | null;
  supportSessionId: string | null;
  customerName: string | null;
  leadSource: string | null;
  adHeadline: string | null;
  adSourceId: string | null;
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
  author: "bot" | "admin" | "widget" | null;
  mediaId?: string | null;
  fileName: string | null;
  createdAt: string | null;
};

type ThreadResponse = {
  conversation: Pick<Conversation, "waId" | "step" | "productType" | "productName" | "productPrice" | "salesLink" | "source" | "supportSessionId" | "customerName" | "leadSource" | "adHeadline" | "adSourceId">;
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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ type }: { type: string }) {
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "audio") return <Music className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function attachmentTypeFromFile(file: File) {
  const type = file.type.split("/")[0];
  return type === "image" || type === "video" || type === "audio" ? type : "document";
}

export default function AdminWhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeWaId, setActiveWaId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const activeWaIdRef = useRef<string | null>(null);

  const [showMobileThread, setShowMobileThread] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.waId === activeWaId) || null,
    [activeWaId, conversations]
  );

  const loadConversations = useCallback(async (silent = false) => {
    setError("");
    if (!silent) setLoadingList(true);
    try {
      const res = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load conversations");
      const next = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(next);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      setError(err?.message || "Failed to load conversations");
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (waId: string, silent = false) => {
    setError("");
    if (!silent) setLoadingThread(true);
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
      if (!silent) setLoadingThread(false);
    }
  }, []);

  const sendReply = async () => {
    if (!activeWaId || (!reply.trim() && !selectedFile)) return;
    setSending(true);
    setError("");
    try {
      const body = selectedFile ? new FormData() : JSON.stringify({ text: reply });
      if (selectedFile && body instanceof FormData) {
        body.append("text", reply);
        body.append("file", selectedFile);
      }

      const res = await fetch(`/api/admin/whatsapp/${encodeURIComponent(activeWaId)}`, {
        method: "POST",
        headers: selectedFile ? undefined : { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");
      setReply("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await Promise.all([loadThread(activeWaId), loadConversations()]);
    } catch (err: any) {
      setError(err?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  // Keep ref in sync so polling closures always use the current waId.
  useEffect(() => {
    activeWaIdRef.current = activeWaId;
  }, [activeWaId]);

  // Initial load.
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Poll the conversations list every 30 s (silent = no loading spinner).
  useEffect(() => {
    const id = setInterval(() => loadConversations(true), 30_000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // Load thread when user selects a conversation.
  useEffect(() => {
    if (activeWaId) loadThread(activeWaId);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [activeWaId, loadThread]);

  // Poll the active thread every 15 s (silent = no loading spinner).
  useEffect(() => {
    const id = setInterval(() => {
      if (activeWaIdRef.current) loadThread(activeWaIdRef.current, true);
    }, 15_000);
    return () => clearInterval(id);
  }, [loadThread]);

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)] min-h-[500px] flex-col overflow-hidden bg-background lg:rounded-lg lg:border lg:flex-row">
      <aside className={cn(
        "flex shrink-0 flex-col bg-card lg:h-full lg:w-80 lg:border-r",
        showMobileThread ? "hidden lg:flex" : "flex h-full w-full"
      )}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div>
            <h1 className="text-sm font-semibold">WhatsApp</h1>
            <p className="text-xs text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              {lastRefreshedAt ? (
                <span className="ml-1 text-[10px] opacity-50">
                  · {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : null}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => loadConversations()} disabled={loadingList}>
            <RefreshCw className={cn("h-4 w-4", loadingList && "animate-spin")} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.waId}
              type="button"
              onClick={() => {
                setActiveWaId(conversation.waId);
                setShowMobileThread(true);
              }}
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
                  <p className="truncate text-sm font-medium">{conversation.customerName || conversation.waId}</p>
                  {conversation.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
                {conversation.customerName ? (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{conversation.waId}</p>
                ) : null}
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.lastMessage || "No messages yet"}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge variant="outline" className="capitalize">
                    {conversation.leadSource === "click_to_whatsapp_ad" ? "Ad lead" : conversation.source === "support_widget" ? "Support" : formatStep(conversation.step)}
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

      <section className={cn(
        "flex min-h-0 flex-1 flex-col",
        !showMobileThread ? "hidden lg:flex" : "flex h-full w-full"
      )}>
        <div className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b px-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setShowMobileThread(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{thread?.conversation.customerName || activeConversation?.customerName || activeConversation?.waId || "Select a conversation"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {thread?.conversation.source === "support_widget" || activeConversation?.source === "support_widget"
                  ? `Support via Messages · ${activeConversation?.waId || thread?.conversation.waId || ""}`
                  : thread?.conversation.adHeadline || activeConversation?.adHeadline || thread?.conversation.productName || activeConversation?.productName || "WhatsApp onboarding"}
              </p>
            </div>
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
          {!activeWaId && !loadingThread ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Smartphone className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          ) : null}

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
                      {message.type !== "text" || message.fileName || message.mediaId ? (
                        <div
                          className={cn(
                            "mb-2 flex items-center gap-2 rounded-md border px-2.5 py-2",
                            outbound ? "border-primary-foreground/20 bg-primary-foreground/10" : "bg-muted/40"
                          )}
                        >
                          <AttachmentIcon type={message.type} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {message.fileName || `${message.type || "media"} attachment`}
                            </p>
                            <p
                              className={cn(
                                "text-[10px] capitalize",
                                outbound ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {message.type || "media"}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {message.content ? <p className="whitespace-pre-wrap leading-6">{message.content}</p> : null}
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

        {activeWaId && (
          <div className="shrink-0 border-t bg-background p-3">
            <div className="mx-auto max-w-3xl">
              {selectedFile ? (
                <div className="mb-2 flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <AttachmentIcon type={attachmentTypeFromFile(selectedFile)} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={sending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (file && file.size > 100 * 1024 * 1024) {
                      setError("Attachment must be 100MB or less");
                      event.target.value = "";
                      return;
                    }
                    setError("");
                    setSelectedFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="h-11 w-11 shrink-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={selectedFile ? "Add a caption..." : "Reply from Pasive..."}
                  className="min-h-11 resize-none"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <Button onClick={sendReply} disabled={!activeWaId || (!reply.trim() && !selectedFile) || sending} className="h-11 shrink-0 gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
