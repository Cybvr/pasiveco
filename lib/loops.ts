import { LoopsClient } from 'loops';

if (!process.env.LOOPS_API_KEY) {
  console.warn('[Loops] LOOPS_API_KEY is not set. Email features will be disabled.');
}

export const loops = process.env.LOOPS_API_KEY
  ? new LoopsClient(process.env.LOOPS_API_KEY)
  : null;

// ---------------------------------------------------------------------------
// Template IDs — replace these with your actual Loops template IDs
// ---------------------------------------------------------------------------
export const LOOPS_TEMPLATES = {
  /** Sent to buyer after a successful Paystack charge */
  PURCHASE_CONFIRMATION: 'cmnczhykd0bh50i2oxgd3l3pg',
  /** Sent to buyer when a Paystack charge fails */
  PAYMENT_FAILED: 'YOUR_FAILED_TEMPLATE_ID',
  /** Sent to new user after they finish signing up */
  WELCOME: 'cmnczv6kl12ic0i2g6qnk7g0t',
};
