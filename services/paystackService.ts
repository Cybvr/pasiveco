
interface PaystackInitializeData {
  email: string;
  amount: number; // in kobo (1 NGN = 100 kobo)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: {
    product_id: string;
    product_name: string;
    customer_name?: string;
  };
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class PaystackService {
  private static baseUrl = 'https://api.paystack.co';
  private static secretKey = process.env.PAYSTACK_SECRET_KEY;

  static async initializeTransaction(data: PaystackInitializeData): Promise<PaystackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  static async verifyTransaction(reference: string): Promise<PaystackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  static generateReference(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static convertToKobo(amount: number, currency: string = 'NGN'): number {
    // Convert amount to smallest currency unit
    if (currency === 'NGN') {
      return Math.round(amount * 100); // NGN to kobo
    }
    // For other currencies, multiply by 100 (assuming cents/pence)
    return Math.round(amount * 100);
  }
}

// Client-side Paystack handler
export const initializePaystackPayment = (
  email: string,
  amount: number,
  productId: string,
  productName: string,
  onSuccess: (reference: string) => void,
  onClose: () => void
) => {
  const handler = (window as any).PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: PaystackService.convertToKobo(amount),
    currency: 'NGN',
    ref: PaystackService.generateReference(),
    metadata: {
      product_id: productId,
      product_name: productName,
    },
    callback: function(response: any) {
      onSuccess(response.reference);
    },
    onClose: function() {
      onClose();
    }
  });

  handler.openIframe();
};
