
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
  static async initializeTransaction(data: PaystackInitializeData & { subaccount?: string; transaction_charge?: number }) {
    try {
      const body: any = {
        ...data,
        // Paystack expects amount in kobo (NGN * 100)
        amount: Math.round(data.amount * 100),
      };

      if (data.subaccount) {
        body.subaccount = data.subaccount;
      }
      if (data.transaction_charge) {
        body.transaction_charge = Math.round(data.transaction_charge * 100);
      }

      const response = await fetch(`${this.BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
   * Create a subaccount
   */
  static async createSubaccount(data: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
    description?: string;
  }) {
    try {
      const response = await fetch(`${this.BASE_URL}/subaccount`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack Create Subaccount Error:', error);
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

  /**
   * Fetch Paystack balance
   */
  static async fetchBalance() {
    try {
      const response = await fetch(`${this.BASE_URL}/balance`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack Balance Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * List supported banks
   */
  static async listBanks(country = 'nigeria') {
    try {
      // Paystack uses country names or codes
      const countryParam = country.toLowerCase() === 'nigeria' ? 'nigeria' : country;
      const response = await fetch(`${this.BASE_URL}/bank?country=${countryParam}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack List Banks Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Resolve account number
   */
  static async resolveAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        }
      );

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack Resolve Account Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Create a transfer recipient
   */
  static async createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/transferrecipient`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack Create Recipient Error:', error);
      return { status: false, message: error.message };
    }
  }

  /**
   * Initiate a transfer
   */
  static async initiateTransfer(amount: number, recipientCode: string, reason: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/transfer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(amount * 100), // Amount in kobo
          recipient: recipientCode,
          reason,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Paystack Initiate Transfer Error:', error);
      return { status: false, message: error.message };
    }
  }
}
