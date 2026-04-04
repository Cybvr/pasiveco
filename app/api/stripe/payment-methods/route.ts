import { NextRequest, NextResponse } from 'next/server'

import { StripeService } from '@/services/stripeService'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const email = request.nextUrl.searchParams.get('email')

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: 'User ID and email are required.' }, { status: 400 })
    }

    const customerId = await StripeService.ensureCustomer({ userId, email })
    const cards = await StripeService.listSavedCards(customerId)

    return NextResponse.json({ success: true, data: cards })
  } catch (error: any) {
    console.error('Stripe payment methods GET error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to load saved cards.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ success: false, message: 'User ID and email are required.' }, { status: 400 })
    }

    const customerId = await StripeService.ensureCustomer({ userId, email })
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

    if (!origin) {
      return NextResponse.json({ success: false, message: 'App URL is not configured.' }, { status: 500 })
    }

    const session = await StripeService.createCardSetupSession({
      customerId,
      successUrl: `${origin}/dashboard/settings/payment-method?cards=updated`,
      cancelUrl: `${origin}/dashboard/settings/payment-method?cards=cancelled`,
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (error: any) {
    console.error('Stripe payment methods POST error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to start card setup.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, email, paymentMethodId } = await request.json()

    if (!userId || !email || !paymentMethodId) {
      return NextResponse.json(
        { success: false, message: 'User ID, email, and payment method ID are required.' },
        { status: 400 }
      )
    }

    const customerId = await StripeService.ensureCustomer({ userId, email })
    await StripeService.setDefaultSavedCard(customerId, paymentMethodId)
    const cards = await StripeService.listSavedCards(customerId)

    return NextResponse.json({ success: true, data: cards })
  } catch (error: any) {
    console.error('Stripe payment methods PATCH error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to update default card.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, email, paymentMethodId } = await request.json()

    if (!userId || !email || !paymentMethodId) {
      return NextResponse.json(
        { success: false, message: 'User ID, email, and payment method ID are required.' },
        { status: 400 }
      )
    }

    const customerId = await StripeService.ensureCustomer({ userId, email })
    await StripeService.removeSavedCard(paymentMethodId)
    const cards = await StripeService.listSavedCards(customerId)

    return NextResponse.json({ success: true, data: cards })
  } catch (error: any) {
    console.error('Stripe payment methods DELETE error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to remove card.' },
      { status: 500 }
    )
  }
}
