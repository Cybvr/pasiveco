import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

import { db } from '@/lib/firebase-admin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { PaystackService } from '@/services/paystackService'

const REWARD_AMOUNT = 2000
const REWARD_CURRENCY = 'NGN'
const PROCESSING_LOCK_MS = 10 * 60 * 1000

type RewardStatus = 'paid' | 'failed' | 'skipped' | 'processing'

const timestampToMillis = (value: unknown) => {
  if (value instanceof Timestamp) return value.toMillis()
  if (value && typeof (value as any).toMillis === 'function') return (value as any).toMillis()
  return 0
}

const getDefaultPaystackAccount = (userData: FirebaseFirestore.DocumentData | undefined) => {
  const accounts = Array.isArray(userData?.payoutAccounts) ? userData?.payoutAccounts : []
  const account = accounts.find((item: any) => item?.isDefault) || accounts[0] || userData?.bankingDetails || null

  if (!account) return null
  if (account.payoutGateway && account.payoutGateway !== 'paystack') return null
  if (!account.recipientCode) return null

  return account
}

const updateReward = async (
  userId: string,
  data: {
    status: RewardStatus
    message?: string
    productId?: string
    recipientCode?: string | null
    transferCode?: string | null
    rawResponse?: unknown
  }
) => {
  await db.collection('firstProductRewards').doc(userId).set({
    userId,
    amount: REWARD_AMOUNT,
    currency: REWARD_CURRENCY,
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing productId' }, { status: 400 })
    }

    const rewardRef = db.collection('firstProductRewards').doc(user.uid)
    const lockResult = await db.runTransaction(async (transaction) => {
      const rewardSnap = await transaction.get(rewardRef)
      const reward = rewardSnap.exists ? rewardSnap.data() : null

      if (reward?.status === 'paid') {
        return { proceed: false, status: 'already_paid' as const, message: 'First product reward already paid.' }
      }

      const updatedAtMs = timestampToMillis(reward?.updatedAt)
      const lockIsFresh = reward?.status === 'processing' && Date.now() - updatedAtMs < PROCESSING_LOCK_MS

      if (lockIsFresh) {
        return { proceed: false, status: 'skipped' as const, message: 'Reward is already being processed.' }
      }

      transaction.set(rewardRef, {
        userId: user.uid,
        productId,
        amount: REWARD_AMOUNT,
        currency: REWARD_CURRENCY,
        status: 'processing',
        message: 'Processing first product reward.',
        createdAt: reward?.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })

      return { proceed: true }
    })

    if (!lockResult.proceed) {
      return NextResponse.json({ success: true, status: lockResult.status, message: lockResult.message })
    }

    const productSnap = await db.collection('products').doc(productId).get()
    const product = productSnap.data()

    if (!productSnap.exists || product?.userId !== user.uid) {
      await updateReward(user.uid, {
        status: 'skipped',
        productId,
        message: 'Product not found for authenticated user.',
      })
      return NextResponse.json({ success: false, status: 'skipped', message: 'Product not found' }, { status: 403 })
    }

    if (product?.status !== 'active') {
      await updateReward(user.uid, {
        status: 'skipped',
        productId,
        message: 'Product is not active.',
      })
      return NextResponse.json({ success: true, status: 'skipped', message: 'Product is not active.' })
    }

    const userProductsSnap = await db.collection('products').where('userId', '==', user.uid).get()
    const activeProducts = userProductsSnap.docs.filter((doc) => doc.data()?.status === 'active')

    if (activeProducts.length > 1) {
      await updateReward(user.uid, {
        status: 'skipped',
        productId,
        message: 'User already has another active product.',
      })
      return NextResponse.json({ success: true, status: 'skipped', message: 'Not first active product.' })
    }

    const userSnap = await db.collection('users').doc(user.uid).get()
    const payoutAccount = getDefaultPaystackAccount(userSnap.data())

    if (!payoutAccount) {
      await updateReward(user.uid, {
        status: 'skipped',
        productId,
        recipientCode: null,
        message: 'No Paystack payout recipient found for user.',
      })
      return NextResponse.json({ success: true, status: 'skipped', message: 'No Paystack payout recipient found.' })
    }

    const result = await PaystackService.initiateTransfer(
      REWARD_AMOUNT,
      payoutAccount.recipientCode,
      `Pasive first product reward - ${user.uid}`
    )
    const transferData = result?.data || {}

    if (!result?.status) {
      await updateReward(user.uid, {
        status: 'failed',
        productId,
        recipientCode: payoutAccount.recipientCode,
        transferCode: transferData.transfer_code || null,
        rawResponse: result,
        message: result?.message || 'Paystack transfer failed.',
      })

      return NextResponse.json({
        success: false,
        status: 'failed',
        message: result?.message || 'Paystack transfer failed.',
      }, { status: 400 })
    }

    await updateReward(user.uid, {
      status: 'paid',
      productId,
      recipientCode: payoutAccount.recipientCode,
      transferCode: transferData.transfer_code || null,
      rawResponse: result,
      message: 'First product reward paid.',
    })

    await db.collection('payoutRequests').add({
      userId: user.uid,
      amount: REWARD_AMOUNT,
      currency: REWARD_CURRENCY,
      status: 'paid',
      recipientCode: payoutAccount.recipientCode,
      accountName: payoutAccount.accountName || null,
      bankName: payoutAccount.bankName || null,
      accountNumber: payoutAccount.accountNumber || null,
      transferCode: transferData.transfer_code || null,
      gateway: 'paystack',
      type: 'first_product_reward',
      reason: 'first_product_reward',
      productId,
      rawResponse: result,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      status: 'paid',
      message: 'First product reward paid.',
      transferCode: transferData.transfer_code || null,
    })
  } catch (error: any) {
    console.error('First product reward error:', error)
    return NextResponse.json(
      { success: false, status: 'failed', message: error.message || 'Unable to process first product reward.' },
      { status: 500 }
    )
  }
}
