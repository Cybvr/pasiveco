import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/services/paystackService'

export async function POST(request: NextRequest) {
  try {
    const { businessName, bankCode, accountNumber, percentageCharge } = await request.json()

    if (!businessName || !bankCode || !accountNumber) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const data = await PaystackService.createSubaccount({
      business_name: businessName,
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: percentageCharge || 10, // Default 10% platform fee if not specified
    })

    if (data?.status && data.data?.subaccount_code) {
      return NextResponse.json({
        success: true,
        data: {
          subaccountCode: data.data.subaccount_code,
        },
      })
    }

    return NextResponse.json(
      { success: false, message: data?.message || 'Unable to create subaccount.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Subaccount API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to create subaccount.' },
      { status: 500 }
    )
  }
}
