import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReferralStatus =
  | 'pending'       // referred user created account but hasn't finished 4 steps
  | 'qualified'     // referred user completed all 4 profile steps → inviter earns ₦5,000

export interface Referral {
  id: string                  // referralId (= inviteeUid)
  inviterUid: string          // who sent the invite
  inviteeUid: string          // who signed up via the link
  inviteeDisplayName?: string
  status: ReferralStatus
  createdAt: Timestamp
  qualifiedAt?: Timestamp
}

// ─── Firestore Collection ─────────────────────────────────────────────────────

const referralsCollection = collection(db, 'referrals')

// ─── Create referral doc when invited person signs up ─────────────────────────

export async function createReferral(inviterRef: string, inviteeUid: string, inviteeDisplayName?: string) {
  // Anti-scam: don't create if same person
  if (inviterRef === inviteeUid) return

  let actualInviterUid = inviterRef

  try {
    const { getUserByUsername } = await import('@/services/userService')
    const user = await getUserByUsername(inviterRef)
    if (user?.userId || user?.id) {
      actualInviterUid = user.userId || user.id || inviterRef
    }
  } catch (e) {
    console.warn('Failed to resolve username for referral, falling back to raw ref', e)
  }

  // Anti-scam again with resolved UID
  if (actualInviterUid === inviteeUid) return

  const refDocRef = doc(db, 'referrals', inviteeUid)
  const existing = await getDoc(refDocRef)

  // One invitee can only credit one inviter (first-write wins)
  if (existing.exists()) return

  const referral: Omit<Referral, 'id'> = {
    inviterUid: actualInviterUid,
    inviteeUid,
    inviteeDisplayName: inviteeDisplayName || '',
    status: 'pending',
    createdAt: Timestamp.now(),
  }

  await setDoc(refDocRef, referral)

  // Also stamp the invitee's user doc so we know who referred them
  await updateDoc(doc(db, 'users', inviteeUid), {
    referredBy: actualInviterUid,
    updatedAt: Timestamp.now(),
  }).catch(() => {
    // user doc might not exist yet — register page writes it immediately after, so this is fine
  })
}

// ─── Get all referrals for a given inviter ─────────────────────────────────────

export async function getReferralsForUser(inviterUid: string): Promise<Referral[]> {
  try {
    const q = query(referralsCollection, where('inviterUid', '==', inviterUid))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral))
  } catch {
    return []
  }
}

// ─── Called whenever an invitee's profile steps change ────────────────────────
// Pass the invitee's uid + their current profile completion state.
// If they've finished all 4 steps, mark their referral as qualified.

export async function checkAndQualifyReferral(inviteeUid: string, profileComplete: boolean) {
  if (!profileComplete) return

  const refDocRef = doc(db, 'referrals', inviteeUid)
  const snap = await getDoc(refDocRef)

  if (!snap.exists()) return
  const referral = snap.data() as Referral

  if (referral.status === 'qualified') return // already done

  await updateDoc(refDocRef, {
    status: 'qualified',
    qualifiedAt: serverTimestamp(),
  })
}

// ─── Get a single user's referral record (as the invitee) ─────────────────────

export async function getMyReferralRecord(inviteeUid: string): Promise<Referral | null> {
  try {
    const snap = await getDoc(doc(db, 'referrals', inviteeUid))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Referral
  } catch {
    return null
  }
}
