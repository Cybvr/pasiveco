import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);

export interface FlutterwaveInitializeData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    phonenumber?: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, any>;
}

export class FlutterwaveService {
  /**
   * Initialize a payment (African Buyers)
   */
  static async initializePayment(data: FlutterwaveInitializeData) {
    try {
      const payload = {
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        redirect_url: data.redirect_url,
        customer: data.customer,
        customizations: data.customizations || {
          title: 'Pasive',
          description: 'Payment for product',
        },
        meta: data.meta,
      };

      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        status: result.status === 'success',
        link: result.data?.link,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Flutterwave Initialization Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Verify a payment
   */
  static async verifyPayment(transactionId: string) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return {
        status: response.status === 'success',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Flutterwave Verification Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Payout to an African bank account or mobile money
   */
  static async createTransfer(payload: {
    account_bank: string;
    account_number: string;
    amount: number;
    currency: string;
    narration: string;
    reference: string;
    beneficiary_name?: string;
  }) {
    try {
      const response = await flw.Transfer.initiate(payload);
      return {
        status: response.status === 'success',
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error('Flutterwave Transfer Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Get list of banks for a specific country
   */
  static async getBanks(country: string = 'NG') {
    try {
      const response = await flw.Bank.country({ country });
      return {
        status: response.status === 'success',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Flutterwave Get Banks Error:', error);
      return { status: false, message: error.message };
    }
  }
}
