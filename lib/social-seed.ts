import { discoverUsers } from '@/app/data/deluserData'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import {
  SOCIAL_META_COLLECTION,
  SOCIAL_META_DOCUMENT,
  SOCIAL_POSTS_COLLECTION,
  SOCIAL_PROFILES_COLLECTION,
  SOCIAL_SEED_VERSION,
  SOCIAL_THREADS_COLLECTION,
  viewerProfileId,
} from '@/lib/social-constants'
import type {
  SocialComment,
  SocialProfile,
  SocialThread,
} from '@/lib/social-types'

export const viewerProfile: SocialProfile = {
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

function socialMetaRef() {
  return doc(db, SOCIAL_META_COLLECTION, SOCIAL_META_DOCUMENT)
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
