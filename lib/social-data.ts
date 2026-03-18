import { discoverUsers } from '@/app/data/deluserData'
import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

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

export interface SocialThreadWithParticipant extends SocialThread {
  participant: SocialProfile
  lastMessage: SocialMessage
}

interface SocialPostDocument {
  authorId: string
  message: string
  createdAt: string
  category: string
  baseLikeCount: number
  likedByUserIds?: string[]
  comments?: SocialComment[]
}

interface SocialThreadDocument {
  participantId: string
  messages?: SocialMessage[]
}

const SOCIAL_META_COLLECTION = 'socialMeta'
const SOCIAL_META_DOCUMENT = 'default'
const SOCIAL_PROFILES_COLLECTION = 'socialProfiles'
const SOCIAL_POSTS_COLLECTION = 'socialPosts'
const SOCIAL_THREADS_COLLECTION = 'socialThreads'
const SOCIAL_SEED_VERSION = 1
const viewerProfileId = 'viewer-me'

const viewerProfile: SocialProfile = {
  id: viewerProfileId,
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
  'sofia-kim-post-1': { likeCount: 111, comments: [{ id: 'comment-3', authorId: viewerProfileId, authorName: 'You', authorHandle: '@you', authorImage: viewerProfile.image, message: 'Love lighter routines for everyday camera days.', createdAt: '2025-03-15T17:05:00.000Z' }] },
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
      { id: 'msg-c1-2', senderId: viewerProfileId, text: 'Yes, send your brief and deliverables.', createdAt: '2025-03-16T11:22:00.000Z' },
    ],
  },
  {
    id: 'thread-c5',
    participantId: 'c5',
    messages: [
      { id: 'msg-c5-1', senderId: 'c5', text: 'Your latest post would fit our cozy-home roundup.', createdAt: '2025-03-15T19:04:00.000Z' },
      { id: 'msg-c5-2', senderId: viewerProfileId, text: 'I am in. Happy to share a few images too.', createdAt: '2025-03-15T19:20:00.000Z' },
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

let seedPromise: Promise<void> | null = null

function profileCollection() {
  return collection(db, SOCIAL_PROFILES_COLLECTION)
}

function postsCollection() {
  return collection(db, SOCIAL_POSTS_COLLECTION)
}

function threadsCollection() {
  return collection(db, SOCIAL_THREADS_COLLECTION)
}

function socialMetaRef() {
  return doc(db, SOCIAL_META_COLLECTION, SOCIAL_META_DOCUMENT)
}

function normalizeComments(comments?: SocialComment[]) {
  return Array.isArray(comments)
    ? [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : []
}

function hydrateSocialPost(postId: string, data: SocialPostDocument, currentViewerId = viewerProfileId): SocialPost {
  const likedByUserIds = Array.isArray(data.likedByUserIds) ? data.likedByUserIds : []
  const comments = normalizeComments(data.comments)

  return {
    id: postId,
    authorId: data.authorId,
    message: data.message,
    createdAt: data.createdAt,
    category: data.category,
    likeCount: (data.baseLikeCount || 0) + likedByUserIds.length,
    commentCount: comments.length,
    likedByMe: likedByUserIds.includes(currentViewerId),
    comments,
  }
}

async function seedSocialData() {
  const metaSnapshot = await getDoc(socialMetaRef())
  if (metaSnapshot.exists() && metaSnapshot.data()?.seedVersion === SOCIAL_SEED_VERSION) {
    return
  }

  const batch = writeBatch(db)

  for (const profile of [viewerProfile, ...baseProfiles]) {
    batch.set(doc(db, SOCIAL_PROFILES_COLLECTION, profile.id), profile, { merge: true })
  }

  for (const profile of baseProfiles) {
    const sourceUser = discoverUsers.find((user) => user.id === profile.id)
    for (const post of sourceUser?.posts || []) {
      const meta = basePostMeta[post.id] || { likeCount: 0, comments: [] }
      batch.set(doc(db, SOCIAL_POSTS_COLLECTION, post.id), {
        authorId: profile.id,
        message: post.message,
        createdAt: post.createdAt,
        category: profile.category,
        baseLikeCount: meta.likeCount,
        likedByUserIds: [],
        comments: meta.comments,
      })
    }
  }

  for (const thread of baseThreads) {
    batch.set(doc(db, SOCIAL_THREADS_COLLECTION, thread.id), thread, { merge: true })
  }

  batch.set(socialMetaRef(), {
    seedVersion: SOCIAL_SEED_VERSION,
    seededAt: serverTimestamp(),
  }, { merge: true })

  await batch.commit()
}

export async function seedSocialDataIfNeeded() {
  if (!seedPromise) {
    seedPromise = seedSocialData().catch((error) => {
      seedPromise = null
      throw error
    })
  }

  return seedPromise
}

export async function getSocialProfiles() {
  await seedSocialDataIfNeeded()
  const snapshot = await getDocs(query(profileCollection(), orderBy('name', 'asc')))
  const profiles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as SocialProfile))
  const viewer = profiles.find((profile) => profile.id === viewerProfileId)
  const others = profiles.filter((profile) => profile.id !== viewerProfileId)
  return viewer ? [viewer, ...others] : others
}

export async function getSocialProfileById(profileId: string) {
  await seedSocialDataIfNeeded()
  const snapshot = await getDoc(doc(db, SOCIAL_PROFILES_COLLECTION, profileId))
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as SocialProfile) : undefined
}

