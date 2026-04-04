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
      'egypt': 'EG',
      'senegal': 'SN',
      'ivory coast': 'CI',
      'cameroon': 'CM',
    }

    const code = countryCodes[country] || 'NG'

    const response = await fetch(`https://api.flutterwave.com/v3/banks/${code}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const raw = await response.text()
    let data: any = null

    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      console.error('Bank API non-JSON response:', raw.slice(0, 200))
      return NextResponse.json(
        { status: false, message: 'Flutterwave returned an invalid bank list response.' },
        { status: 502 }
      )
    }

    if (response.ok && data?.status === 'success' && Array.isArray(data.data)) {
      // Deduplicate by bank code — Flutterwave occasionally returns duplicates
      const seen = new Set<string>()
      const uniqueBanks = data.data.filter((bank: { code: string }) => {
        if (seen.has(bank.code)) return false
        seen.add(bank.code)
        return true
      })
      return NextResponse.json({ status: true, data: uniqueBanks })
    }

    return NextResponse.json(
      { status: false, message: data?.message || 'Failed to fetch banks' },
      { status: response.status || 400 }
    )
  } catch (error: any) {
    console.error('Bank API Error:', error)
    return NextResponse.json({ status: false, message: error.message || 'Failed to fetch banks' }, { status: 500 })
  }
}
