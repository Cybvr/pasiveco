import { Bell, CreditCard, Megaphone, MessageSquare, CheckCircle2 } from 'lucide-react'

export const demoUserId = 'demo-user-1'

export const userMessages = [
  {
    id: 'm1',
    userId: demoUserId,
    name: 'Maya Thompson',
    avatar: 'https://i.pravatar.cc/100?img=32',
    preview: 'Can we lock in a sponsored reel for next Thursday?',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'm2',
    userId: demoUserId,
    name: 'Derek from HypeFuel',
    avatar: 'https://i.pravatar.cc/100?img=12',
    preview: 'Draft contract sent. Let me know if you want edits.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'm3',
    userId: demoUserId,
    name: 'Nina Patel',
    avatar: 'https://i.pravatar.cc/100?img=49',
    preview: 'Loved your latest post. Looking to collab in April.',
    time: 'Yesterday',
    unread: false,
  },
]

export const userThreadMessages = [
  { id: 'tm1', userId: demoUserId, fromMe: false, text: 'Hey! We are launching a new campaign next week.', at: '10:21 AM' },
  { id: 'tm2', userId: demoUserId, fromMe: true, text: 'Perfect timing. Send the creative brief and budget range.', at: '10:24 AM' },
  { id: 'tm3', userId: demoUserId, fromMe: false, text: 'Awesome. Budget is $1,500 for 1 reel + 3 stories.', at: '10:27 AM' },
]

export const userNotifications = [
  {
    id: 'n1',
    userId: demoUserId,
    icon: MessageSquare,
    title: 'New brand inquiry from Prism Labs',
    body: 'They requested your media kit and rates for a short-form campaign.',
    time: '5 minutes ago',
    status: 'new',
  },
  {
    id: 'n2',
    userId: demoUserId,
    icon: CreditCard,
    title: 'Payout completed',
    body: '$420.00 was transferred to your connected bank account.',
    time: '2 hours ago',
    status: 'done',
  },
  {
    id: 'n3',
    userId: demoUserId,
    icon: Megaphone,
    title: 'Campaign deadline reminder',
    body: 'Your deliverables for HypeFuel are due tomorrow at 5:00 PM.',
    time: 'Yesterday',
    status: 'new',
  },
  {
    id: 'n4',
    userId: demoUserId,
    icon: CheckCircle2,
    title: 'Profile update approved',
    body: 'Your updated bio and social links are now live on your page.',
    time: '2 days ago',
    status: 'done',
  },
]

export const userPosts = [
  {
    id: 'p1',
    userId: demoUserId,
    title: 'My Spring Creator Kit',
    summary: 'A quick walkthrough of the camera + lighting setup I use for short-form content.',
    status: 'Published',
    publishedAt: 'Mar 12, 2026',
  },
  {
    id: 'p2',
    userId: demoUserId,
    title: 'How I price UGC packages',
    summary: 'Behind-the-scenes on pricing tiers for brands and small businesses.',
    status: 'Draft',
    publishedAt: 'Draft',
  },
]

