import { stripe } from '@/lib/stripe';

export interface StripeCheckoutData {
  email: string;
  amount: number; // in cents
  currency: string;
  productId: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  /**
   * Create a checkout session for one-time payments (Western Buyers)
   */
  static async createCheckoutSession(data: StripeCheckoutData) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: data.email,
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: data.productName,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          productId: data.productId,
          ...data.metadata,
        },
      });

      return {
        status: true,
        id: session.id,
        url: session.url,
      };
    } catch (error: any) {
      console.error('Stripe Checkout Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Verify a checkout session
   */
  static async verifySession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        status: true,
        data: session,
      };
    } catch (error: any) {
      console.error('Stripe Verification Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Create a Connect Account for a seller (Western-based)
   */
  static async createConnectAccount(email: string, country: string = 'US') {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        country,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payment-method`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payment-method?stripe_success=true`,
        type: 'account_onboarding',
      });

      return {
        status: true,
        accountId: account.id,
        url: accountLink.url,
      };
    } catch (error: any) {
      console.error('Stripe Connect Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Create a transfer to a connected account (Payout)
   */
  static async createTransfer(amount: number, currency: string, destinationAccountId: string, metadata?: Record<string, string>) {
    try {
      const transfer = await stripe.transfers.create({
        amount,
        currency: currency.toLowerCase(),
        destination: destinationAccountId,
        metadata,
      });

      return {
        status: true,
        transferId: transfer.id,
      };
    } catch (error: any) {
      console.error('Stripe Transfer Error:', error);
      return { status: false, message: error.message };
    }
  }
}
