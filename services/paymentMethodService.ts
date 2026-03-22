import { db } from '@/lib/firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export interface PaymentSettings {
  paystackEnabled: boolean
  acceptedMethods: {
    card: boolean
    bank: boolean
  }
  updatedAt?: unknown
}

export const defaultPaymentSettings: PaymentSettings = {
  paystackEnabled: true,
  acceptedMethods: {
    card: true,
    bank: true,
  }
}

export const getPaymentSettings = async (userId: string): Promise<PaymentSettings> => {
  try {
    const userRef = doc(db, 'users', userId)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      return defaultPaymentSettings
    }

    const data = snapshot.data()
    return data.paymentSettings || defaultPaymentSettings
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return defaultPaymentSettings
  }
}

export const savePaymentSettings = async (userId: string, settings: PaymentSettings) => {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    paymentSettings: {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
