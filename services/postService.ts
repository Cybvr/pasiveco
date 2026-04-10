import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  addDoc,
  doc,
  getDoc,
  limit,
  writeBatch
} from 'firebase/firestore';

export interface Post {
  id: string;
  authorId: string;
  communityId: string;
  message: string;
  createdAt: Timestamp;
  category: string;
  authorName?: string;
  authorUsername?: string;
  authorSlug?: string;
  authorImage?: string;
  parentId?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
}

const postsCollection = collection(db, 'posts');

/**
 * Fetches all posts for a specific community, ordered by newest first.
 */
export const getCommunityPosts = async (communityId: string): Promise<Post[]> => {
  try {
    const q = query(
      postsCollection,
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    for (const d of querySnapshot.docs) {
      const data = d.data();
      const post = { id: d.id, ...data } as Post;

      // If author metadata is missing, we could fetch it here from users collection
      // But for performance, it's better if the seeding agent includes it.
      if (!post.authorName || !post.authorImage) {
        try {
          const userDoc = await getDoc(doc(db, 'users', post.authorId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            post.authorName = userData.displayName;
            post.authorUsername = userData.username;
            post.authorSlug = userData.slug || userData.username;
            post.authorImage = userData.photoURL || userData.image;
          }
        } catch (err) {
          console.error(`Error fetching author data for post ${post.id}:`, err);
        }
      }
      
      posts.push(post);
    }

    return posts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

/**
 * Creates a new post in a community.
 */
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
  try {
    // Firebase does not allow undefined values in addDoc
    const sanitizedData = Object.fromEntries(
      Object.entries(postData).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(postsCollection, {
      ...sanitizedData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const batch = writeBatch(db);
    const postRef = doc(db, 'posts', postId);

    batch.delete(postRef);

    const repliesSnapshot = await getDocs(
      query(postsCollection, where('parentId', '==', postId))
    );

    repliesSnapshot.docs.forEach((replyDoc) => {
      batch.delete(replyDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Fetches recent posts from all communities a user has joined.
 */
export const getGlobalFeed = async (userId: string, limitCount: number = 20): Promise<Post[]> => {
  try {
    // 1. Get user's community memberships
    const membershipsSnap = await getDocs(
      query(collection(db, 'communityMembers'), where('userId', '==', userId))
    );
    const communityIds = membershipsSnap.docs.map(doc => doc.data().communityId);

    if (communityIds.length === 0) return [];

    // 2. Fetch posts from these communities
    // Firestore 'in' query supports up to 30 items.
    const chunks: string[][] = [];
    for (let i = 0; i < communityIds.length; i += 30) {
      chunks.push(communityIds.slice(i, i + 30));
    }

    let allPosts: Post[] = [];
    for (const chunk of chunks) {
      const q = query(
        postsCollection,
        where('communityId', 'in', chunk),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      allPosts = [...allPosts, ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))];
    }

    // Sort by date and limit
    return allPosts
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching global feed:', error);
    return [];
  }
};

/**
 * Counts comments (posts with parentId) from the last 3 days in all communities a user has joined.
 */
export const getRecentCommentsCount = async (userId: string, days: number = 3): Promise<number> => {
  try {
    // 1. Get user's community memberships
    const membershipsSnap = await getDocs(
      query(collection(db, 'communityMembers'), where('userId', '==', userId))
    );
    const communityIds = membershipsSnap.docs.map(doc => doc.data().communityId);

    if (communityIds.length === 0) return 0;

    // 2. Query posts from these communities in the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const timestamp = Timestamp.fromDate(startDate);

    let commentCount = 0;
    // Firestore 'in' query supports up to 30 items.
    const chunks: string[][] = [];
    for (let i = 0; i < communityIds.length; i += 30) {
      chunks.push(communityIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const q = query(
        postsCollection,
        where('communityId', 'in', chunk),
        where('createdAt', '>=', timestamp)
      );
      const snap = await getDocs(q);
      // Filter for comments (posts with parentId) in JS to stay efficient with indexes
      commentCount += snap.docs.filter(doc => doc.data().parentId).length;
    }

    return commentCount;
  } catch (error) {
    console.error('Error counting recent comments:', error);
    return 0;
  }
};

