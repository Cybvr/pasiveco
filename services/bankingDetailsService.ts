import { db } from '@/lib/firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export interface BankingDetails {
  bankName: string
  accountName: string
  accountNumber: string
  recipientCode?: string
  updatedAt?: unknown
}

const normalizeValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const hasBankingDetails = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const details = value as Partial<BankingDetails>
  return Boolean(
    normalizeValue(details.bankName) &&
    normalizeValue(details.accountName) &&
    normalizeValue(details.accountNumber)
  )
}

export const getBankingDetails = async (userId: string): Promise<BankingDetails | null> => {
  const userRef = doc(db, 'users', userId)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  const nestedDetails = data?.bankingDetails

  if (hasBankingDetails(nestedDetails)) {
    return {
      bankName: normalizeValue(nestedDetails.bankName),
      accountName: normalizeValue(nestedDetails.accountName),
      accountNumber: normalizeValue(nestedDetails.accountNumber),
      recipientCode: normalizeValue(nestedDetails.recipientCode) || undefined,
      updatedAt: nestedDetails.updatedAt,
    }
  }

  if (hasBankingDetails(data)) {
    return {
      bankName: normalizeValue(data.bankName),
      accountName: normalizeValue(data.accountName),
      accountNumber: normalizeValue(data.accountNumber),
      recipientCode: normalizeValue(data.recipientCode) || undefined,
      updatedAt: data.updatedAt,
    }
  }

  return null
}

export const saveBankingDetails = async (userId: string, details: BankingDetails) => {
  const userRef = doc(db, 'users', userId)
  const normalizedDetails = {
    bankName: normalizeValue(details.bankName),
    accountName: normalizeValue(details.accountName),
    accountNumber: normalizeValue(details.accountNumber),
    ...(details.recipientCode ? { recipientCode: normalizeValue(details.recipientCode) } : {}),
  }

  await setDoc(userRef, {
    bankingDetails: {
      ...normalizedDetails,
      updatedAt: serverTimestamp(),
    },
    bankName: normalizedDetails.bankName,
    accountName: normalizedDetails.accountName,
    accountNumber: normalizedDetails.accountNumber,
    ...(normalizedDetails.recipientCode ? { recipientCode: normalizedDetails.recipientCode } : {}),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
