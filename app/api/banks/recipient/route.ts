import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/services/paystackService'

export async function POST(request: NextRequest) {
  try {
    const { name, accountNumber, bankCode } = await request.json()

    if (!name || !accountNumber || !bankCode) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const data = await PaystackService.createTransferRecipient(name, accountNumber, bankCode)

    if (data?.status && data.data?.recipient_code) {
      return NextResponse.json({
        success: true,
        data: {
          recipientCode: data.data.recipient_code,
        },
      })
    }

    return NextResponse.json(
      { success: false, message: data?.message || 'Unable to create transfer recipient.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Recipient API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to create transfer recipient.' },
      { status: 500 }
    )
  }
}
