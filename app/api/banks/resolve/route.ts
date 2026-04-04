import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const { accountNumber, bankCode } = await request.json()

    if (!accountNumber || typeof accountNumber !== 'string') {
      return NextResponse.json({ success: false, message: 'Account number is required.' }, { status: 400 })
    }

    if (!bankCode || typeof bankCode !== 'string') {
      return NextResponse.json({ success: false, message: 'Bank code is required.' }, { status: 400 })
    }

    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY

    if (!flutterwaveKey) {
      return NextResponse.json({ success: false, message: 'Flutterwave key missing.' }, { status: 500 })
    }

    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber.trim(),
        account_bank: bankCode.trim(),
      }),
      cache: 'no-store',
    })

    const raw = await response.text()
    let data: any = null

    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      console.error('Bank resolve non-JSON response:', raw.slice(0, 200))
      return NextResponse.json(
        { success: false, message: 'Flutterwave returned an invalid account resolution response.' },
        { status: 502 }
      )
    }

    if (response.ok && data?.status === 'success' && data.data?.account_name) {
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
      { status: response.status || 400 }
    )
  } catch (error: any) {
    console.error('Bank resolve API error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to resolve account name.' },
      { status: 500 }
    )
  }
}
