import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { Community, CommunityMember } from '@/types/community';

const communitiesCollection = collection(db, 'communities');
const communityMembersCollection = collection(db, 'communityMembers');

export const createCommunity = async (communityData: Omit<Community, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>) => {
  try {
    const docRef = await addDoc(communitiesCollection, {
      ...communityData,
      memberCount: 1, // Creator is the first member
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Add creator as admin member
    await setDoc(doc(communityMembersCollection, `${docRef.id}_${communityData.creatorId}`), {
      communityId: docRef.id,
      userId: communityData.creatorId,
      role: 'admin',
      joinedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

export const getCommunity = async (communityId: string): Promise<Community | null> => {
  try {
    const docRef = doc(db, 'communities', communityId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Community;
    }
    return null;
  } catch (error) {
    console.error('Error fetching community:', error);
    throw error;
  }
};

export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const q = query(communitiesCollection, orderBy('memberCount', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
  } catch (error) {
    console.error('Error fetching all communities:', error);
    throw error;
  }
};

export const joinCommunity = async (communityId: string, userId: string) => {
  try {
    const memberId = `${communityId}_${userId}`;
    const memberRef = doc(communityMembersCollection, memberId);
    const communityRef = doc(db, 'communities', communityId);

    await runTransaction(db, async (transaction) => {
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists()) {
        throw new Error('User is already a member of this community');
      }

      transaction.set(memberRef, {
        communityId,
        userId,
        role: 'member',
        joinedAt: Timestamp.now(),
      });

      transaction.update(communityRef, {
        memberCount: increment(1),
        updatedAt: Timestamp.now(),
      });
    });
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

export const leaveCommunity = async (communityId: string, userId: string) => {
  try {
    const memberId = `${communityId}_${userId}`;
    const memberRef = doc(communityMembersCollection, memberId);
    const communityRef = doc(db, 'communities', communityId);

    await runTransaction(db, async (transaction) => {
      const memberDoc = await transaction.get(memberRef);
      if (!memberDoc.exists()) {
        throw new Error('User is not a member of this community');
      }

      transaction.delete(memberRef);

      transaction.update(communityRef, {
        memberCount: increment(-1),
        updatedAt: Timestamp.now(),
      });
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

export const isCommunityMember = async (communityId: string, userId: string): Promise<boolean> => {
  try {
    const memberId = `${communityId}_${userId}`;
    const docSnap = await getDoc(doc(communityMembersCollection, memberId));
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

export const getUserCommunities = async (userId: string): Promise<Community[]> => {
  try {
    const q = query(communityMembersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const communityIds = querySnapshot.docs.map(doc => doc.data().communityId);

    if (communityIds.length === 0) return [];

    // Fetch details for each community (Firestore IN query capped at 10 or 30 depending on version, here we can fetch individual or batch)
    const communities: Community[] = [];
    for (const id of communityIds) {
      const community = await getCommunity(id);
      if (community) communities.push(community);
    }
    return communities;
  } catch (error) {
    console.error('Error fetching user communities:', error);
    throw error;
  }
};
