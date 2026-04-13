import { NextResponse } from 'next/server'

// Static fallback rates (NGN-based) - used if the API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  NGN: 1,
  USD: 1 / 1500,
  KES: 0.085,
  GHS: 0.01,
}

// Revalidate cache once per hour
export const revalidate = 3600

export async function GET() {
  try {
    // open.er-api.com open access – no API key, updates every 24h
    const res = await fetch('https://open.er-api.com/v6/latest/NGN', {
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`Exchange rate API responded ${res.status}`)

    const data = await res.json()

    if (data.result !== 'success' || !data.rates) {
      throw new Error('Unexpected exchange rate API response shape')
    }

    const rates: Record<string, number> = {
      NGN: 1,
      USD: data.rates.USD ?? FALLBACK_RATES.USD,
      KES: data.rates.KES ?? FALLBACK_RATES.KES,
      GHS: data.rates.GHS ?? FALLBACK_RATES.GHS,
    }

    return NextResponse.json({ rates, source: 'live', updatedAt: data.time_last_update_utc ?? null })
  } catch (err) {
    console.warn('[exchange-rates] Falling back to static rates:', err)
    return NextResponse.json({ rates: FALLBACK_RATES, source: 'fallback', updatedAt: null })
  }
}
