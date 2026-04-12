"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import RecentChats from "@/components/manager/RecentChats";
import {
    AgentAvatar,
    ManagerShell,
    Message,
    RecentChat,
    quickReplies,
} from "../page";

export default function ManagerChatPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const sessionId = typeof params?.id === "string" ? params.id : "";
    const initialPrompt = searchParams?.get("prompt") || "";

    const [messages, setMessages] = useState<Message[]>([]);
    const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
    const [chatTitle, setChatTitle] = useState("Business Manager");
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const activeAssistantIdRef = useRef<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const didRunInitialPrompt = useRef(false);

    // ── Data loaders ────────────────────────────────────────────────────────

    const loadSessions = async (uid: string) => {
        const res = await fetch(`/api/manager/sessions?userId=${uid}`);
        const data = await res.json();
        if (Array.isArray(data.sessions)) {
            const nextChats = data.sessions.map((s: any) => ({
                id: s.id,
                title: s.title || "Chat",
                time: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Just now",
            }));
            setRecentChats(nextChats);
            const currentChat = nextChats.find((chat: RecentChat) => chat.id === sessionId);
            if (currentChat?.title) {
                setChatTitle(currentChat.title);
            }
        }
    };

    const loadSessionMessages = async (sid: string) => {
        const res = await fetch(`/api/manager/chat?sessionId=${sid}`);
        const data = await res.json();
        if (Array.isArray(data.messages)) {
            setMessages(data.messages.map((m: any) => ({
                id: m.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                role: m.role === "assistant" ? "assistant" : "user",
                text: m.content,
            })));
        }
    };

    // ── Session management ──────────────────────────────────────────────────

    const renameChat = async (id: string, title: string) => {
        await fetch("/api/manager/sessions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id, title }),
        });
        setRecentChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
        if (id === sessionId) {
            setChatTitle(title);
        }
    };

    const deleteChat = async (id: string) => {
        await fetch("/api/manager/sessions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id }),
        });
        setRecentChats((prev) => prev.filter((c) => c.id !== id));
        // If we just deleted the current session, go home
        if (id === sessionId) {
            router.push("/dashboard/manager");
        }
    };

    // ── Messaging ────────────────────────────────────────────────────────────

    /**
     * Run only the data step — used for the initialPrompt flow where the ack
     * step was already done server-side before navigation.
     */
    const runDataStep = async (promptText: string, sid: string, uid: string) => {
        setTyping(true);
        try {
            const res = await fetch("/api/manager/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: "data", sessionId: sid, userId: uid, message: promptText, history: [] }),
            });
            const data = await res.json();
            const answer = typeof data?.answer === "string" ? data.answer.trim() : "";
            const followup = typeof data?.followup === "string" ? data.followup.trim() : "";
            if (answer || followup) {
                const combined = [answer, followup].filter(Boolean).join("\n\n");
                setMessages((prev) => [...prev, { id: `${Date.now()}-ans`, role: "assistant", text: combined }]);
            }
            void loadSessions(uid);
        } finally {
            setTyping(false);
        }
    };

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || !user?.uid || !sessionId) return;

        const nextUserMsg: Message = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: "user",
            text: trimmed,
        };
        setMessages((prev) => [...prev, nextUserMsg]);
        setInput("");

        const history = [...messages, nextUserMsg].map((m) => ({ role: m.role, content: m.text }));

        try {
            // Step 1: ack
            const resAck = await fetch("/api/manager/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: "ack", sessionId, userId: user.uid, message: trimmed, history }),
            });
            const dataAck = await resAck.json();

            if (dataAck?.ack) {
                const ackId = `${Date.now()}-ack`;
                activeAssistantIdRef.current = ackId;
                setMessages((prev) => [...prev, { id: ackId, role: "assistant", text: dataAck.ack }]);
            }
            setTyping(true);

            // Step 2: data
            const resData = await fetch("/api/manager/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: "data", sessionId, userId: user.uid, message: trimmed, history }),
            });
            const dataData = await resData.json();
            const answer = typeof dataData?.answer === "string" ? dataData.answer.trim() : "";
            const followup = typeof dataData?.followup === "string" ? dataData.followup.trim() : "";

            const activeId = activeAssistantIdRef.current;
            activeAssistantIdRef.current = null;

            if (activeId) {
                // Replace ack bubble entirely — ack text was transient
                const combined = [answer, followup].filter(Boolean).join("\n\n");
                setMessages((prev) =>
                    prev.map((m) => (m.id !== activeId ? m : { ...m, text: combined || m.text }))
                );
            } else if (answer || followup) {
                const combined = [answer, followup].filter(Boolean).join("\n\n");
                setMessages((prev) => [...prev, { id: `${Date.now()}-ans`, role: "assistant", text: combined }]);
            }

            void loadSessions(user.uid);
        } catch {
            activeAssistantIdRef.current = null;
            setMessages((prev) => [
                ...prev,
                { id: `${Date.now()}-err`, role: "assistant", text: "Sorry, I couldn't process that. Try again." },
            ]);
        } finally {
            setTyping(false);
        }
    };

    // ── Effects ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!sessionId || !user?.uid) return;
        void loadSessionMessages(sessionId);
        void loadSessions(user.uid);
    }, [sessionId, user?.uid]);

    // Run the data step for an initialPrompt exactly once after messages load
    useEffect(() => {
        if (!initialPrompt || !sessionId || !user?.uid) return;
        if (didRunInitialPrompt.current) return;
        // Wait until messages state is set before running (so the ack bubble is visible)
        didRunInitialPrompt.current = true;
        void runDataStep(initialPrompt, sessionId, user.uid);
    }, [initialPrompt, sessionId, user?.uid, messages.length]);

    // Auto-scroll on new messages or typing state change
    useEffect(() => {
        const id = setTimeout(() => {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 60);
        return () => clearTimeout(id);
    }, [messages, typing]);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <ManagerShell recentChats={recentChats} onRename={renameChat} onDelete={deleteChat} title={chatTitle}>
            {/* Messages */}
            <ScrollArea className="flex-1 px-5 pt-5 pb-24">
                <div className="mx-auto w-full max-w-3xl flex flex-col gap-5">
                    {/* Quick reply chips at top of chat */}
                    <div className="flex flex-wrap gap-2 pl-10">
                        {quickReplies.map((label) => (
                            <Button
                                key={label}
                                variant="outline"
                                size="sm"
                                className="rounded-full h-8 px-4 text-xs font-normal border"
                                onClick={() => sendMessage(label)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn("flex gap-3 items-end", msg.role === "user" && "justify-end")}
                        >
                            {msg.role === "assistant" && <AgentAvatar size="sm" />}
                            <div className="flex flex-col gap-2.5 max-w-[75%]">
                                <div
                                    className={cn(
                                        "text-sm leading-relaxed whitespace-pre-wrap",
                                        msg.role === "assistant"
                                            ? "text-foreground"
                                            : "rounded-2xl rounded-br-sm bg-accent/60 px-3 py-2 text-foreground"
                                    )}
                                >
                                    <div className="flex flex-col gap-2">
                                        <span>{msg.text}</span>
                                        {msg.role === "assistant" &&
                                            typing &&
                                            activeAssistantIdRef.current === msg.id && (
                                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Working on it…
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Global typing indicator when no ack bubble is present yet */}
                    {typing && !activeAssistantIdRef.current && (
                        <div className="flex gap-3 items-end">
                            <AgentAvatar size="sm" />
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Working on it…
                            </span>
                        </div>
                    )}

                    <div ref={endRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <CardContent className="px-0 py-3 shrink-0 sticky bottom-4 z-10 bg-transparent">
                <div className="mx-auto w-full max-w-xl px-4">
                    <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && void sendMessage(input)}
                        placeholder="Ask your Business Manager anything..."
                        className="flex-1 rounded-full h-10 px-5 text-sm"
                        disabled={typing}
                    />
                    <Button
                        size="icon"
                        className="rounded-full h-10 w-10 shrink-0"
                        onClick={() => void sendMessage(input)}
                        disabled={typing}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
            </CardContent>
        </ManagerShell>
    );
}