export async function getSocialProfileByUsername(username: string) {
  const normalizedUsername = username.replace(/^@/, '')
  const profiles = await getSocialProfiles()
  return profiles.find((profile) => profile.username === normalizedUsername || profile.handle.replace(/^@/, '') === normalizedUsername)
}

export async function getSocialCategories() {
  const profiles = await getSocialProfiles()
  return Array.from(new Set(profiles.filter((profile) => profile.id !== viewerProfileId).map((profile) => profile.category)))
}

export async function createSocialPost(message: string, authorId: string) {
  await seedSocialDataIfNeeded()
  const author = await getSocialProfileById(authorId)
  const newPost: SocialPostDocument = {
    authorId,
    message,
    createdAt: new Date().toISOString(),
    category: author?.category || 'Creator',
    baseLikeCount: 0,
    likedByUserIds: [],
    comments: [],
  }

  const postId = `post-${Date.now()}`
  await setDoc(doc(db, SOCIAL_POSTS_COLLECTION, postId), newPost)
  return hydrateSocialPost(postId, newPost)
}

export async function getSocialPosts(currentViewerId = viewerProfileId) {
  await seedSocialDataIfNeeded()
  const snapshot = await getDocs(query(postsCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((item) => hydrateSocialPost(item.id, item.data() as SocialPostDocument, currentViewerId))
}

export async function getSocialPostById(postId: string, currentViewerId = viewerProfileId) {
  await seedSocialDataIfNeeded()
  const snapshot = await getDoc(doc(db, SOCIAL_POSTS_COLLECTION, postId))
  return snapshot.exists() ? hydrateSocialPost(snapshot.id, snapshot.data() as SocialPostDocument, currentViewerId) : undefined
}

export async function togglePostLike(postId: string, currentViewerId = viewerProfileId) {
  await seedSocialDataIfNeeded()

  return runTransaction(db, async (transaction) => {
    const postRef = doc(db, SOCIAL_POSTS_COLLECTION, postId)
    const snapshot = await transaction.get(postRef)

    if (!snapshot.exists()) {
      return undefined
    }

    const data = snapshot.data() as SocialPostDocument
    const likedByUserIds = Array.isArray(data.likedByUserIds) ? [...data.likedByUserIds] : []
    const currentIndex = likedByUserIds.indexOf(currentViewerId)

    if (currentIndex >= 0) {
      likedByUserIds.splice(currentIndex, 1)
    } else {
      likedByUserIds.push(currentViewerId)
    }

    transaction.update(postRef, { likedByUserIds })

    return hydrateSocialPost(snapshot.id, { ...data, likedByUserIds }, currentViewerId)
  })
}

export async function addPostComment(postId: string, message: string, authorId = viewerProfileId) {
  await seedSocialDataIfNeeded()
  const author = (await getSocialProfileById(authorId)) || viewerProfile

  return runTransaction(db, async (transaction) => {
    const postRef = doc(db, SOCIAL_POSTS_COLLECTION, postId)
    const snapshot = await transaction.get(postRef)

    if (!snapshot.exists()) {
      return undefined
    }

    const data = snapshot.data() as SocialPostDocument
    const nextComment: SocialComment = {
      id: `comment-${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      authorHandle: author.handle,
      authorImage: author.image,
      message,
      createdAt: new Date().toISOString(),
    }

    const comments = [...normalizeComments(data.comments), nextComment]
    transaction.update(postRef, { comments })

    return hydrateSocialPost(snapshot.id, { ...data, comments })
  })
}

export async function getMessageThreads(): Promise<SocialThreadWithParticipant[]> {
  await seedSocialDataIfNeeded()
  const [threadSnapshot, profiles] = await Promise.all([
    getDocs(threadsCollection()),
    getSocialProfiles(),
  ])
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))

  return threadSnapshot.docs
    .map<SocialThreadWithParticipant | null>((item) => {
      const data = item.data() as SocialThreadDocument
      const participant = profileMap.get(data.participantId)
      const messages = Array.isArray(data.messages)
        ? [...data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : []
      const lastMessage = messages[messages.length - 1]

      if (!participant || !lastMessage) {
        return null
      }

      return {
        id: item.id,
        participantId: data.participantId,
        participant,
        messages,
        lastMessage,
      }
    })
    .filter((thread): thread is SocialThreadWithParticipant => Boolean(thread))
    .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
}

export async function getThreadForProfile(profileId: string) {
  const threads = await getMessageThreads()
  return threads.find((thread) => thread?.participantId === profileId) || null
}

export async function sendMessage(profileId: string, text: string) {
  await seedSocialDataIfNeeded()
  const trimmedText = text.trim()
  if (!trimmedText) return getThreadForProfile(profileId)

  return runTransaction(db, async (transaction) => {
    const threadRef = doc(db, SOCIAL_THREADS_COLLECTION, `thread-${profileId}`)
    const snapshot = await transaction.get(threadRef)
    const data = snapshot.exists()
      ? (snapshot.data() as SocialThreadDocument)
      : { participantId: profileId, messages: [] }

    const nextMessage: SocialMessage = {
      id: `message-${Date.now()}`,
      senderId: viewerProfileId,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    }

    const messages = [...(Array.isArray(data.messages) ? data.messages : []), nextMessage]
    transaction.set(threadRef, {
      participantId: profileId,
      messages,
    }, { merge: true })

    return null
  }).then(() => getThreadForProfile(profileId))
}

export function formatSocialDate(dateValue: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en', options || {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}
