import { discoverUsers } from '@/app/data/deluserData'

export interface FeedPost {
  id: string
  message: string
  createdAt: string
  author: {
    id: string
    name: string
    handle: string
    image: string
    niche?: string
  }
  source: 'discover' | 'custom'
}

export interface NewFeedPostAuthor {
  id: string
  name: string
  handle: string
  image: string
}

const customPostsStorageKey = 'dashboard-feed-posts'

export const staticFeedPosts: FeedPost[] = discoverUsers
  .flatMap((user) =>
    user.posts.map((post) => ({
      id: post.id,
      message: post.message,
      createdAt: post.createdAt,
      author: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        image: user.image,
        niche: user.niche,
      },
      source: 'discover' as const,
    })),
  )
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export function getCustomFeedPosts(): FeedPost[] {
  if (typeof window === 'undefined') return []

  try {
    const storedPosts = window.localStorage.getItem(customPostsStorageKey)

    if (!storedPosts) return []

    const parsedPosts = JSON.parse(storedPosts) as FeedPost[]

    return Array.isArray(parsedPosts) ? parsedPosts : []
  } catch (error) {
    console.error('Error reading custom feed posts:', error)
    return []
  }
}

export function getAllFeedPosts(): FeedPost[] {
  return [...getCustomFeedPosts(), ...staticFeedPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getFeedPostById(postId: string): FeedPost | undefined {
  return getAllFeedPosts().find((post) => post.id === postId)
}

export function createCustomFeedPost(message: string, author: NewFeedPostAuthor): FeedPost {
  const newPost: FeedPost = {
    id: `post-${Date.now()}`,
    message,
    createdAt: new Date().toISOString(),
    author,
    source: 'custom',
  }

  if (typeof window !== 'undefined') {
    const nextPosts = [newPost, ...getCustomFeedPosts()]
    window.localStorage.setItem(customPostsStorageKey, JSON.stringify(nextPosts))
  }

  return newPost
}

export function formatFeedPostDate(dateValue: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue))
}
