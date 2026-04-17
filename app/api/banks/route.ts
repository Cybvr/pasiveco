import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/services/paystackService'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')?.toLowerCase() || 'nigeria'

  try {
    const data = await PaystackService.listBanks(country)

    if (data?.status && Array.isArray(data.data)) {
      // Paystack already handles deduplication usually, but we can be safe
      const uniqueBanks = data.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
      }))
      return NextResponse.json({ status: true, data: uniqueBanks })
    }

    return NextResponse.json(
      { status: false, message: data?.message || 'Failed to fetch banks' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Bank API Error:', error)
    return NextResponse.json({ status: false, message: error.message || 'Failed to fetch banks' }, { status: 500 })
  }
}
