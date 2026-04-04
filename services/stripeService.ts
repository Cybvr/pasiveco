import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
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
  customerId?: string | null;
}

export class StripeService {
  static async ensureCustomer(params: { userId: string; email: string }) {
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    const userRef = doc(db, 'users', params.userId);
    const snapshot = await getDoc(userRef);
    const existingCustomerId = snapshot.exists() ? snapshot.data()?.stripeCustomerId : null;

    if (existingCustomerId) {
      return existingCustomerId as string;
    }

    const customer = await stripe.customers.create({
      email: params.email,
      metadata: {
        userId: params.userId,
      },
    });

    await setDoc(
      userRef,
      {
        email: params.email,
        stripeCustomerId: customer.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return customer.id;
  }

  static async listSavedCards(customerId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    const [paymentMethods, customer] = await Promise.all([
      stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      }),
      stripe.customers.retrieve(customerId),
    ]);

    const defaultPaymentMethodId =
      !customer.deleted && typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null;

    return paymentMethods.data.map((paymentMethod) => ({
      id: paymentMethod.id,
      brand: paymentMethod.card?.brand || 'card',
      last4: paymentMethod.card?.last4 || '0000',
      expMonth: paymentMethod.card?.exp_month || 0,
      expYear: paymentMethod.card?.exp_year || 0,
      funding: paymentMethod.card?.funding || null,
      isDefault: paymentMethod.id === defaultPaymentMethodId,
    }));
  }

  static async createCardSetupSession(params: {
    customerId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: params.customerId,
      payment_method_types: ['card'],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  static async removeSavedCard(paymentMethodId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    await stripe.paymentMethods.detach(paymentMethodId);
  }

  static async setDefaultSavedCard(customerId: string, paymentMethodId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured.');
    }

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  /**
   * Create a checkout session for one-time payments (Western Buyers)
   */
  static async createCheckoutSession(data: StripeCheckoutData) {
    if (!stripe) {
      return { status: false, message: 'Stripe is not configured.' };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        ...(data.customerId ? { customer: data.customerId } : { customer_email: data.email }),
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
        ...(data.customerId
          ? {
              payment_intent_data: {
                setup_future_usage: 'off_session',
              },
            }
          : {}),
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
    if (!stripe) {
      return { status: false, message: 'Stripe is not configured.' };
    }

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
    if (!stripe) {
      return { status: false, message: 'Stripe is not configured.' };
    }

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
    if (!stripe) {
      return { status: false, message: 'Stripe is not configured.' };
    }

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
