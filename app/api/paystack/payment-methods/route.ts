
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const cardsRef = collection(db, 'saved_cards');
    const q = query(cardsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const cards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: cards });
  } catch (error: any) {
    console.error('Paystack payment methods GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to load saved cards.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, cardId } = await request.json();

    if (!userId || !cardId) {
      return NextResponse.json({ success: false, message: 'User ID and Card ID are required.' }, { status: 400 });
    }

    // Set all other cards for this user to isDefault: false
    const batch = writeBatch(db);
    const cardsRef = collection(db, 'saved_cards');
    const q = query(cardsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach(d => {
      batch.update(d.ref, { isDefault: d.id === cardId });
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: 'Default card updated.' });
  } catch (error: any) {
    console.error('Paystack payment methods PATCH error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to update default card.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, cardId } = await request.json();

    if (!userId || !cardId) {
      return NextResponse.json({ success: false, message: 'User ID and Card ID are required.' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'saved_cards', cardId));

    return NextResponse.json({ success: true, message: 'Card removed.' });
  } catch (error: any) {
    console.error('Paystack payment methods DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Unable to remove card.' },
      { status: 500 }
    );
  }
}
