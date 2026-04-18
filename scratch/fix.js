const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCFtyGgzxgvGNXWnh1fbDg1YysMHT67h1U",
  authDomain: "pasivezero.firebaseapp.com",
  projectId: "pasivezero",
  storageBucket: "pasivezero.firebasestorage.app",
  messagingSenderId: "617701255981",
  appId: "1:617701255981:web:011046f90fde1e97cd41a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
  const reference = 'gift_KLRoXmT4f0LovoUEznA5_1776508126502';
  console.log('Syncing reference:', reference);
  
  const q = query(collection(db, 'gifts'), where('reference', '==', reference));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    console.log('Not found');
    return;
  }
  
  await updateDoc(doc(db, 'gifts', snap.docs[0].id), {
    status: 'success',
    updatedAt: Timestamp.now()
  });
  console.log('DONE!');
  process.exit(0);
}

sync();
