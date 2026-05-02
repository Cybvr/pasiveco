'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState, useRef } from 'react'
import { MessageSquare, Search, Send, SquarePen, ArrowLeft, MoreVertical, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  formatSocialDate,
  sendMessage,
  type SocialThreadWithParticipant,
  onMessagesSnapshot,
  onMessageThreadsSnapshot,
  getThreadId,
  getSocialProfileById,
  type SocialMessage,
  markThreadAsRead,
  deleteThread
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
  // Mobile: track whether the conversation panel is visible
  const [mobileView, setMobileView] = useState<'list' | 'conversation'>('list')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const composeInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPublicUsers().then(users => {
      const mapped = users.map(u => ({
        id: u.id || u.userId,
        name: u.displayName || u.username || 'User',
        handle: `@${(u.username || u.email?.split('@')[0] || 'user').replace(/^@/, '').trim()}`,
        image: getDisplayAvatar({
          image: u.profilePicture || u.photoURL || '',
          displayName: u.displayName || u.username || 'User',
          handle: u.username || u.userId || u.id,
        })
      }))
      setGlobalUsers(mapped)
    }).catch(err => console.error("Could not load users for search", err))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('user')
    setRequestedUserId(userId)
    if (userId) {
      setSelectedParticipantId(userId)
      setMobileView('conversation')
    }
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    let active = true

    const unsubscribe = onMessageThreadsSnapshot(user.uid, async (nextThreads) => {
      if (!active) return

      setThreads(nextThreads)

      try {
        if (requestedUserId) {
          const existing = nextThreads.find((t) => t.participantId === requestedUserId)
          if (existing) {
            setNewChatProfile(null)
            setSelectedParticipantId(requestedUserId)
          } else {
            const socialProfile = await getSocialProfileById(requestedUserId)
            const fallbackUser = socialProfile ? null : await getUser(requestedUserId).catch(() => null)
            const profile = socialProfile || (fallbackUser ? {
              id: fallbackUser.userId || fallbackUser.id || requestedUserId,
              name: fallbackUser.displayName || fallbackUser.username || 'User',
              handle: `@${(fallbackUser.username || fallbackUser.email?.split('@')[0] || 'user').replace(/^@/, '').trim()}`,
              image: getDisplayAvatar({
                image: fallbackUser.profilePicture || fallbackUser.photoURL || '',
                displayName: fallbackUser.displayName || fallbackUser.username || 'User',
                handle: fallbackUser.username || fallbackUser.userId || requestedUserId,
              }),
            } : null)

            if (active && profile) {
              setNewChatProfile(profile)
              setSelectedParticipantId(requestedUserId)
            }
          }
        } else if (nextThreads.length > 0) {
          setNewChatProfile(null)
          setSelectedParticipantId((current) => current ?? nextThreads[0].participantId)
        }
      } catch (err) {
        console.error('Failed to resolve thread participants:', err)
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [user?.uid, requestedUserId])

  useEffect(() => {
    if (!user?.uid || !selectedParticipantId) {
      setMessages([])
      return
    }

    const threadId = getThreadId(user.uid, selectedParticipantId)
    const unsubscribe = onMessagesSnapshot(threadId, (msgs) => {
      setMessages(msgs)
      void markThreadAsRead(threadId, user.uid)
    })

    return () => unsubscribe()
  }, [user?.uid, selectedParticipantId])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    setMobileView('conversation')
    setTimeout(() => {
      composeInputRef.current?.focus()
    }, 50)
  }

  const handleSelectThread = (participantId: string) => {
    setSelectedParticipantId(participantId)
    setNewChatProfile(null)
    setMobileView('conversation')
  }

  const handleBack = () => {
    setMobileView('list')
    setIsComposing(false)
  }

  const handleDeleteThread = async () => {
    if (!user?.uid || !selectedParticipantId) return

    setThreads((prev) => prev.filter((t) => t.participantId !== selectedParticipantId))
    setMessages([])

    try {
      const threadId = getThreadId(user.uid, selectedParticipantId)
      await deleteThread(threadId)
    } catch (err) {
      console.error('Failed to delete thread', err)
    }

    setSelectedParticipantId(null)
    setNewChatProfile(null)
    setMobileView('list')
    setShowDeleteAlert(false)
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
      setIsComposing(false)
      if (newChatProfile && selectedParticipantId === newChatProfile.id) {
        setNewChatProfile(null)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setDraft(messageText)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Loading messages...</div>
  }

  const ThreadList = (
    <Card className="flex flex-col h-full rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-2 px-2.5 pt-2.5 sm:px-4 sm:pt-4 shrink-0">
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
      <CardContent className="space-y-2 px-2 pb-2 sm:px-4 sm:pb-4 flex-1 overflow-y-auto min-h-0">
        {threads.length === 0 && !newChatProfile && (
          <div className="py-8 text-center text-sm text-muted-foreground italic">No messages yet.</div>
        )}
        {newChatProfile && (
          <button
            key="new-chat"
            onClick={() => handleSelectThread(newChatProfile.id)}
            className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left bg-accent/20 border-primary/50 sm:gap-3 sm:p-3 ${selectedParticipantId === newChatProfile.id ? 'bg-accent/40 ring-1 ring-primary' : ''}`}
          >
            <Avatar className="h-10 w-10 shrink-0">
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
          <button
            key={thread.id}
            onClick={() => handleSelectThread(thread.participantId)}
            className={`flex w-full items-start gap-2 rounded-lg border p-2.5 text-left hover:bg-accent/40 sm:gap-3 sm:p-3 ${selectedParticipantId === thread.participantId ? 'border-primary bg-accent/40' : ''}`}
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={thread.participant.image} alt={thread.participant.name} />
              <AvatarFallback>{thread.participant.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm ${thread.hasUnread ? 'font-bold' : 'font-medium'}`}>{thread.participant.name}</p>
                <span className="text-xs text-muted-foreground shrink-0">{formatSocialDate(thread.lastMessage.createdAt, { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className={`truncate text-xs ${thread.hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{thread.lastMessage.text}</p>
            </div>
            {thread.hasUnread && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
          </button>
        ))}
        {query.trim() && filteredThreads.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground italic">No messages found.</div>
        )}
      </CardContent>
    </Card>
  )

  const ConversationPanel = (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl sm:rounded-2xl">
      <CardHeader className="px-2.5 pt-2.5 sm:px-6 sm:pt-4 border-b border-border/40 pb-2.5 shrink-0">
        {isComposing && !selectedParticipantId ? (
          <div className="flex items-center gap-2 relative">
            {/* Back button — mobile only */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleBack}
              aria-label="Back"
              className="lg:hidden shrink-0 -ml-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                      <button
                        key={`compose-${u.id}`}
                        onClick={() => {
                          setSelectedParticipantId(u.id)
                          setNewChatProfile(u)
                          setIsComposing(false)
                          setComposeQuery('')
                        }}
                        className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={u.image} alt={u.name} />
                          <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{u.handle}</span>
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
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back button — mobile only */}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleBack}
                aria-label="Back"
                className="lg:hidden shrink-0 -ml-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {activeParticipant && (
                <Avatar className="h-8 w-8 shrink-0 lg:hidden">
                  <AvatarImage src={activeParticipant.image} alt={activeParticipant.name} />
                  <AvatarFallback>{activeParticipant.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
              )}
              <CardTitle className="text-base font-semibold truncate">
                {activeParticipant?.name || 'Messages'}
              </CardTitle>
            </div>

            {/* Dropdown Menu for Deleting Thread */}
            {activeParticipant && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 z-50">
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteAlert(true)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2.5 pb-2.5 sm:px-6 sm:pb-4 flex flex-col flex-1 min-h-0">
        <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1 py-3 sm:py-4">
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
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderId === user?.uid ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  <p>{message.text}</p>
                  <p className={`mt-1 text-[10px] ${message.senderId === user?.uid ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {formatSocialDate(message.createdAt)}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div className="pt-1.5 sm:pt-2 border-t shrink-0">
          <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2 pt-1.5 sm:pt-2">
            <Input
              placeholder="Type your message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={!selectedParticipantId}
              className="min-w-0"
            />
            <Button size="icon" aria-label="Send message" type="submit" disabled={!selectedParticipantId || !draft.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full min-h-0 overflow-hidden">
      {/* Desktop: side-by-side. Mobile: one panel at a time */}
      <div className="h-full min-h-0">
        {/* Mobile layout */}
        <div className="lg:hidden h-full">
          {mobileView === 'list' ? ThreadList : ConversationPanel}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-[320px,1fr] gap-3 h-full">
          {ThreadList}
          {ConversationPanel}
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your conversation with {activeParticipant?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => void handleDeleteThread()} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
