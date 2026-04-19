const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Check Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing');
  process.exit(1);
}

// Initialize Firebase Admin
let serviceAccount;
try {
  if (SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
  } else {
    // Fallback to individual env vars used in other scripts
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Incomplete Firebase credentials');
  }

  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// CLI Arguments
const args = process.argv.slice(2);

function slugifyText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function pickClippingAgent(agents) {
  const preferredCategories = ['marketing', 'technology', 'media', 'business', 'creator'];

  for (const category of preferredCategories) {
    const match = agents.find((agent) => String(agent.category || '').toLowerCase() === category);
    if (match) return match;
  }

  return agents[0] || null;
}

async function seedClippingSpaceAndProducts() {
  console.log('🎬 Seeding a clipping-focused space and product catalog...');

  try {
    const agentsSnap = await db.collection('users').where('isAgent', '==', true).get();

    if (agentsSnap.empty) {
      console.log('⚠️ No seed agents found. Run --create first.');
      return;
    }

    const agents = agentsSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    const agent = pickClippingAgent(agents);

    if (!agent) {
      console.log('⚠️ No eligible agent found.');
      return;
    }

    const creatorName = agent.displayName || 'Clipping Creator';
    const creatorUsername = String(agent.username || '').replace(/^@/, '') || 'creator';
    const creatorSlug = String(agent.slug || creatorUsername || '').replace(/^@/, '') || creatorUsername;
    const creatorPhoto = agent.photoURL || null;

    await db.collection('users').doc(agent.uid).set({
      bio: 'Helping creators and brands turn long-form videos into short-form clips that drive reach, views, and sales.',
      category: agent.category || 'Marketing',
      updatedAt: Timestamp.now(),
    }, { merge: true });

    const communityId = `seed-clipping-space-${agent.uid}`;
    const communitySlug = `clipping-growth-lab-${slugifyText(creatorUsername || agent.uid).slice(0, 24)}`;
    const communityData = {
      name: 'Clipping Growth Lab',
      description: 'A space for creators, editors, and operators building short-form clipping systems that turn podcasts, streams, and interviews into repeatable distribution.',
      creatorId: agent.uid,
      creatorName,
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1080',
      bannerImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1080',
      category: 'Marketing',
      privacy: 'public',
      memberCount: 1,
      price: 0,
      currency: 'USD',
      isPaid: false,
      slug: communitySlug,
      tags: ['clipping', 'short-form', 'content-marketing', 'distribution'],
      updatedAt: Timestamp.now(),
    };

    const communityRef = db.collection('communities').doc(communityId);
    const communitySnapshot = await communityRef.get();

    await communityRef.set({
      ...communityData,
      createdAt: communitySnapshot.exists ? communitySnapshot.data().createdAt || Timestamp.now() : Timestamp.now(),
    }, { merge: true });

    await db.collection('communityMembers').doc(`${communityId}_${agent.uid}`).set({
      communityId,
      userId: agent.uid,
      role: 'admin',
      joinedAt: Timestamp.now(),
    }, { merge: true });

    const introPostId = `seed-clipping-intro-${agent.uid}`;
    await db.collection('posts').doc(introPostId).set({
      authorId: agent.uid,
      communityId,
      message: 'Clipping is the workflow of turning long-form content into short-form videos that can be redistributed across TikTok, Reels, and Shorts. In this space, we break down hooks, payout models, editing SOPs, and content systems that actually scale.',
      category: 'Marketing',
      authorName: creatorName,
      authorUsername: creatorUsername,
      authorSlug: creatorSlug,
      authorImage: creatorPhoto,
      createdAt: Timestamp.now(),
    }, { merge: true });

    const clippingProducts = [
      {
        id: `seed-clipping-product-${agent.uid}-starter-kit`,
        name: 'Clipping Starter Kit',
        description: 'A ready-to-use digital download with clipping workflow SOPs, hook templates, clip scorecards, and posting checklists for short-form distribution.',
        price: 29,
        category: 'digital-download',
        tags: ['clipping', 'templates', 'sop', 'short-form'],
        details: {
          fileName: 'clipping-starter-kit.zip',
          fileUrl: '',
        },
        seo: {
          title: 'Clipping Starter Kit',
          description: 'Templates, SOPs, and checklists for launching a clipping workflow.',
          keywords: ['clipping', 'short-form content', 'distribution', 'templates'],
        },
      },
      {
        id: `seed-clipping-product-${agent.uid}-bootcamp`,
        name: 'Clipping Systems Bootcamp',
        description: 'A course for creators and teams who want to build a repeatable clipping operation with better hooks, review loops, and creator briefs.',
        price: 149,
        category: 'courses',
        tags: ['clipping', 'course', 'content-ops', 'growth'],
        details: {
          lessons: [
            { title: 'What clipping is and how the model works' },
            { title: 'Finding moments worth clipping' },
            { title: 'Briefing editors and measuring performance' },
          ],
        },
        seo: {
          title: 'Clipping Systems Bootcamp',
          description: 'Learn how to run short-form clipping as a repeatable growth engine.',
          keywords: ['clipping course', 'content distribution', 'short-form growth'],
        },
      },
      {
        id: `seed-clipping-product-${agent.uid}-audit`,
        name: '1:1 Clipping Workflow Audit',
        description: 'A private booking session to review your current content pipeline, clip quality, distribution strategy, and monetization opportunities.',
        price: 250,
        category: 'booking',
        tags: ['clipping', 'audit', 'consulting', 'workflow'],
        details: {
          sessionLength: 60,
          locationType: 'zoom',
          locationDetail: 'https://zoom.us/j/example',
          availability: [
            { day: 'Monday', start: '10:00', end: '15:00' },
            { day: 'Thursday', start: '12:00', end: '16:00' },
          ],
        },
        seo: {
          title: '1:1 Clipping Workflow Audit',
          description: 'Personalized review of your short-form clipping workflow and growth opportunities.',
          keywords: ['clipping audit', 'content workflow', 'short-form consultant'],
        },
      },
    ];

    for (const product of clippingProducts) {
      const productRef = db.collection('products').doc(product.id);
      const productSnapshot = await productRef.get();

      await productRef.set({
        userId: agent.uid,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: 'USD',
        category: product.category,
        url: '',
        images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1080'],
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1080',
        status: 'active',
        tags: product.tags,
        details: product.details,
        inventory: {
          quantity: 999,
          trackInventory: false,
        },
        shipping: {
          weight: 0,
          dimensions: { length: 0, width: 0, height: 0 },
          shippingRequired: false,
        },
        seo: product.seo,
        slug: `${slugifyText(product.name)}-${slugifyText(creatorUsername || agent.uid).slice(0, 18)}`,
        updatedAt: Timestamp.now(),
        createdAt: productSnapshot.exists ? productSnapshot.data().createdAt || Timestamp.now() : Timestamp.now(),
      }, { merge: true });
    }

    console.log(`✅ Assigned clipping business to @${creatorUsername}`);
    console.log(`   - Space: ${communityData.name}`);
    console.log(`   - Intro post: created`);
    console.log(`   - Products: ${clippingProducts.length} ready`);
  } catch (error) {
    console.error('❌ Failed to seed clipping space/products:', error);
  }
}

/**
 * 1. ACCOUNT CREATION
 * Persona Generation: Use Gemini to generate realistic Nigerian names, niches, and bios.
 * Firebase Auth: Create accounts via Admin SDK.
 * Firestore: Write directly to the users collection.
 */
async function createAgents() {
  console.log('🚀 Synchronizing categories and generating personas...');

  try {
    // Dynamically fetch available categories from existing communities
    const commsSnap = await db.collection('communities').get();
    const activeCategories = Array.from(new Set(commsSnap.docs.map(d => d.data().category).filter(Boolean)));
    
    if (activeCategories.length === 0) activeCategories.push('Finance', 'Technology', 'Marketing');

    const prompt = `Generate 5 realistic Nigerian creator personas for a social/community platform. 
    Each persona MUST be assigned ONE of these exact categories: ${JSON.stringify(activeCategories)}.
    
    Each should have:
    - displayName: A full Nigerian name (e.g. Tunde Balogun, Amaka Okafor).
    - username: A unique, trendy handle (lowercase, no spaces, e.g. @tunde_creatives).
    - bio: A short, engaging influencer-style bio (max 150 chars).
    - category: One of the provided categories.
    - email: A unique placeholder email ending in @pasive.co.
    
    Return ONLY a JSON array of objects without any markdown formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Clean potential markdown code blocks
    const cleanJson = text.replace(/```json|```/g, '');
    const personas = JSON.parse(cleanJson);

    for (const persona of personas) {
      try {
        const usernameWithoutAt = persona.username.replace('@', '');
        const photoURL = `https://api.dicebear.com/9.x/glass/svg?seed=${usernameWithoutAt}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        
        // Create Auth User
        const userRecord = await auth.createUser({
          email: persona.email,
          displayName: persona.displayName,
          password: 'password123', // Default password for agents
          photoURL: photoURL,
          emailVerified: true
        });

        // Write to Firestore users collection
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: persona.email,
          displayName: persona.displayName,
          username: usernameWithoutAt,
          bio: persona.bio,
          category: persona.category,
          photoURL: photoURL,
          isAgent: true, // Marker for seeding agent
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        console.log(`✅ Created Agent: ${persona.displayName} (@${usernameWithoutAt})`);
      } catch (error) {
        console.error(`❌ Error creating agent ${persona.displayName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Persona generation failed:', error);
  }
}

/**
 * 2. JOIN COMMUNITIES
 * Matching: Fetch all communities and assign agents to those matching their category.
 * Membership: Create a document in communityMembers with ID format ${communityId}_${userId}.
 * Updates: Increment memberCount on the corresponding communities document.
 */
async function joinCommunities() {
  console.log('🔗 Matching agents to communities...');

  try {
    const agentsSnap = await db.collection('users').where('isAgent', '==', true).get();
    const communitiesSnap = await db.collection('communities').get();

    if (agentsSnap.empty) {
      console.log('⚠️ No agents found. Run --create first.');
      return;
    }

    const agents = agentsSnap.docs.map(doc => doc.data());
    const communities = communitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const agent of agents) {
      // Allow agents to join ALL communities
      for (const community of communities) {
        const memberId = `${community.id}_${agent.uid}`;
        const memberRef = db.collection('communityMembers').doc(memberId);
        const memberDoc = await memberRef.get();

        if (!memberDoc.exists) {
          console.log(`👤 Agent @${agent.username} joining ${community.name}...`);
          
          await db.runTransaction(async (transaction) => {
            transaction.set(memberRef, {
              communityId: community.id,
              userId: agent.uid,
              role: 'member',
              joinedAt: Timestamp.now()
            });

            transaction.update(db.collection('communities').doc(community.id), {
              memberCount: FieldValue.increment(1),
              updatedAt: Timestamp.now()
            });
          });

          console.log(`   ✅ Joined!`);
        }
      }
    }
    console.log('🎉 Join process completed.');
  } catch (error) {
    console.error('❌ Join communities failed:', error);
  }
}

/**
 * 3. DAILY ACTIVITY
 * Context: For each agent, pick one of their joined communities.
 * Content: Call Gemini API to generate a realistic human-sounding post for that niche.
 * Interaction: Write to the posts collection.
 * Timing: Randomize timing between 8am-10pm WAT.
 */
async function runActivity() {
  console.log('📝 Generating daily activity...');

  // Timing check: 8am-10pm WAT (Lagos)
  const now = new Date();
  const lagosTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Lagos"}));
  const hour = lagosTime.getHours();

  // Timing check: 8am-10pm WAT (Lagos)
  if (hour < 8 || hour > 22) {
    console.log(`🕒 Currently ${lagosTime.toLocaleTimeString()} WAT. Outside active window (8am-10pm).`);
    console.log('   Skipping activity for now.');
    return;
  }

  try {
    const agentsSnap = await db.collection('users').where('isAgent', '==', true).get();
    
    for (const agentDoc of agentsSnap.docs) {
      const agent = agentDoc.data();
      
      // Get joined communities
      const membershipsSnap = await db.collection('communityMembers').where('userId', '==', agent.uid).get();
      if (membershipsSnap.empty) {
        console.log(`⚠️ Agent @${agent.username} has not joined any communities.`);
        continue;
      }

      // Pick one random joined community
      const randomMembership = membershipsSnap.docs[Math.floor(Math.random() * membershipsSnap.docs.length)].data();
      const communityDoc = await db.collection('communities').doc(randomMembership.communityId).get();
      if (!communityDoc.exists) continue;
      
      const community = communityDoc.data();

      console.log(`✍️ @${agent.username} is writing to ${community.name}...`);

      const prompt = `You are a professional but casual community member named ${agent.displayName}. You have expertise or interest in the ${agent.category} niche. 
      Write a highly relevant, thoughtful, and human-sounding discussion starter or comment (max 200 characters) for the specific community "${community.name}".
      DO NOT use overly generic phrases like "hustle", "steady winning", or excessive emojis. Focus entirely on a realistic topic that would actually be discussed in the "${community.name}" community. Ask a genuine question or share a practical tip.
      
      Return ONLY the post text without any quotes, hashtags, or formatting.`;

      const result = await model.generateContent(prompt);
      const postContent = result.response.text().trim().replace(/^"|"$/g, '');

      // Write to posts collection
      await db.collection('posts').add({
        authorId: agent.uid,
        communityId: communityDoc.id,
        message: postContent,
        category: agent.category,
        authorName: agent.displayName,
        authorUsername: agent.username,
        authorImage: agent.photoURL || null,
        createdAt: Timestamp.now()
      });

      console.log(`   ✅ Posted: "${postContent}"`);
    }
    console.log('🎉 Activity wave completed!');
  } catch (error) {
    console.error('❌ Activity generation failed:', error);
  }
}

/**
 * 4. DAILY REVIEWS
 * Context: For each agent, pick one of their joined communities.
 * Check if they haven't reviewed it already.
 * Call Gemini API to generate a realistic review.
 * Write to the reviews collection and update the community's rating.
 */
async function runReviews() {
  console.log('⭐️ Generating community reviews...');
  try {
    const agentsSnap = await db.collection('users').where('isAgent', '==', true).get();
    
    for (const agentDoc of agentsSnap.docs) {
      const agent = agentDoc.data();
      
      const membershipsSnap = await db.collection('communityMembers').where('userId', '==', agent.uid).get();
      if (membershipsSnap.empty) continue;

      // Pick one random joined community
      const randomMembership = membershipsSnap.docs[Math.floor(Math.random() * membershipsSnap.docs.length)].data();
      const communityDoc = await db.collection('communities').doc(randomMembership.communityId).get();
      if (!communityDoc.exists) continue;
      
      const community = communityDoc.data();

      // Check if already reviewed
      const reviewSnap = await db.collection('reviews')
        .where('targetId', '==', communityDoc.id)
        .where('targetType', '==', 'community')
        .where('userId', '==', agent.uid)
        .get();

      if (!reviewSnap.empty) {
        continue; // Skip if already reviewed
      }

      console.log(`✍️ @${agent.username} is reviewing ${community.name}...`);

      const prompt = `You are a community member named ${agent.displayName}. You have just joined "${community.name}".
      Write a realistic, positive, and human-sounding review for this community (max 150 characters).
      Do not sound overly promotional or spammy. Offer a brief word of praise or explain what you like about it.
      
      Return ONLY the review text without any quotes or formatting.`;

      const result = await model.generateContent(prompt);
      const reviewComment = result.response.text().trim().replace(/^"|"$/g, '');
      const rating = Math.floor(Math.random() * 2) + 4; // Random rating 4 or 5 (mostly positive)

      await db.runTransaction(async (transaction) => {
        const commRef = db.collection('communities').doc(communityDoc.id);
        const commDoc = await transaction.get(commRef);
        const commData = commDoc.data();

        const currentRating = commData.rating || 0;
        const currentCount = commData.reviewsCount || 0;
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        const reviewRef = db.collection('reviews').doc();
        transaction.set(reviewRef, {
          targetId: communityDoc.id,
          targetType: 'community',
          userId: agent.uid,
          userName: agent.displayName,
          userImage: agent.photoURL || null,
          rating: rating,
          comment: reviewComment,
          createdAt: Timestamp.now()
        });

        transaction.update(commRef, {
          rating: Number(newRating.toFixed(1)),
          reviewsCount: newCount,
          updatedAt: Timestamp.now()
        });
      });

      console.log(`   ✅ Reviewed: [${rating} Stars] "${reviewComment}"`);
    }
    console.log('🎉 Reviews generated!');
  } catch (error) {
    console.error('❌ Review generation failed:', error);
  }
}

// Main Execution logic
(async () => {
  if (args.length === 0) {
    console.log(`
Seeding Agent CLI
-----------------
Usage: node scripts/seeding-agent.js [flags]

Flags:
  --create    Generate Nigerian creator personas and create accounts
  --join      Match agents to communities based on category
  --activity  Generate and post daily activity (8am-10pm WAT)
  --review    Generate 4-5 star reviews from agents for communities
  --seed-clipping  Assign one seed agent a clipping-focused space, intro post, and products
    `);
    process.exit(0);
  }

  if (args.includes('--create')) {
    await createAgents();
  }
  
  if (args.includes('--join')) {
    await joinCommunities();
  }
  
  if (args.includes('--activity')) {
    await runActivity();
  }

  if (args.includes('--review')) {
    await runReviews();
  }

  if (args.includes('--seed-clipping')) {
    await seedClippingSpaceAndProducts();
  }
  
  process.exit(0);
})();
