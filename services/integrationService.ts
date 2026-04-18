import { adminDb } from '@/lib/firebaseAdmin';

export interface CustomerData {
  email: string;
  name?: string;
  amount: number;
  currency: string;
  productId: string;
  productName?: string;
}

export const IntegrationService = {
  /**
   * Triggers active integrations for a specific creator when a purchase is made.
   */
  async handlePurchase(creatorId: string, customerData: CustomerData) {
    if (!creatorId) return;

    try {
      const creatorDoc = await adminDb.collection('users').doc(creatorId).get();
      const creator = creatorDoc.data();

      if (!creator || !creator.integrations) {
        console.log(`No integrations found for creator: ${creatorId}`);
        return;
      }

      const { integrations } = creator;

      const results = [];

      // 1. Mailchimp
      if (integrations.mailchimp?.connected && integrations.mailchimp?.apiKey && integrations.mailchimp?.listId) {
        results.push(this.pushToMailchimp(integrations.mailchimp, customerData));
      }

      // 2. Zapier
      if (integrations.zapierWebhookUrl) {
        results.push(this.pushToZapier(integrations.zapierWebhookUrl, customerData));
      }
      
      // 3. ConvertKit
      if (integrations.convertkit?.connected && integrations.convertkit?.apiKey) {
        results.push(this.pushToConvertKit(integrations.convertkit, customerData));
      }

      // Wait for all integration triggers to complete (or fail)
      if (results.length > 0) {
        await Promise.allSettled(results);
        console.log(`Triggered ${results.length} integrations for creator: ${creatorId}`);
      }

    } catch (error) {
      console.error('Error handling integrations for purchase:', error);
    }
  },

  /**
   * Pushes customer data to Mailchimp List
   */
  async pushToMailchimp(config: { apiKey: string; listId: string }, customer: CustomerData) {
    try {
      const datacenter = config.apiKey.split('-')[1];
      if (!datacenter) throw new Error('Invalid Mailchimp API Key format');

      const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${config.listId}/members`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: customer.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: customer.name?.split(' ')[0] || '',
            LNAME: customer.name?.split(' ').slice(1).join(' ') || '',
          },
          tags: ['Pasive Customer', `Product: ${customer.productName || customer.productId}`]
        }),
      });

      const data = await response.json();
      if (!response.ok && data.title !== 'Member Exists') {
        console.error('Mailchimp API Error:', data);
      }
    } catch (err) {
      console.error('Failed to push to Mailchimp:', err);
    }
  },

  /**
   * Pushes event data to a Zapier Webhook
   */
  async pushToZapier(webhookUrl: string, customer: CustomerData) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'purchase',
          email: customer.email,
          name: customer.name,
          amount: customer.amount,
          currency: customer.currency,
          productId: customer.productId,
          productName: customer.productName,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Zapier Webhook Error:', response.statusText);
      }
    } catch (err) {
      console.error('Failed to push to Zapier:', err);
    }
  },
  
  /**
   * Pushes customer data to ConvertKit
   */
  async pushToConvertKit(config: { apiKey: string }, customer: CustomerData) {
    try {
      // Adding a subscriber to ConvertKit (generic)
      const response = await fetch('https://api.convertkit.com/v3/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: config.apiKey,
          email: customer.email,
          first_name: customer.name?.split(' ')[0] || '',
          fields: {
            last_purchase: customer.productName || customer.productId,
            purchase_amount: `${customer.currency} ${customer.amount}`
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('ConvertKit API Error:', data);
      }
    } catch (err) {
      console.error('Failed to push to ConvertKit:', err);
    }
  }
};
