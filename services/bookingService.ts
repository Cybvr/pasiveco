import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { IntakeFormField } from './productsService';

export interface Appointment {
  id?: string;
  /** The booking product's Firestore ID */
  productId: string;
  /** Creator's userId */
  creatorId: string;
  /** Slug of the creator's page */
  creatorSlug: string;
  /** Product name – denormalised for easy display */
  productName: string;
  /** Chosen date (ISO string e.g. "2026-04-15") */
  date: string;
  /** Chosen start time (e.g. "10:00") */
  startTime: string;
  /** Chosen end time (e.g. "11:00") */
  endTime: string;
  /** Customer info */
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Dynamic intake-form answers: fieldId → answer */
  intakeAnswers?: Record<string, string | string[]>;
  /** Location type & details (copied from product at time of booking) */
  locationType?: string;
  locationDetail?: string;
  /** Booking status */
  status: 'pending' | 'confirmed' | 'cancelled';
  /** Financial */
  price: number;
  currency: string;
  /** Timestamps */
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fetch all confirmed appointments for a given product on a specific date.
 */
export const getBookedSlotsForDate = async (
  productId: string,
  date: string
): Promise<Pick<Appointment, 'startTime' | 'endTime'>[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('productId', '==', productId),
      where('date', '==', date),
      where('status', '!=', 'cancelled')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Appointment;
      return { startTime: data.startTime, endTime: data.endTime };
    });
  } catch (err) {
    console.error('Error fetching booked slots:', err);
    return [];
  }
};

/**
 * Given a set of weekly availability slots and a target date, return the
 * day-of-week slots that apply. Filters out already-booked time windows.
 */
export const getAvailableSlots = async (
  productId: string,
  date: string,
  availability: { day: string; start: string; end: string }[],
  sessionLengthMinutes: number
): Promise<{ start: string; end: string }[]> => {
  const dayName = new Date(date + 'T00:00:00')
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  const daySlots = availability.filter((s) => s.day === dayName && s.start && s.end);
  if (!daySlots.length) return [];

  const booked = await getBookedSlotsForDate(productId, date);

  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const fromMinutes = (mins: number) => {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const available: { start: string; end: string }[] = [];

  for (const slot of daySlots) {
    let cursor = toMinutes(slot.start);
    const slotEnd = toMinutes(slot.end);

    while (cursor + sessionLengthMinutes <= slotEnd) {
      const slotStart = cursor;
      const slotEndTime = cursor + sessionLengthMinutes;

      // Check if this window overlaps a booked appointment
      const isBooked = booked.some((b) => {
        const bs = toMinutes(b.startTime);
        const be = toMinutes(b.endTime);
        return slotStart < be && slotEndTime > bs;
      });

      if (!isBooked) {
        available.push({
          start: fromMinutes(slotStart),
          end: fromMinutes(slotEndTime),
        });
      }

      cursor += sessionLengthMinutes;
    }
  }

  return available;
};

// ─── CRUD ────────────────────────────────────────────────────────────────────

export const createAppointment = async (
  data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Error creating appointment:', err);
    throw err;
  }
};

export const getAppointment = async (id: string): Promise<Appointment | null> => {
  try {
    const snap = await getDoc(doc(db, 'appointments', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Appointment;
  } catch (err) {
    console.error('Error fetching appointment:', err);
    return null;
  }
};

/** All appointments booked WITH a specific creator (for the creator's dashboard) */
export const getCreatorBookings = async (creatorId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch (err) {
    console.error('Error fetching creator bookings:', err);
    return [];
  }
};

/** All appointments made BY a specific customer (email-based) */
export const getCustomerBookings = async (email: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('customerEmail', '==', email),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    return [];
  }
};
