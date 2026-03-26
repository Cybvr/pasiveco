import { db } from "@/lib/firebase"
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore"
import { PayoutRequest } from "@/types/payout"

type NewPayoutRequest = Omit<PayoutRequest, "id" | "createdAt" | "updatedAt">

export const createPayoutRequest = async (payload: NewPayoutRequest) => {
  const docRef = await addDoc(collection(db, "payoutRequests"), {
    ...payload,
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

export const getUserPayoutRequests = async (userId: string): Promise<PayoutRequest[]> => {
  const payoutQuery = query(
    collection(db, "payoutRequests"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(payoutQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PayoutRequest[]
}

export const getPayoutRequestById = async (id: string): Promise<PayoutRequest | null> => {
  const snapshot = await getDoc(doc(db, "payoutRequests", id))

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as PayoutRequest
}
