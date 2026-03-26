import { db } from '@/lib/firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export interface BankingDetails {
  id?: string
  bankName: string
  bankCode?: string
  accountName: string
  accountNumber: string
  recipientCode?: string
  isDefault?: boolean
  updatedAt?: any
}

const normalizeValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getPayoutAccounts = async (userId: string): Promise<BankingDetails[]> => {
  const userRef = doc(db, 'users', userId)
  const snapshot = await getDoc(userRef)
  if (!snapshot.exists()) return []
  const data = snapshot.data()
  const accounts: BankingDetails[] = data?.payoutAccounts || []
  if (accounts.length === 0 && data?.bankingDetails) {
    const legacy = data.bankingDetails
    return [{
      id: 'default',
      bankName: normalizeValue(legacy.bankName),
      accountName: normalizeValue(legacy.accountName),
      accountNumber: normalizeValue(legacy.accountNumber),
      recipientCode: normalizeValue(legacy.recipientCode) || null as any,
      isDefault: true
    }]
  }
  return accounts
}

export const getBankingDetails = async (userId: string): Promise<BankingDetails | null> => {
  const accounts = await getPayoutAccounts(userId)
  return accounts.find(a => a.isDefault) || accounts[0] || null
}

export const savePayoutAccount = async (userId: string, account: BankingDetails) => {
  const userRef = doc(db, 'users', userId)
  const accounts = await getPayoutAccounts(userId)
  
  const id = account.id || Math.random().toString(36).substring(2, 10)
  const normalized = {
    id,
    bankName: normalizeValue(account.bankName),
    bankCode: account.bankCode || null,
    accountName: normalizeValue(account.accountName),
    accountNumber: normalizeValue(account.accountNumber),
    recipientCode: account.recipientCode || null,
    isDefault: accounts.length === 0 ? true : !!account.isDefault,
    updatedAt: new Date().toISOString()
  }

  let newAccounts = [...accounts]
  if (normalized.isDefault) {
    newAccounts = newAccounts.map(a => ({ ...a, isDefault: false }))
  }

  const index = newAccounts.findIndex(a => a.id === id)
  if (index >= 0) newAccounts[index] = normalized
  else newAccounts.push(normalized)

  await setDoc(userRef, {
    payoutAccounts: newAccounts,
    ...(normalized.isDefault ? {
      bankingDetails: normalized,
      bankName: normalized.bankName,
      accountName: normalized.accountName,
      accountNumber: normalized.accountNumber,
    } : {}),
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export const deletePayoutAccount = async (userId: string, accountId: string) => {
  const userRef = doc(db, 'users', userId)
  const accounts = await getPayoutAccounts(userId)
  const filtered = accounts.filter(a => a.id !== accountId)
  if (filtered.length > 0 && !filtered.find(a => a.isDefault)) filtered[0].isDefault = true

  await setDoc(userRef, {
    payoutAccounts: filtered,
    bankingDetails: filtered.find(a => a.isDefault) || null,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export const setDefaultPayoutAccount = async (userId: string, accountId: string) => {
  const userRef = doc(db, 'users', userId)
  const accounts = await getPayoutAccounts(userId).then(list => list.map(a => ({ ...a, isDefault: a.id === accountId })))
  const def = accounts.find(a => a.isDefault)

  await setDoc(userRef, {
    payoutAccounts: accounts,
    bankingDetails: def || null,
    bankName: def?.bankName || null,
    accountName: def?.accountName || null,
    accountNumber: def?.accountNumber || null,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export const saveBankingDetails = (userId: string, d: BankingDetails) => savePayoutAccount(userId, { ...d, isDefault: true })
