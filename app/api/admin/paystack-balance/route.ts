import { NextResponse } from 'next/server'

import { db } from '@/lib/firebase-admin'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { PaystackService } from '@/services/paystackService'

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser()
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const userSnap = await db.collection('users').doc(authUser.uid).get()
    const user = userSnap.data()
    const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin')

    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const result = await PaystackService.fetchBalance()

    if (!result?.status) {
      return NextResponse.json(
        { success: false, message: result?.message || 'Unable to fetch Paystack balance.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      message: result.message,
    })
  } catch (error: any) {
    console.error('Admin Paystack balance error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to fetch Paystack balance.' },
      { status: 500 }
    )
  }
}
