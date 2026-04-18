
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function audit() {
  console.log("--- USER IDENTITY AUDIT ---");
  const users = await getDocs(collection(db, 'users'));
  let totalUsers = 0;
  let missingUsername = 0;
  let missingSlug = 0;
  let mismatch = 0;

  users.forEach(doc => {
    totalUsers++;
    const data = doc.data();
    if (!data.username) missingUsername++;
    if (!data.slug) missingSlug++;
    if (data.username && data.slug && data.username !== data.slug) {
      mismatch++;
      console.log(`[Mismatch] User ${doc.id}: username="${data.username}", slug="${data.slug}"`);
    }
  });

  console.log(`Total Users: ${totalUsers}`);
  console.log(`Missing username: ${missingUsername}`);
  console.log(`Missing slug: ${missingSlug}`);
  console.log(`Username/Slug mismatches: ${mismatch}`);

  console.log("\n--- PRODUCT IDENTITY AUDIT ---");
  const products = await getDocs(collection(db, 'products'));
  let totalProducts = 0;
  let missingProdSlug = 0;

  products.forEach(doc => {
    totalProducts++;
    const data = doc.data();
    if (!data.slug) {
      missingProdSlug++;
      console.log(`[Missing Slug] Product ${doc.id}: name="${data.name}"`);
    }
  });

  console.log(`Total Products: ${totalProducts}`);
  console.log(`Products without slugs: ${missingProdSlug}`);
}

audit();
