
// Fix Stripe customer to Firebase user connections
const { db } = require('./lib/firebase');
const { stripe } = require('./lib/stripe');
const { collection, getDocs, doc, getDoc, updateDoc, where, query } = require('firebase/firestore');

async function syncStripeCustomers() {
  console.log('Starting Stripe customer synchronization...');
  let fixedConnections = 0;
  
  try {
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log(`Found ${usersSnapshot.size} users in Firestore`);
    
    // Loop through each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Only process users with email addresses
      if (!userData.email) {
        console.log(`User ${userId} has no email, skipping`);
        continue;
      }
      
      console.log(`Processing user ${userId} (${userData.email})`);
      
      // Check if user already has a stripeCustomerId
      if (userData.stripeCustomerId) {
        console.log(`User has Stripe ID: ${userData.stripeCustomerId}, verifying...`);
        
        try {
          // Verify this customer exists in Stripe
          const customer = await stripe.customers.retrieve(userData.stripeCustomerId);
          
          // Check if customer metadata has the correct userId
          if (!customer.metadata.userId || customer.metadata.userId !== userId) {
            console.log(`Updating Stripe customer ${userData.stripeCustomerId} metadata with userId ${userId}`);
            await stripe.customers.update(userData.stripeCustomerId, {
              metadata: { userId: userId }
            });
            fixedConnections++;
          }
        } catch (error) {
          console.error(`Error verifying Stripe customer: ${error.message}`);
          
          // Customer might not exist, so let's search by email
          await findAndFixByEmail(userData.email, userId);
        }
      } else {
        // No Stripe ID, search by email
        await findAndFixByEmail(userData.email, userId);
      }
    }
    
    console.log(`Stripe customer synchronization complete. Fixed ${fixedConnections} connections.`);
  } catch (error) {
    console.error('Synchronization error:', error);
  }
}

async function findAndFixByEmail(email, userId) {
  console.log(`Searching Stripe for customer with email: ${email}`);
  
  try {
    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({ email: email });
    
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      console.log(`Found Stripe customer: ${customer.id}`);
      
      // Update Stripe customer metadata
      await stripe.customers.update(customer.id, {
        metadata: { userId: userId }
      });
      
      // Update user in Firestore
      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customer.id
      });
      
      console.log(`Fixed connection for user ${userId} and Stripe customer ${customer.id}`);
      return true;
    } else {
      console.log(`No Stripe customer found for email ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`Error searching Stripe by email: ${error.message}`);
    return false;
  }
}

// Run the sync function
syncStripeCustomers();
