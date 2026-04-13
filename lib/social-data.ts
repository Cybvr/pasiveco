import { getDisplayAvatar } from '@/lib/avatar'
import { getUser } from '@/services/userService'
import { db } from '@/lib/firebase'
import {
  SOCIAL_MESSAGES_SUBCOLLECTION,
  SOCIAL_POSTS_COLLECTION,
  SOCIAL_PROFILES_COLLECTION,
  SOCIAL_THREADS_COLLECTION,
  viewerProfileId,
} from '@/lib/social-constants'
import { seedSocialDataIfNeeded, viewerProfile } from '@/lib/social-seed'
import type {
  SocialComment,
  SocialMessage,
  SocialPost,
  SocialPostDocument,
  SocialProfile,
  SocialThreadWithParticipant,
} from '@/lib/social-types'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
export type {
  SocialComment,
  SocialLinkItem,
  SocialMessage,
  SocialPost,
  SocialProductItem,
  SocialProfile,
  SocialThread,
  SocialThreadWithParticipant,
} from '@/lib/social-types'

function profileCollection() {
  return collection(db, SOCIAL_PROFILES_COLLECTION)
}

function postsCollection() {
  return collection(db, SOCIAL_POSTS_COLLECTION)
}

function threadsCollection() {
  return collection(db, SOCIAL_THREADS_COLLECTION)
}

function messagesCollection(threadId: string) {
  return collection(db, SOCIAL_THREADS_COLLECTION, threadId, SOCIAL_MESSAGES_SUBCOLLECTION)
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

async function ensureAuthorProfile(authorId: string) {
  const existingProfile = await getSocialProfileById(authorId)
  if (existingProfile) {
    return existingProfile
  }

  const appUser = await getUser(authorId)
  if (!appUser) {
    return null
  }

  const username = (appUser.username || appUser.slug || appUser.email.split('@')[0] || authorId).replace(/^@/, '').trim()
  const profile: SocialProfile = {
    id: authorId,
    name: appUser.displayName || username || 'You',
    handle: `@${username || 'you'}`,
    username: username || 'you',
    image: getDisplayAvatar({
      image: appUser.profilePicture || appUser.photoURL || '',
      displayName: appUser.displayName || username || 'You',
      handle: username || authorId,
    }),
    category: appUser.category || 'Creator',
    bio: appUser.bio || 'Sharing updates with the community.',
    location: 'Remote',
    links: [],
    shop: [],
  }

  await setDoc(doc(db, SOCIAL_PROFILES_COLLECTION, profile.id), profile, { merge: true })
  return profile
}

export async function createSocialPost(message: string, authorId: string) {
  await seedSocialDataIfNeeded()
  const author = await ensureAuthorProfile(authorId)
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
  return hydrateSocialPost(postId, newPost, authorId)
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

export function getThreadId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_')
}

export async function getMessageThreads(currentUserId: string): Promise<SocialThreadWithParticipant[]> {
  await seedSocialDataIfNeeded()
  const q = query(
    threadsCollection(),
    where('participants', 'array-contains', currentUserId),
    orderBy('updatedAt', 'desc')
  )
  const threadSnapshot = await getDocs(q)
  const profiles = await getSocialProfiles()
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))

  const hydratedThreads = await Promise.all(
    threadSnapshot.docs.map(async (item) => {
      const data = item.data()
      const participantId = data.participants.find((id: string) => id !== currentUserId)
      if (!participantId) {
        return null
      }

      let participant = profileMap.get(participantId)
      if (!participant) {
        participant = await ensureAuthorProfile(participantId) || undefined
        if (participant) {
          profileMap.set(participantId, participant)
        }
      }
      
      if (!participant || !data.lastMessage) {
        return null
      }

      return {
        id: item.id,
        participantId: participantId,
        participant,
        messages: [],
        lastMessage: {
          ...data.lastMessage,
          createdAt: data.lastMessage.createdAt?.toDate?.()?.toISOString() || data.lastMessage.createdAt
        },
        hasUnread: Array.isArray(data.unreadParticipants) && data.unreadParticipants.includes(currentUserId),
        unreadCount:
          typeof data.unreadMessageCounts?.[currentUserId] === 'number'
            ? data.unreadMessageCounts[currentUserId]
            : Array.isArray(data.unreadParticipants) && data.unreadParticipants.includes(currentUserId)
              ? 1
              : 0
      } as any
    })
  )

  return hydratedThreads.filter((thread): thread is SocialThreadWithParticipant => Boolean(thread))
}

