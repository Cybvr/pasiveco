'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatSocialDate, getMessageThreads, sendMessage } from '@/lib/social-data'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [threads, setThreads] = useState(() => getMessageThreads())
  const requestedUser = searchParams.get('user')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(requestedUser)

  useEffect(() => {
    const nextThreads = getMessageThreads()
    setThreads(nextThreads)
    setSelectedThreadId(requestedUser || nextThreads[0]?.participantId || null)
  }, [requestedUser])

  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) =>
        thread?.participant.name.toLowerCase().includes(query.toLowerCase()) ||
        thread?.participant.handle.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, threads],
  )

  const activeThread = filteredThreads.find((thread) => thread?.participantId === selectedThreadId) || filteredThreads[0] || null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeThread || !draft.trim()) return

    const updatedThread = sendMessage(activeThread.participantId, draft)
    setDraft('')
    setThreads(getMessageThreads())
    setSelectedThreadId(updatedThread?.participantId || activeThread.participantId)
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
            {filteredThreads.map((thread) => (
              <button key={thread!.id} onClick={() => setSelectedThreadId(thread!.participantId)} className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left hover:bg-accent/40 sm:gap-3 sm:p-3 ${selectedThreadId === thread!.participantId ? 'border-primary bg-accent/40' : ''}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={thread!.participant.image} alt={thread!.participant.name} />
                  <AvatarFallback>{thread!.participant.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{thread!.participant.name}</p>
                    <span className="text-xs text-muted-foreground">{formatSocialDate(thread!.lastMessage.createdAt, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{thread!.lastMessage.text}</p>
                </div>
                {thread!.messages.some((message) => message.senderId !== 'viewer-me') && <Badge variant="default">Live</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="min-h-[420px]">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">{activeThread?.participant.name || 'Messages'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
            {activeThread?.messages.map((message) => (
              <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderId === 'viewer-me' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{message.text}</p>
                <p className={`mt-1 text-[10px] ${message.senderId === 'viewer-me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{formatSocialDate(message.createdAt)}</p>
              </div>
            ))}
            <div className="pt-2">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
