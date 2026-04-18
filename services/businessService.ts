import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { getReceivedGifts } from './giftService';
import { getSellerTransactions } from './transactionsService';

export interface BusinessOverview {
  totalRevenue: number;
  revenueBySource: {
    products: number;
    bookings: number;
    gifts: number;
  };
  customerCount: number;
  recentActivity: any[];
  revenueTimeline: Array<{
    date: string;
    products: number;
    bookings: number;
    gifts: number;
    total: number;
  }>;
}

export const getBusinessOverview = async (userId: string): Promise<BusinessOverview> => {
  try {
    // 1. Fetch all revenue sources
    const [sales, gifts, appointments] = await Promise.all([
      getSellerTransactions(userId),
      getReceivedGifts(userId),
      getDocs(query(collection(db, 'appointments'), where('creatorId', '==', userId), where('status', '==', 'confirmed')))
    ]);

    const productRevenue = sales.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const giftRevenue = gifts.reduce((sum, g) => sum + (g.amount || 0), 0);
    
    let bookingRevenue = 0;
    const appointmentEvents: any[] = [];
    
    appointments.forEach(doc => {
      const data = doc.data();
      bookingRevenue += (data.price || 0);
      appointmentEvents.push({
        id: doc.id,
        type: 'booking',
        title: `New booking: ${data.serviceName || 'Consultation'}`,
        user: data.customerName,
        amount: data.price,
        time: data.createdAt,
        status: data.status
      });
    });

    // Generate last 30 days timeline
    const timelineMap: Record<string, any> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timelineMap[dateStr] = { date: dateStr, products: 0, bookings: 0, gifts: 0, total: 0 };
    }

    // Populate timeline from sales
    sales.forEach(s => {
      const date = s.createdAt instanceof Timestamp ? s.createdAt.toDate().toISOString().split('T')[0] : 
                   new Date(s.createdAt).toISOString().split('T')[0];
      if (timelineMap[date]) {
        timelineMap[date].products += s.amount || 0;
        timelineMap[date].total += s.amount || 0;
      }
    });

    // Populate timeline from gifts
    gifts.forEach(g => {
      const date = g.createdAt instanceof Timestamp ? g.createdAt.toDate().toISOString().split('T')[0] : 
                   new Date(g.createdAt).toISOString().split('T')[0];
      if (timelineMap[date]) {
        timelineMap[date].gifts += g.amount || 0;
        timelineMap[date].total += g.amount || 0;
      }
    });

    // Populate timeline from bookings
    appointmentEvents.forEach(a => {
      const date = a.time instanceof Timestamp ? a.time.toDate().toISOString().split('T')[0] : 
                   new Date(a.time).toISOString().split('T')[0];
      if (timelineMap[date]) {
        timelineMap[date].bookings += a.amount || 0;
        timelineMap[date].total += a.amount || 0;
      }
    });

    const revenueTimeline = Object.values(timelineMap);

    const giftEvents = gifts.map(g => ({
      id: g.id,
      type: 'gift',
      title: `Received a gift from ${g.senderName}`,
      user: g.senderName,
      amount: g.amount,
      time: g.createdAt,
      status: g.status
    }));

    const saleEvents = sales.map(s => ({
      id: s.id,
      type: 'sale',
      title: `Sold ${s.productName}`,
      user: s.customerName,
      amount: s.amount,
      time: s.createdAt,
      status: s.status
    }));

    // Merge and sort activity
    const recentActivity = [...appointmentEvents, ...giftEvents, ...saleEvents]
      .sort((a, b) => (b.time?.toMillis?.() || 0) - (a.time?.toMillis?.() || 0))
      .slice(0, 15);

    // Unique customers across all sources
    const customers = new Set([
      ...sales.map(s => s.customerEmail),
      ...gifts.map(g => g.senderEmail),
      ...appointmentEvents.map(a => a.user) // Simplified
    ]);

    return {
      totalRevenue: productRevenue + giftRevenue + bookingRevenue,
      revenueBySource: {
        products: productRevenue,
        bookings: bookingRevenue,
        gifts: giftRevenue
      },
      customerCount: customers.size,
      recentActivity,
      revenueTimeline
    };
  } catch (error) {
    console.error('Error fetching business overview:', error);
    throw error;
  }
};
