'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState, useRef } from 'react'
import { MessageSquare, Search, Send, SquarePen } from 'lucide-react'
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
import { getUser, getPublicUsers } from '@/services/userService'
import { getDisplayAvatar } from '@/lib/avatar'

function MessagesPageFallback() {
  return <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Loading messages...</div>
}

function MessagesPageContent() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [threads, setThreads] = useState<SocialThreadWithParticipant[]>([])
  const [messages, setMessages] = useState<SocialMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [newChatProfile, setNewChatProfile] = useState<SocialThreadWithParticipant['participant'] | null>(null)
  const [requestedUserId, setRequestedUserId] = useState<string | null>(null)
  const [globalUsers, setGlobalUsers] = useState<any[]>([])
  const [isComposing, setIsComposing] = useState(false)
  const [composeQuery, setComposeQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const composeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPublicUsers().then(users => {
      const mapped = users.map(u => ({
        id: u.id || u.userId,
        name: u.displayName || u.username || u.slug || 'User',
        handle: `@${(u.username || u.slug || u.email?.split('@')[0] || 'user').replace(/^@/, '').trim()}`,
        image: getDisplayAvatar({
          image: u.profilePicture || u.photoURL || '',
          displayName: u.displayName || u.username || 'User',
          handle: u.username || u.slug || u.userId || u.id,
        })
      }))
      setGlobalUsers(mapped)
    }).catch(err => console.error("Could not load users for search", err))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('user')
    setRequestedUserId(userId)
    if (userId) setSelectedParticipantId(userId)
  }, [])

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
            setNewChatProfile(null)
            setSelectedParticipantId(requestedUserId)
          } else {
            const socialProfile = await getSocialProfileById(requestedUserId)
            const fallbackUser = socialProfile ? null : await getUser(requestedUserId).catch(() => null)
            const profile = socialProfile || (fallbackUser ? {
              id: fallbackUser.userId || fallbackUser.id || requestedUserId,
              name: fallbackUser.displayName || fallbackUser.username || fallbackUser.slug || 'User',
              handle: `@${(fallbackUser.username || fallbackUser.slug || fallbackUser.email?.split('@')[0] || 'user').replace(/^@/, '').trim()}`,
              image: getDisplayAvatar({
                image: fallbackUser.profilePicture || fallbackUser.photoURL || '',
                displayName: fallbackUser.displayName || fallbackUser.username || 'User',
                handle: fallbackUser.username || fallbackUser.slug || fallbackUser.userId || requestedUserId,
              }),
            } : null)

            if (active && profile) {
              setNewChatProfile(profile)
              setSelectedParticipantId(requestedUserId)
            }
          }
        } else if (nextThreads.length > 0) {
          setNewChatProfile(null)
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

  const composeFilteredUsers = useMemo(() => {
    if (!composeQuery.trim()) return []
    
    const existingIds = new Set(threads.map(t => t.participantId))
    if (user?.uid) existingIds.add(user.uid)

    return globalUsers.filter(u => 
        !existingIds.has(u.id) && 
        (u.name.toLowerCase().includes(composeQuery.trim().toLowerCase()) || 
         u.handle.toLowerCase().includes(composeQuery.trim().toLowerCase()))
    ).slice(0, 10)
  }, [composeQuery, globalUsers, threads, user?.uid])

  const handleCompose = () => {
    setSelectedParticipantId(null)
    setNewChatProfile(null)
    setIsComposing(true)
    setComposeQuery('')
    setTimeout(() => {
      composeInputRef.current?.focus()
    }, 50)
  }

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
      setIsComposing(false)
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
        <Card className="min-h-[420px] flex flex-col">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Messages</h2>
              <Button size="icon" variant="ghost" onClick={handleCompose} aria-label="Compose new message">
                <SquarePen className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Search messages..." 
                value={query} 
                onChange={(event) => setQuery(event.target.value)} 
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-2 pb-2 sm:px-4 sm:pb-4 flex-1 overflow-y-auto">
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

            {query.trim() && filteredThreads.length === 0 && (
               <div className="py-8 text-center text-sm text-muted-foreground italic">No messages found.</div>
            )}

          </CardContent>
        </Card>
        <Card className="min-h-[420px] flex flex-col">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6 border-b border-border/40 pb-3">
            {isComposing && !selectedParticipantId ? (
              <div className="flex items-center gap-2 relative">
                <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">To:</span>
                <Input 
                  ref={composeInputRef}
                  className="border-0 shadow-none focus-visible:ring-0 px-1 text-base bg-transparent" 
                  placeholder="Type a name or username..." 
                  value={composeQuery}
                  onChange={(e) => setComposeQuery(e.target.value)}
                />
                
                {composeQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-md border shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {composeFilteredUsers.length > 0 ? (
                      <div className="p-1">
                        {composeFilteredUsers.map((u) => (
                          <button key={`compose-${u.id}`} onClick={() => {
                            setSelectedParticipantId(u.id)
                            setNewChatProfile(u)
                            setIsComposing(false)
                            setComposeQuery('')
                          }} className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-left transition-colors">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.image} alt={u.name} />
                              <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{u.name}</span>
                              <span className="text-[10px] text-muted-foreground">{u.handle}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No users found.</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <CardTitle className="text-base font-semibold">
                {activeParticipant?.name || 'Messages'}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6 flex flex-col flex-1">
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide py-4">
              {isComposing && !selectedParticipantId ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
                  <SquarePen className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">New Message</p>
                  <p className="text-xs mt-1 text-center max-w-[250px]">Search and select a user from the dropdown above to start a conversation.</p>
                </div>
              ) : messages.length === 0 && !newChatProfile ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Your Messages</p>
                  <p className="text-xs mt-1 text-center max-w-[250px]">Select a conversation or click the compose button to start a new one.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderId === user?.uid ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[10px] ${message.senderId === user?.uid ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{formatSocialDate(message.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="pt-2 border-t mt-auto">
              <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2 pt-2">
                <Input placeholder="Type your message..." value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!selectedParticipantId} />
                <Button size="icon" aria-label="Send message" type="submit" disabled={!selectedParticipantId || !draft.trim()}>
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

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageFallback />}>
      <MessagesPageContent />
    </Suspense>
  )
}
