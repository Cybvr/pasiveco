import { Timestamp } from "firebase/firestore"

export interface PayoutRequest {
  id: string
  userId: string
  amount: number
  currency: string
  status: "pending" | "processing" | "paid" | "failed"
  bankName: string
  accountName: string
  accountNumber: string
  recipientCode?: string
  createdAt: Timestamp
  updatedAt?: Timestamp | null
}
