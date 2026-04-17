
export interface PaystackInitializeData {
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  callback_url: string;
  plan?: string;
  metadata?: any;
}

export class PaystackService {
  private static readonly SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  private static readonly BASE_URL = 'https://api.paystack.co';

  /**
   * Initialize a transaction / subscription
   */
  static async initializeTransaction(data: PaystackInitializeData) {
    try {
      const response = await fetch(`${this.BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Paystack expects amount in kobo (NGN * 100)
          amount: Math.round(data.amount * 100),
        }),
      });

      const result = await response.json();
      return {
        status: result.status,
        url: result.data?.authorization_url,
        reference: result.data?.reference,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Paystack Initialization Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Verify a transaction
   */
  static async verifyTransaction(reference: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
        },
      });

      const result = await response.json();
      return {
        status: result.status,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Paystack Verification Error:', error);
      return { status: false, message: error.message };
    }
  }
}
