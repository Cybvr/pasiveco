import { discoverUsers } from '@/app/data/deluserData'

export interface SocialLinkItem {
  id: string
  title: string
  url: string
  description: string
}

export interface SocialProductItem {
  id: string
  name: string
  price: string
  description: string
  url: string
}

export interface SocialComment {
  id: string
  authorId: string
  authorName: string
  authorHandle: string
  authorImage: string
  message: string
  createdAt: string
}

export interface SocialPost {
  id: string
  authorId: string
  message: string
  createdAt: string
  category: string
  likeCount: number
  commentCount: number
  likedByMe: boolean
  comments: SocialComment[]
}

export interface SocialProfile {
  id: string
  name: string
  handle: string
  username: string
  image: string
  category: string
  bio: string
  location: string
  links: SocialLinkItem[]
  shop: SocialProductItem[]
}

export interface SocialMessage {
  id: string
  senderId: string
  text: string
  createdAt: string
}

export interface SocialThread {
  id: string
  participantId: string
  messages: SocialMessage[]
}

const viewerProfile: SocialProfile = {
  id: 'viewer-me',
  name: 'You',
  handle: '@you',
  username: 'you',
  image: 'https://i.pravatar.cc/200?img=12',
  category: 'Creator',
  bio: 'Building community, sharing ideas, and turning attention into income.',
  location: 'Remote',
  links: [
    {
      id: 'viewer-link-1',
      title: 'Creator newsletter',
      url: 'https://example.com/newsletter',
      description: 'Weekly notes on content, growth, and monetization.',
    },
  ],
  shop: [
    {
      id: 'viewer-shop-1',
      name: 'Creator playbook',
      price: '$29',
      description: 'Templates and workflows for planning a month of content.',
      url: 'https://example.com/playbook',
    },
  ],
}

const profileDetails: Record<string, Omit<SocialProfile, 'id' | 'name' | 'handle' | 'username' | 'image' | 'category'>> = {
  c1: {
    bio: 'Editorial stylist sharing campaign notes, outfit formulas, and creative direction.',
    location: 'Shanghai, China',
    links: [
      { id: 'c1-link-1', title: 'Spring capsule guide', url: 'https://example.com/linxia/capsule', description: 'My minimalist wardrobe staples for every week.' },
      { id: 'c1-link-2', title: 'Brand portfolio', url: 'https://example.com/linxia/portfolio', description: 'Recent campaigns and styling work.' },
    ],
    shop: [
      { id: 'c1-shop-1', name: 'Styling consult', price: '$120', description: '45-minute wardrobe strategy session.', url: 'https://example.com/linxia/consult' },
    ],
  },
  c2: {
    bio: 'Coach focused on strength, consistency, and sustainable fitness routines.',
    location: 'Lagos, Nigeria',
    links: [
      { id: 'c2-link-1', title: '7-day push plan', url: 'https://example.com/amara/push-plan', description: 'Free training split to build upper-body strength.' },
    ],
    shop: [
      { id: 'c2-shop-1', name: 'Mobility program', price: '$35', description: 'Daily warmup and recovery guide.', url: 'https://example.com/amara/mobility' },
    ],
  },
  c3: {
    bio: 'Beauty creator testing everyday routines, camera-friendly products, and glow combos.',
    location: 'Madrid, Spain',
    links: [
      { id: 'c3-link-1', title: 'Routine breakdown', url: 'https://example.com/sofia/routine', description: 'Current skincare and makeup stack.' },
    ],
    shop: [
      { id: 'c3-shop-1', name: 'Makeup bag edit', price: '$22', description: 'Shoppable list of my weekly essentials.', url: 'https://example.com/sofia/bag' },
    ],
  },
  c4: {
    bio: 'Tech reviewer helping creators choose practical tools, setups, and workflows.',
    location: 'Oslo, Norway',
    links: [
      { id: 'c4-link-1', title: 'Creator setup notes', url: 'https://example.com/ingrid/setup', description: 'Audio, camera, and desk gear recommendations.' },
    ],
    shop: [
      { id: 'c4-shop-1', name: 'Audio buyer guide', price: '$18', description: 'Best creator microphones under every budget.', url: 'https://example.com/ingrid/audio' },
    ],
  },
  c5: {
    bio: 'Lifestyle storyteller sharing homemaking resets, routines, and slower living ideas.',
    location: 'Mumbai, India',
    links: [
      { id: 'c5-link-1', title: 'Sunday reset checklist', url: 'https://example.com/ananya/reset', description: 'The exact system I use to get back on track.' },
    ],
    shop: [
      { id: 'c5-shop-1', name: 'Habit tracker pack', price: '$12', description: 'Printable and digital routines for everyday life.', url: 'https://example.com/ananya/tracker' },
    ],
  },
  c6: {
    bio: 'Travel creator documenting slow trips, practical itineraries, and smarter planning.',
    location: 'Nairobi, Kenya',
    links: [
      { id: 'c6-link-1', title: 'Kyoto sunrise spots', url: 'https://example.com/chinedu/kyoto', description: 'My favorite quiet early-morning travel stops.' },
    ],
    shop: [
      { id: 'c6-shop-1', name: 'Carry-on planner', price: '$15', description: 'Simple trip planning sheets for frequent travel.', url: 'https://example.com/chinedu/planner' },
    ],
  },
}

