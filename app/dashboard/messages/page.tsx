'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Send } from 'lucide-react'

const inbox = [
  { id: 'm1', name: 'Maya Thompson', avatar: 'https://i.pravatar.cc/100?img=32', preview: 'Can we lock in a sponsored reel for next Thursday?', time: '2m ago', unread: true },
  { id: 'm2', name: 'Derek from HypeFuel', avatar: 'https://i.pravatar.cc/100?img=12', preview: 'Draft contract sent. Let me know if you want edits.', time: '1h ago', unread: true },
  { id: 'm3', name: 'Nina Patel', avatar: 'https://i.pravatar.cc/100?img=49', preview: 'Loved your latest post. Looking to collab in April.', time: 'Yesterday', unread: false },
]

const activeThread = [
  { fromMe: false, text: 'Hey! We are launching a new campaign next week.', at: '10:21 AM' },
  { fromMe: true, text: 'Perfect timing. Send the creative brief and budget range.', at: '10:24 AM' },
  { fromMe: false, text: 'Awesome. Budget is $1,500 for 1 reel + 3 stories.', at: '10:27 AM' },
]

export default function MessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Messages</h2>
        <p className="text-sm text-muted-foreground">Manage brand conversations and creator collabs in one place.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inbox</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search messages" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {inbox.map((chat) => (
              <button key={chat.id} className="flex w-full items-start gap-3 rounded-lg border p-3 text-left hover:bg-accent/40">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{chat.preview}</p>
                </div>
                {chat.unread && <Badge variant="default">New</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maya Thompson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeThread.map((message, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.fromMe ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{message.text}</p>
                <p className={`mt-1 text-[10px] ${message.fromMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{message.at}</p>
              </div>
            ))}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <Input placeholder="Type your message..." />
                <Button size="icon" aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
