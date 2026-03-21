import { Timestamp } from 'firebase/firestore';

export interface Community {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  image?: string;
  bannerImage?: string;
  category?: string;
  privacy: 'public' | 'private';
  memberCount: number;
  price?: number;
  currency?: string;
  isPaid?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Timestamp;
}