const baseProfiles: SocialProfile[] = discoverUsers.map((user) => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  username: user.handle.replace(/^@/, ''),
  image: user.image,
  category: user.niche,
  bio: profileDetails[user.id]?.bio || `${user.niche} creator`,
  location: profileDetails[user.id]?.location || 'Remote',
  links: profileDetails[user.id]?.links || [],
  shop: profileDetails[user.id]?.shop || [],
}))

const basePostMeta: Record<string, { likeCount: number; comments: SocialComment[] }> = {
  'ava-brooks-post-1': { likeCount: 124, comments: [{ id: 'comment-1', authorId: 'c4', authorName: 'Ingrid Solberg', authorHandle: '@ingridsolberg', authorImage: 'https://i.pravatar.cc/200?img=18', message: 'The soft denim note is exactly what brands keep asking for right now.', createdAt: '2025-03-16T10:30:00.000Z' }] },
  'ava-brooks-post-2': { likeCount: 86, comments: [] },
  'jordan-lee-post-1': { likeCount: 98, comments: [{ id: 'comment-2', authorId: 'c5', authorName: 'Ananya Patel', authorHandle: '@ananyadaily', authorImage: 'https://i.pravatar.cc/200?img=32', message: 'Volume and consistency is the whole formula honestly.', createdAt: '2025-03-16T08:45:00.000Z' }] },
  'jordan-lee-post-2': { likeCount: 72, comments: [] },
  'sofia-kim-post-1': { likeCount: 111, comments: [{ id: 'comment-3', authorId: 'viewer-me', authorName: 'You', authorHandle: '@you', authorImage: viewerProfile.image, message: 'Love lighter routines for everyday camera days.', createdAt: '2025-03-15T17:05:00.000Z' }] },
  'sofia-kim-post-2': { likeCount: 91, comments: [] },
  'marcus-hill-post-1': { likeCount: 77, comments: [] },
  'marcus-hill-post-2': { likeCount: 68, comments: [] },
  'emily-stone-post-1': { likeCount: 120, comments: [] },
  'emily-stone-post-2': { likeCount: 84, comments: [] },
  'noah-park-post-1': { likeCount: 105, comments: [{ id: 'comment-4', authorId: 'c1', authorName: 'Lin Xia', authorHandle: '@linxia', authorImage: 'https://i.pravatar.cc/200?img=5', message: 'That sounds like the perfect train ride.', createdAt: '2025-03-13T08:10:00.000Z' }] },
  'noah-park-post-2': { likeCount: 66, comments: [] },
}

const baseThreads: SocialThread[] = [
  {
    id: 'thread-c1',
    participantId: 'c1',
    messages: [
      { id: 'msg-c1-1', senderId: 'c1', text: 'Want to swap creator rates for a spring campaign?', createdAt: '2025-03-16T11:18:00.000Z' },
      { id: 'msg-c1-2', senderId: 'viewer-me', text: 'Yes, send your brief and deliverables.', createdAt: '2025-03-16T11:22:00.000Z' },
    ],
  },
  {
    id: 'thread-c5',
    participantId: 'c5',
    messages: [
      { id: 'msg-c5-1', senderId: 'c5', text: 'Your latest post would fit our cozy-home roundup.', createdAt: '2025-03-15T19:04:00.000Z' },
      { id: 'msg-c5-2', senderId: 'viewer-me', text: 'I am in. Happy to share a few images too.', createdAt: '2025-03-15T19:20:00.000Z' },
    ],
  },
  {
    id: 'thread-c6',
    participantId: 'c6',
    messages: [
      { id: 'msg-c6-1', senderId: 'c6', text: 'I have a Japan rail itinerary template if you want it.', createdAt: '2025-03-14T07:42:00.000Z' },
    ],
  },
]

const customPostsStorageKey = 'pasiveco-social-posts'
const socialStateStorageKey = 'pasiveco-social-state'

interface SocialState {
  likesByPostId: Record<string, boolean>
  commentsByPostId: Record<string, SocialComment[]>
  threadsByParticipantId: Record<string, SocialMessage[]>
}

