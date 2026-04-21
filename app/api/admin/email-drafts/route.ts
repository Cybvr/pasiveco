import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let query: any = db.collection('email_drafts');
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.limit(50).get();

    const drafts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('Drafts GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, subject, html, templateId, userId } = await req.json();

    const draftData: any = {
      subject: subject || '',
      html: html || '',
      templateId: templateId || 'blast',
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (userId) draftData.userId = userId;

    if (id) {
      await db.collection('email_drafts').doc(id).set(draftData, { merge: true });
      return NextResponse.json({ success: true, id });
    } else {
      const docRef = await db.collection('email_drafts').add({
        ...draftData,
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, id: docRef.id });
    }
  } catch (error: any) {
    console.error('Drafts POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
