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
  hasUnread?: boolean
  unreadCount?: number
}

export interface SocialThreadWithParticipant extends SocialThread {
  participant: SocialProfile
  lastMessage: SocialMessage
}

export interface SocialPostDocument {
  authorId: string
  message: string
  createdAt: string
  category: string
  baseLikeCount: number
  likedByUserIds?: string[]
  comments?: SocialComment[]
}
