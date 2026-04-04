import { StripeService } from './stripeService';
import { FlutterwaveService } from './flutterwaveService';

export type PaymentGateway = 'stripe' | 'flutterwave';

export interface CheckoutOptions {
  email: string;
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  slug: string;
  hostname: string; // To build callback URLs
  metadata?: Record<string, string>;
  customerId?: string | null;
}

export class PaymentGatewayService {
  /**
   * Determine the gateway based on currency
   */
  static getGateway(currency: string): PaymentGateway {
    const westernCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    if (westernCurrencies.includes(currency.toUpperCase())) {
      return 'stripe';
    }
    return 'flutterwave';
  }

  /**
   * Initialize a checkout flow
   */
  static async initializeCheckout(options: CheckoutOptions) {
    const gateway = this.getGateway(options.currency);
    const origin = options.hostname.startsWith('http') ? options.hostname : `https://${options.hostname}`;
    
    // Build callback/success URLs
    const callbackPath = options.slug 
      ? `/${options.slug}/product/${options.productId}/confirmation` 
      : `/product/${options.productId}/confirmation`;
    
    const successUrl = `${origin}${callbackPath}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${callbackPath}?cancelled=true`;

    if (gateway === 'stripe') {
      // Amount in cents for Stripe
      const amountInCents = Math.round(options.amount * 100);
      
      return await StripeService.createCheckoutSession({
        email: options.email,
        amount: amountInCents,
        currency: options.currency,
        productId: options.productId,
        productName: options.productName,
        successUrl,
        cancelUrl,
        metadata: options.metadata,
        customerId: options.customerId,
      });
    } else {
      // Flutterwave
      const txRef = `flw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return await FlutterwaveService.initializePayment({
        tx_ref: txRef,
        amount: options.amount,
        currency: options.currency,
        redirect_url: `${origin}${callbackPath}?tx_ref=${txRef}`,
        customer: {
          email: options.email,
        },
        customizations: {
          title: 'Pasive',
          description: options.productName,
        },
        meta: {
          productId: options.productId,
          ...options.metadata,
        },
      });
    }
  }

  /**
   * Payout logic
   */
  static async initiatePayout(params: {
    gateway: PaymentGateway;
    amount: number;
    currency: string;
    destination: string; // Account ID for Stripe, Account Number for Flw
    bankCode?: string; // Only for Flw
    reference: string;
  }) {
    if (params.gateway === 'stripe') {
      // Amount in cents
      const amountInCents = Math.round(params.amount * 100);
      return await StripeService.createTransfer(
        amountInCents, 
        params.currency, 
        params.destination
      );
    } else {
      // Flutterwave
      return await FlutterwaveService.createTransfer({
        account_bank: params.bankCode!,
        account_number: params.destination,
        amount: params.amount,
        currency: params.currency,
        narration: 'Pasive Payout',
        reference: params.reference,
      });
    }
  }
}
