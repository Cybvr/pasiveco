
export class BitnobService {
  private static readonly API_KEY = process.env.BITNOB_API_KEY;
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.bitnob.co/api/v1' 
    : 'https://sandboxapi.bitnob.co/api/v1';

  /**
   * Initiate a crypto payout (USDT)
   */
  static async initiateCryptoPayout(params: {
    amount: number; // in cents/kobo or as a float? Bitnob usually expects kobo for NGN or cents for USD.
    address: string;
    network: string; // e.g. 'TRX' for TRC20, 'ETH' for ERC20
    reference: string;
    email: string;
  }) {
    try {
      const response = await fetch(`${this.BASE_URL}/wallets/send-crypto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100), // Assuming input is base currency (e.g. 50.00 USD)
          address: params.address,
          network: params.network,
          asset: 'USDT',
          reference: params.reference,
          customerEmail: params.email,
          description: 'Pasive Payout'
        }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Bitnob Crypto Payout Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Create a hosted checkout for receiving crypto payments
   */
  static async createCheckout(params: {
    amount: number; // in cents/kobo
    email: string;
    description: string;
    reference: string;
    callbackUrl?: string;
    successUrl?: string;
    errorUrl?: string;
  }) {
    try {
      const response = await fetch(`${this.BASE_URL}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          customerEmail: params.email,
          description: params.description,
          reference: params.reference,
          callbackUrl: params.callbackUrl,
          successUrl: params.successUrl,
          errorUrl: params.errorUrl,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Bitnob Create Checkout Error:', error);
      return { status: false, message: error.message };
    }
  }
}
