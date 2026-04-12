'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  formatSocialDate,
  getMessageThreads,
  sendMessage,
  type SocialThreadWithParticipant,
  onMessagesSnapshot,
  getThreadId,
  getSocialProfileById,
  type SocialMessage,
  markThreadAsRead
} from '@/lib/social-data'
import { useAuth } from '@/hooks/useAuth'

export default function MessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [threads, setThreads] = useState<SocialThreadWithParticipant[]>([])
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [loading, setLoading] = useState(true)
  const requestedUserId = searchParams.get('user')
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(requestedUserId)
  const [newChatProfile, setNewChatProfile] = useState<any>(null)

  useEffect(() => {
    if (!user?.uid) return
    let active = true

    const load = async () => {
      try {
        const nextThreads = await getMessageThreads(user.uid)
        if (!active) return
        setThreads(nextThreads)

        if (requestedUserId) {
          const existing = nextThreads.find(t => t.participantId === requestedUserId)
          if (existing) {
            setSelectedParticipantId(requestedUserId)
          } else {
            // New chat
            const profile = await getSocialProfileById(requestedUserId)
            if (active && profile) {
              setNewChatProfile(profile)
              setSelectedParticipantId(requestedUserId)
            }
          }
        } else if (nextThreads.length > 0) {
          setSelectedParticipantId(nextThreads[0].participantId)
        }
      } catch (err) {
        console.error('Failed to load threads:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [user?.uid, requestedUserId])

  // Real-time messages listener
  useEffect(() => {
    if (!user?.uid || !selectedParticipantId) {
      setMessages([])
      return
    }

    if (user?.uid && selectedParticipantId) {
      const threadId = getThreadId(user.uid, selectedParticipantId)
      void markThreadAsRead(threadId, user.uid)
    }

    const threadId = getThreadId(user.uid, selectedParticipantId)
    const unsubscribe = onMessagesSnapshot(threadId, (msgs) => {
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [user?.uid, selectedParticipantId])

  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) =>
        thread?.participant.name.toLowerCase().includes(query.toLowerCase()) ||
        thread?.participant.handle.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, threads],
  )

  const activeThread = filteredThreads.find((thread) => thread?.participantId === selectedParticipantId)
  const activeParticipant = activeThread?.participant || newChatProfile

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.uid || !selectedParticipantId || !draft.trim()) return

    const messageText = draft.trim()
    setDraft('')
    
    try {
      await sendMessage(user.uid, selectedParticipantId, messageText)
      // Threads will be refreshed eventually, or we can update locally
      const nextThreads = await getMessageThreads(user.uid)
      setThreads(nextThreads)
      if (newChatProfile && selectedParticipantId === newChatProfile.id) {
        setNewChatProfile(null)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setDraft(messageText) // Restore draft on error
    }
  }

  if (loading) {
    return <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Loading messages...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[320px,1fr]">
        <Card className="min-h-[420px]">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search messages" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-2 pb-2 sm:px-6 sm:pb-6">
            {threads.length === 0 && !newChatProfile && (
              <div className="py-8 text-center text-sm text-muted-foreground italic">No messages yet.</div>
            )}
            {newChatProfile && (
              <button key="new-chat" onClick={() => setSelectedParticipantId(newChatProfile.id)} className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left bg-accent/20 border-primary/50 sm:gap-3 sm:p-3 ${selectedParticipantId === newChatProfile.id ? 'bg-accent/40 ring-1 ring-primary' : ''}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={newChatProfile.image} alt={newChatProfile.name} />
                  <AvatarFallback>{newChatProfile.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{newChatProfile.name}</p>
                  <p className="truncate text-xs text-primary font-medium italic">New conversation</p>
                </div>
                <Badge variant="outline">New</Badge>
              </button>
            )}
            {filteredThreads.map((thread) => (
              <button key={thread.id} onClick={() => {
                setSelectedParticipantId(thread.participantId)
                setNewChatProfile(null)
              }} className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left hover:bg-accent/40 sm:gap-3 sm:p-3 ${selectedParticipantId === thread.participantId ? 'border-primary bg-accent/40' : ''}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={thread.participant.image} alt={thread.participant.name} />
                  <AvatarFallback>{thread.participant.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${thread.hasUnread ? 'font-bold' : 'font-medium'}`}>{thread.participant.name}</p>
                    <span className="text-xs text-muted-foreground">{formatSocialDate(thread.lastMessage.createdAt, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className={`truncate text-xs ${thread.hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{thread.lastMessage.text}</p>
                </div>
                {thread.hasUnread && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="min-h-[420px]">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">{activeParticipant?.name || 'Messages'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6 flex flex-col min-h-[400px]">
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
              {messages.length === 0 && !newChatProfile && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm italic">Select a conversation or start a new one.</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderId === user?.uid ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{message.text}</p>
                  <p className={`mt-1 text-[10px] ${message.senderId === user?.uid ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{formatSocialDate(message.createdAt)}</p>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2">
                <Input placeholder="Type your message..." value={draft} onChange={(event) => setDraft(event.target.value)} />
                <Button size="icon" aria-label="Send message" type="submit" disabled={!activeThread || !draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
