import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  reference: string;
  amount: number;
  currency: string;
  couponDiscount: number;
  affiliate: string;
  yourProfit: number;
  customCharge: number;
  payoutDate: Timestamp | null;
  variation?: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  createdAt: Timestamp;
}
