
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface AnalyticsScanData {
  date: string;
  scanCount: number;
  uniqueUsers: string[];
}

export interface QRScanData {
  date: Timestamp;
  qrCodeId: string;
  userLocation?: string;
  deviceType: string;
  campaignType: string;
  city: string;
  country: string;
  userId: string;
  uniqueUsers?: string;
}

export interface ClickAnalyticsData {
  date: string;
  clickCount: number;
  uniqueUsers: string[];
  byPlatform: Record<string, number>;
  byLinkType: Record<string, number>;
}

export interface ClickData {
  date: Timestamp;
  qrCodeId: string;
  userId?: string;
  linkType: 'social' | 'url';
  platform?: string;
  url: string;
  deviceType?: string;
  city?: string;
  country?: string;
}

export interface FullAnalyticsResponse {
  scansData: AnalyticsScanData[];
  clicksData: ClickAnalyticsData[];
  scanDevices: Record<string, number>;
  clickDevices: Record<string, number>;
  scanCities: Record<string, number>;
  clickCities: Record<string, number>;
  scanCountries: Record<string, number>;
  clickCountries: Record<string, number>;
  platforms: Record<string, number>;
  totalScans: number;
  totalClicks: number;
  uniqueScanUsers: number;
  uniqueClickUsers: number;
  activeQRCodes: number;
}

export const saveQRScan = async (data: QRScanData) => {
  try {
    const scansRef = collection(db, 'qr_scans');
    await addDoc(scansRef, data);
    await updateDoc(doc(db, 'qr_codes', data.qrCodeId), {
      scanCount: increment(1)
    });
  } catch (error) {
    console.error('Error saving scan:', error);
    throw error;
  }
};

export const getAnalytics = async (
  startDate: Date,
  endDate: Date,
  qrCodeId?: string
): Promise<FullAnalyticsResponse> => {
  try {
    const scansQuery = qrCodeId
      ? query(
          collection(db, 'qr_scans'),
          where('qrCodeId', '==', qrCodeId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        )
      : query(
          collection(db, 'qr_scans'),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        );

    const clicksQuery = qrCodeId
      ? query(
          collection(db, 'link_clicks'),
          where('qrCodeId', '==', qrCodeId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        )
      : query(
          collection(db, 'link_clicks'),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        );

    const [scansSnapshot, clicksSnapshot] = await Promise.all([
      getDocs(scansQuery),
      getDocs(clicksQuery)
    ]);

    const analytics: FullAnalyticsResponse = {
      scansData: [],
      clicksData: [],
      scanDevices: {},
      clickDevices: {},
      scanCities: {},
      clickCities: {},
      scanCountries: {},
      clickCountries: {},
      platforms: {},
      totalScans: 0,
      totalClicks: 0,
      uniqueScanUsers: 0,
      uniqueClickUsers: 0,
      activeQRCodes: 0,
    };

    const scanUsers = new Set<string>();
    const clickUsers = new Set<string>();
    const scannedQRCodes = new Set<string>();
    const dailyScans: Record<string, { count: number; uniqueUsers: Set<string> }> = {};
    const dailyClicks: Record<string, { count: number; uniqueUsers: Set<string>; platforms: Record<string, number>; linkTypes: Record<string, number> }> = {};

    scansSnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate().toISOString().split('T')[0];
      analytics.totalScans++;
      scannedQRCodes.add(data.qrCodeId);

      if (!dailyScans[date]) {
        dailyScans[date] = { count: 0, uniqueUsers: new Set() };
      }

      analytics.scanDevices[data.deviceType] = (analytics.scanDevices[data.deviceType] || 0) + 1;
      analytics.scanCities[data.city] = (analytics.scanCities[data.city] || 0) + 1;
      analytics.scanCountries[data.country] = (analytics.scanCountries[data.country] || 0) + 1;

      if (data.userId) {
        scanUsers.add(data.userId);
        dailyScans[date].uniqueUsers.add(data.userId);
      }
      dailyScans[date].count++;
    });

    clicksSnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate().toISOString().split('T')[0];
      analytics.totalClicks++;

      if (!dailyClicks[date]) {
        dailyClicks[date] = { count: 0, uniqueUsers: new Set(), platforms: {}, linkTypes: {} };
      }

      const platform = data.platform || 'unknown';
      analytics.platforms[platform] = (analytics.platforms[platform] || 0) + 1;
      analytics.clickDevices[data.deviceType] = (analytics.clickDevices[data.deviceType] || 0) + 1;

      if (data.userId) {
        clickUsers.add(data.userId);
        dailyClicks[date].uniqueUsers.add(data.userId);
      }

      dailyClicks[date].count++;
      dailyClicks[date].platforms[platform] = (dailyClicks[date].platforms[platform] || 0) + 1;
      dailyClicks[date].linkTypes[data.linkType] = (dailyClicks[date].linkTypes[data.linkType] || 0) + 1;
    });

    analytics.uniqueScanUsers = scanUsers.size;
    analytics.uniqueClickUsers = clickUsers.size;
    analytics.activeQRCodes = scannedQRCodes.size;

    analytics.scansData = Object.entries(dailyScans).map(([date, data]) => ({
      date,
      scanCount: data.count,
      uniqueUsers: Array.from(data.uniqueUsers),
    }));

    analytics.clicksData = Object.entries(dailyClicks).map(([date, data]) => ({
      date,
      clickCount: data.count,
      uniqueUsers: Array.from(data.uniqueUsers),
      byPlatform: data.platforms,
      byLinkType: data.linkTypes,
    }));

    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}