export function onMessageThreadsSnapshot(
  currentUserId: string,
  callback: (threads: SocialThreadWithParticipant[]) => void
) {
  let isActive = true
  let unsubscribeProfiles: (() => void) | null = null

  void seedSocialDataIfNeeded().then(() => {
    if (!isActive) return

    const q = query(
      threadsCollection(),
      where('participants', 'array-contains', currentUserId),
      orderBy('updatedAt', 'desc')
    )

    unsubscribeProfiles = onSnapshot(q, async (snapshot) => {
      const profiles = await getSocialProfiles()
      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))

      const hydratedThreads = await Promise.all(
        snapshot.docs.map(async (item) => {
          const data = item.data()
          const participantId = data.participants.find((id: string) => id !== currentUserId)
          if (!participantId) {
            return null
          }

          let participant = profileMap.get(participantId)
          if (!participant) {
            participant = await ensureAuthorProfile(participantId) || undefined
            if (participant) {
              profileMap.set(participantId, participant)
            }
          }

          if (!participant || !data.lastMessage) {
            return null
          }

          return {
            id: item.id,
            participantId,
            participant,
            messages: [],
            lastMessage: {
              ...data.lastMessage,
              createdAt: data.lastMessage.createdAt?.toDate?.()?.toISOString() || data.lastMessage.createdAt
            },
            hasUnread: Array.isArray(data.unreadParticipants) && data.unreadParticipants.includes(currentUserId),
            unreadCount:
              typeof data.unreadMessageCounts?.[currentUserId] === 'number'
                ? data.unreadMessageCounts[currentUserId]
                : Array.isArray(data.unreadParticipants) && data.unreadParticipants.includes(currentUserId)
                  ? 1
                  : 0
          } as SocialThreadWithParticipant
        })
      )

      callback(hydratedThreads.filter((thread): thread is SocialThreadWithParticipant => Boolean(thread)))
    }, (error) => {
      console.error('[onMessageThreadsSnapshot] Firestore listener error. If this is an index error, deploy firestore.indexes.json:', error)
      callback([])
    })
  })

  return () => {
    isActive = false
    unsubscribeProfiles?.()
  }
}

export function onUnreadCountSnapshot(userId: string, callback: (count: number) => void) {
  const q = query(
    threadsCollection(),
    where('participants', 'array-contains', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const unreadCount = snapshot.docs.reduce((count, threadDoc) => {
      const data = threadDoc.data()
      if (typeof data.unreadMessageCounts?.[userId] === 'number') {
        return count + data.unreadMessageCounts[userId]
      }

      return Array.isArray(data.unreadParticipants) && data.unreadParticipants.includes(userId)
        ? count + 1
        : count
    }, 0)

    callback(unreadCount)
  })
}

export async function markThreadAsRead(threadId: string, userId: string) {
  const threadRef = doc(threadsCollection(), threadId)
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(threadRef)
    if (!snapshot.exists()) return
    
    const data = snapshot.data()
    const unreadParticipants = Array.isArray(data.unreadParticipants) ? [...data.unreadParticipants] : []
    const unreadMessageCounts = data.unreadMessageCounts && typeof data.unreadMessageCounts === 'object'
      ? { ...data.unreadMessageCounts }
      : {}
    const index = unreadParticipants.indexOf(userId)
    
    if (index >= 0) {
      unreadParticipants.splice(index, 1)
    }

    unreadMessageCounts[userId] = 0
    transaction.update(threadRef, { unreadParticipants, unreadMessageCounts })
  })
}

