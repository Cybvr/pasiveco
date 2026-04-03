import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')?.toLowerCase() || 'nigeria'

  try {
    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY

    if (!flutterwaveKey) {
      return NextResponse.json({ status: false, message: 'Flutterwave key missing' }, { status: 500 })
    }

    // Mapping countries to Flutterwave codes
    const countryCodes: Record<string, string> = {
      'nigeria': 'NG',
      'ghana': 'GH',
      'kenya': 'KE',
      'south africa': 'ZA',
      'uganda': 'UG',
      'tanzania': 'TZ',
      'rwanda': 'RW',
    }

    const code = countryCodes[country] || 'NG'

    const response = await fetch(`https://api.flutterwave.com/v3/banks/${code}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({ status: true, data: data.data })
    }

    return NextResponse.json({ status: false, message: data.message || 'Failed to fetch banks' }, { status: 400 })
  } catch (error: any) {
    console.error('Bank API Error:', error)
    return NextResponse.json({ status: false, message: error.message }, { status: 500 })
  }
}
