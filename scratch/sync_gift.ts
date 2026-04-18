import { db } from './lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

async function syncMissedGifts() {
  const reference = 'gift_KLRoXmT4f0LovoUEznA5_1776508126502';
  console.log('Syncing missed gift:', reference);
  
  try {
    const giftsRef = collection(db, 'gifts');
    const q = query(giftsRef, where('reference', '==', reference));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No gift found with that reference.');
      return;
    }
    
    const giftDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'gifts', giftDoc.id), {
      status: 'success',
      updatedAt: Timestamp.now(),
      syncedAt: Timestamp.now(),
      notes: 'Manually synced after webhook metadata issue'
    });
    
    console.log('SUCCESS: Gift updated to success status.');
  } catch (error) {
    console.error('Error syncing gift:', error);
  }
}

syncMissedGifts();