export async function getThreadMessages(threadId: string) {
  const q = query(messagesCollection(threadId), orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
  } as SocialMessage))
}

export function onMessagesSnapshot(threadId: string, callback: (messages: SocialMessage[]) => void) {
  const q = query(messagesCollection(threadId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    } as SocialMessage))
    callback(messages)
  })
}

export async function sendMessage(senderId: string, receiverId: string, text: string) {
  const trimmedText = text.trim()
  if (!trimmedText) return
  
  const threadId = getThreadId(senderId, receiverId)
  const threadRef = doc(threadsCollection(), threadId)
  const msgRef = doc(messagesCollection(threadId))

  await runTransaction(db, async (transaction) => {
    const threadSnapshot = await transaction.get(threadRef)
    const threadData = threadSnapshot.exists() ? threadSnapshot.data() : {}
    const unreadParticipants = Array.isArray(threadData.unreadParticipants)
      ? [...threadData.unreadParticipants]
      : []
    const unreadMessageCounts = threadData.unreadMessageCounts && typeof threadData.unreadMessageCounts === 'object'
      ? { ...threadData.unreadMessageCounts }
      : {}

    if (!unreadParticipants.includes(receiverId)) {
      unreadParticipants.push(receiverId)
    }

    const currentUnreadCount =
      typeof unreadMessageCounts[receiverId] === 'number'
        ? unreadMessageCounts[receiverId]
        : unreadParticipants.includes(receiverId)
          ? 1
          : 0
    const nextUnreadCount = currentUnreadCount + 1
    unreadMessageCounts[receiverId] = nextUnreadCount

    const now = serverTimestamp()
    const messageData = {
      senderId,
      text: trimmedText,
      createdAt: now,
    }

    transaction.set(msgRef, messageData)
    transaction.set(threadRef, {
      participants: [senderId, receiverId],
      lastMessage: {
        ...messageData,
        id: msgRef.id
      },
      updatedAt: now,
      unreadParticipants,
      unreadMessageCounts,
    }, { merge: true })
  })
}

export async function deleteThread(threadId: string) {
  const msgSnapshot = await getDocs(messagesCollection(threadId))
  const batch = writeBatch(db)
  
  msgSnapshot.docs.forEach((item) => {
    batch.delete(item.ref)
  })
  
  batch.delete(doc(threadsCollection(), threadId))
  await batch.commit()
}

export function formatSocialDate(dateValue: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en', options || {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

export function formatSocialRelativeTime(dateValue: string) {
  const target = new Date(dateValue)
  const now = new Date()

  if (Number.isNaN(target.getTime())) {
    return ''
  }

  const diffInSeconds = Math.round((target.getTime() - now.getTime()) / 1000)
  const absSeconds = Math.abs(diffInSeconds)

  if (absSeconds < 30) {
    return 'now'
  }

  if (absSeconds < 60) {
    return diffInSeconds < 0 ? `${absSeconds}s ago` : `in ${absSeconds}s`
  }

  const thresholds = [
    { limit: 60 * 60, unit: 'minute', seconds: 60 },
    { limit: 60 * 60 * 24, unit: 'hour', seconds: 60 * 60 },
    { limit: 60 * 60 * 24 * 7, unit: 'day', seconds: 60 * 60 * 24 },
    { limit: 60 * 60 * 24 * 30, unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { limit: 60 * 60 * 24 * 365, unit: 'month', seconds: 60 * 60 * 24 * 30 },
  ] as const

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const threshold of thresholds) {
    if (absSeconds < threshold.limit) {
      return formatter.format(Math.round(diffInSeconds / threshold.seconds), threshold.unit)
    }
  }

  return formatter.format(Math.round(diffInSeconds / (60 * 60 * 24 * 365)), 'year')
}
