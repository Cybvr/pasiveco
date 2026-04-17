import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/services/paystackService'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency, recipientCode, accountName, bankName, accountNumber, gateway, cryptoWallet, cryptoNetwork, payoutLockedUntil, email } = await request.json()

    if (!userId || !amount) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // SECURITY CHECK: Is the payout account currently locked?
    if (payoutLockedUntil) {
      const lockDate = new Date(payoutLockedUntil)
      if (lockDate > new Date()) {
        const hoursLeft = Math.ceil((lockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60))
        return NextResponse.json({ 
          success: false, 
          message: `Payout account is locked for security because it was recently updated. Try again in ${hoursLeft} hours.` 
        }, { status: 403 })
      }
    }

    let result: any
    let transferData: any = {}

    // 1. Initiate Transfer via appropriate Gateway
    if (gateway === 'bitnob') {
      // Crypto Payout
      result = await BitnobService.initiateCryptoPayout({
        amount,
        address: cryptoWallet,
        network: cryptoNetwork,
        reference: `payout_${userId}_${Date.now()}`,
        email: email || 'hello@pasive.co'
      })
      transferData = result?.data || {}
    } else {
      // Default Paystack Transfer
      result = await PaystackService.initiateTransfer(
        amount,
        recipientCode,
        `Pasive Withdrawal - ${userId}`
      )
      transferData = result?.data || {}
    }

    // 2. Log the request in Firestore
    const payoutRef = await addDoc(collection(db, 'payoutRequests'), {
      userId,
      amount,
      currency: currency || 'NGN',
      status: result?.status ? 'paid' : 'pending',
      recipientCode: recipientCode || null,
      accountName: accountName || 'Crypto Wallet',
      bankName: bankName || 'Bitnob (Crypto)',
      accountNumber: accountNumber || cryptoWallet || null,
      transferCode: transferData.transfer_code || transferData.id || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      gateway: gateway || 'paystack',
      rawResponse: result
    })

    if (result?.status) {
      return NextResponse.json({
        success: true,
        message: 'Withdrawal successful and funds sent.',
        payoutId: payoutRef.id,
        transferCode: transferData.transfer_code
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result?.message || 'Paystack transfer failed.',
        payoutId: payoutRef.id
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Payout initiation error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to process withdrawal.' },
      { status: 500 }
    )
  }
}
