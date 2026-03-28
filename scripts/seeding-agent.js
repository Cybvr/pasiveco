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
      // Find communities matching agent's niche
      const matchingCommunities = communities.filter(c => c.category === agent.category);

      for (const community of matchingCommunities) {
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

      const prompt = `You are a Nigerian creator named ${agent.displayName} in the ${agent.category} niche. 
      Write a short, engaging, human-sounding community post (max 200 characters) for your members in "${community.name}". 
      Use natural Nigerian slang or cultural references (e.g., "Oshey", "Abeg", "Steady winning", "The hustle is real", "No shaking").
      Make it feel authentic and conversational.
      
      Return ONLY the post text without any quotes or formatting.`;

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
  
  process.exit(0);
})();