function getState(): SocialState {
  if (typeof window === 'undefined') {
    return { likesByPostId: {}, commentsByPostId: {}, threadsByParticipantId: {} }
  }

  try {
    const stored = window.localStorage.getItem(socialStateStorageKey)
    if (!stored) return { likesByPostId: {}, commentsByPostId: {}, threadsByParticipantId: {} }
    return { likesByPostId: {}, commentsByPostId: {}, threadsByParticipantId: {}, ...JSON.parse(stored) }
  } catch {
    return { likesByPostId: {}, commentsByPostId: {}, threadsByParticipantId: {} }
  }
}

function saveState(state: SocialState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(socialStateStorageKey, JSON.stringify(state))
}

export function getSocialProfiles() {
  return [viewerProfile, ...baseProfiles]
}

export function getSocialProfileById(profileId: string) {
  return getSocialProfiles().find((profile) => profile.id === profileId)
}

export function getSocialProfileByUsername(username: string) {
  return getSocialProfiles().find((profile) => profile.username === username || profile.handle.replace(/^@/, '') === username)
}

export function getSocialCategories() {
  return Array.from(new Set(baseProfiles.map((profile) => profile.category)))
}

function getCustomPosts(): Array<Omit<SocialPost, 'likeCount' | 'commentCount' | 'likedByMe' | 'comments'>> {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(customPostsStorageKey)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function createSocialPost(message: string, authorId: string) {
  const newPost = {
    id: `post-${Date.now()}`,
    authorId,
    message,
    createdAt: new Date().toISOString(),
    category: getSocialProfileById(authorId)?.category || 'Creator',
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(customPostsStorageKey, JSON.stringify([newPost, ...getCustomPosts()]))
  }

  return newPost
}

export function getSocialPosts() {
  const state = getState()
  const basePosts = baseProfiles.flatMap((profile) => {
    const sourceUser = discoverUsers.find((user) => user.id === profile.id)
    return (sourceUser?.posts || []).map((post) => {
      const meta = basePostMeta[post.id] || { likeCount: 0, comments: [] }
      const extraComments = state.commentsByPostId[post.id] || []
      const likedByMe = Boolean(state.likesByPostId[post.id])
      const comments = [...meta.comments, ...extraComments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )

      return {
        id: post.id,
        authorId: profile.id,
        message: post.message,
        createdAt: post.createdAt,
        category: profile.category,
        likeCount: meta.likeCount + (likedByMe ? 1 : 0),
        commentCount: comments.length,
        likedByMe,
        comments,
      }
    })
  })

  const customPosts = getCustomPosts().map((post) => {
    const comments = state.commentsByPostId[post.id] || []
    const likedByMe = Boolean(state.likesByPostId[post.id])
    return {
      ...post,
      likeCount: likedByMe ? 1 : 0,
      commentCount: comments.length,
      likedByMe,
      comments,
    }
  })

  return [...customPosts, ...basePosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getSocialPostById(postId: string) {
  return getSocialPosts().find((post) => post.id === postId)
}

export function togglePostLike(postId: string) {
  const state = getState()
  state.likesByPostId[postId] = !state.likesByPostId[postId]
  saveState(state)
  return getSocialPostById(postId)
}

export function addPostComment(postId: string, message: string, authorId = viewerProfile.id) {
  const author = getSocialProfileById(authorId) || viewerProfile
  const state = getState()
  const nextComment: SocialComment = {
    id: `comment-${Date.now()}`,
    authorId: author.id,
    authorName: author.name,
    authorHandle: author.handle,
    authorImage: author.image,
    message,
    createdAt: new Date().toISOString(),
  }

  state.commentsByPostId[postId] = [...(state.commentsByPostId[postId] || []), nextComment]
  saveState(state)
  return getSocialPostById(postId)
}

export function getMessageThreads() {
  const state = getState()

  return baseThreads
    .map((thread) => {
      const participant = getSocialProfileById(thread.participantId)
      const storedMessages = state.threadsByParticipantId[thread.participantId] || []
      const messages = [...thread.messages, ...storedMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      const lastMessage = messages[messages.length - 1]

      return participant
        ? {
            ...thread,
            participant,
            messages,
            lastMessage,
          }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.lastMessage.createdAt).getTime() - new Date(a!.lastMessage.createdAt).getTime())
}

export function getThreadForProfile(profileId: string) {
  return getMessageThreads().find((thread) => thread?.participantId === profileId) || null
}

export function sendMessage(profileId: string, text: string) {
  const trimmedText = text.trim()
  if (!trimmedText) return getThreadForProfile(profileId)

  const state = getState()
  const nextMessage: SocialMessage = {
    id: `message-${Date.now()}`,
    senderId: viewerProfile.id,
    text: trimmedText,
    createdAt: new Date().toISOString(),
  }

  state.threadsByParticipantId[profileId] = [...(state.threadsByParticipantId[profileId] || []), nextMessage]
  saveState(state)
  return getThreadForProfile(profileId)
}

export function formatSocialDate(dateValue: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en', options || {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}
