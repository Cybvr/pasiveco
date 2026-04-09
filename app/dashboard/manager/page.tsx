"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader } from "@/components/ui/card";
import { Home, Menu, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import RecentChats from "@/components/manager/RecentChats";
import UserMenu from "@/app/common/dashboard/user-menu";

// ─── Shared constants ───────────────────────────────────────────────────────

export const quickReplies = [
    "How many products do I have?",
    "What's my available balance?",
    "Show my most recent sales",
    "Do I have a payout account set up?",
    "How many customers do I have?",
    "Any refunds yet?",
    "What's my top product?",
    "When was my last payout?",
];

export type RecentChat = { id: string; title: string; time: string };

export interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
}

// ─── Shared UI components ────────────────────────────────────────────────────

export const AgentAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <div className={cn(size === "sm" ? "h-7 w-7" : "h-9 w-9", "shrink-0 rounded-full bg-primary/10 flex items-center justify-center")}>
        <Image src="/images/logo.svg" alt="Pasive" width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18} />
    </div>
);

/**
 * Shared page shell — header with menu drawer + home/dashboard nav.
 * Used by both the home page and the [id] chat page.
 */
export function ManagerShell({
    recentChats,
    onRename,
    onDelete,
    title = "Business Manager",
    children,
}: {
    recentChats: RecentChat[];
    onRename: (id: string, title: string) => void;
    onDelete: (id: string) => void;
    title?: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    return (
        <div className="h-full">
            <div className="flex h-full w-full flex-col">
                <Card className="flex h-full w-full flex-col overflow-hidden rounded-none border-0">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center gap-3 px-5 py-3 border-b shrink-0">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[70%] max-w-[240px] p-0 flex flex-col gap-0 border-r">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Recent Chats</SheetTitle>
                                </SheetHeader>
                                <div className="pt-6 px-4 pb-4">
                                    <Link href="/dashboard" className="flex items-center">
                                        <h1 className="text-xl font-chunko text-foreground leading-none translate-y-[1px]">PASIVE</h1>
                                    </Link>
                                </div>
                                <div className="p-2">
                                    <div className="mb-2 space-y-px">
                                        <button
                                            type="button"
                                            onClick={() => router.push("/dashboard/manager")}
                                            className="flex w-full items-center rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                        >
                                            Manager Home
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/dashboard")}
                                            className="flex w-full items-center rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                        >
                                            Dashboard Home
                                        </button>
                                    </div>
                                    <div className="px-2 pt-2 pb-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                                            Recent Chats
                                        </p>
                                    </div>
                                    <RecentChats
                                        items={recentChats}
                                        onOpen={(id) => router.push(`/dashboard/manager/${id}`)}
                                        onRename={onRename}
                                        onDelete={onDelete}
                                    />
                                </div>
                                <div className="mt-auto p-2">
                                    <UserMenu isCollapsed={false} />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="flex flex-1 text-left">
                            <p className="truncate text-sm font-semibold leading-none">{title}</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => router.push("/dashboard")}
                            aria-label="Dashboard home"
                        >
                            <Home className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    {children}
                </Card>
            </div>
        </div>
    );
}

// ─── Home page (default export for /dashboard/manager) ───────────────────────

export default function ManagerHomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
    const [input, setInput] = useState("");
    const [starting, setStarting] = useState(false);
    const startedFromPromptRef = useRef(false);

    const timeOfDay = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const headline = `${timeOfDay}${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`;

    const loadSessions = async (uid: string) => {
        const res = await fetch(`/api/manager/sessions?userId=${uid}`);
        const data = await res.json();
        if (Array.isArray(data.sessions)) {
            setRecentChats(data.sessions.map((s: any) => ({
                id: s.id,
                title: s.title || "Chat",
                time: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Just now",
            })));
        }
    };

    const renameChat = async (id: string, title: string) => {
        await fetch("/api/manager/sessions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id, title }),
        });
        setRecentChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    };

    const deleteChat = async (id: string) => {
        await fetch("/api/manager/sessions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id }),
        });
        setRecentChats((prev) => prev.filter((c) => c.id !== id));
    };

    // Start a new chat: run the fast ack step to get a session ID, then navigate
    const startChat = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || !user?.uid || starting) return;
        setStarting(true);
        try {
            const res = await fetch("/api/manager/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: "ack", sessionId: null, userId: user.uid, message: trimmed, history: [] }),
            });
            const data = await res.json();
            if (data?.sessionId) {
                router.push(`/dashboard/manager/${data.sessionId}?prompt=${encodeURIComponent(trimmed)}`);
            }
        } finally {
            setStarting(false);
        }
    };

    useEffect(() => {
        if (!user?.uid) return;
        void loadSessions(user.uid);
    }, [user?.uid]);

    useEffect(() => {
        const prompt = searchParams?.get("prompt")?.trim();
        if (!prompt || !user?.uid || starting || startedFromPromptRef.current) return;
        startedFromPromptRef.current = true;
        void startChat(prompt);
    }, [searchParams, user?.uid, starting]);

    const handleSend = () => {
        if (!input.trim()) return;
        void startChat(input);
        setInput("");
    };

    return (
        <ManagerShell recentChats={recentChats} onRename={renameChat} onDelete={deleteChat} title="Business Manager">
            <ScrollArea className="flex-1">
                <div className="flex flex-col items-center justify-center min-h-full px-4 py-6 max-w-2xl mx-auto w-full">
                    <h1 className="text-xl font-semibold text-foreground py-8">{headline}</h1>

                    <div className="w-full flex items-center gap-2 border rounded-xl px-4 py-3 mb-4 bg-background">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask your Business Manager anything..."
                            className="border-0 p-0 h-auto text-sm shadow-none focus-visible:ring-0 focus:bg-transparent bg-transparent"
                            disabled={starting}
                        />
                        <Button size="icon" className="rounded-full h-8 w-8 shrink-0" onClick={handleSend} disabled={starting}>
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {quickReplies.map((label) => (
                            <Button
                                key={label}
                                variant="outline"
                                size="sm"
                                className="rounded-full h-8 px-4 text-xs font-normal"
                                onClick={() => startChat(label)}
                                disabled={starting}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    <p className="w-full text-xs text-muted-foreground mb-3">Recent chats</p>
                    <RecentChats
                        items={recentChats}
                        onOpen={(id) => router.push(`/dashboard/manager/${id}`)}
                        onRename={renameChat}
                        onDelete={deleteChat}
                    />
                </div>
            </ScrollArea>
        </ManagerShell>
    );
}
