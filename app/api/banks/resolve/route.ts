import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/services/paystackService'

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, bankCode } = await request.json()

    if (!accountNumber || typeof accountNumber !== 'string') {
      return NextResponse.json({ success: false, message: 'Account number is required.' }, { status: 400 })
    }

    if (!bankCode || typeof bankCode !== 'string') {
      return NextResponse.json({ success: false, message: 'Bank code is required.' }, { status: 400 })
    }

    const data = await PaystackService.resolveAccount(accountNumber.trim(), bankCode.trim())

    if (data?.status && data.data?.account_name) {
      return NextResponse.json({
        success: true,
        data: {
          accountName: data.data.account_name,
          accountNumber: data.data.account_number,
        },
      })
    }

    return NextResponse.json(
      { success: false, message: data?.message || 'Unable to resolve account name.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Bank resolve API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to resolve account name.' },
      { status: 500 }
    )
  }
}
