const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use the private key from .env.local for firebase-admin
// The private key in .env.local has literal \n which need to be fixed
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Demo User ID from existing seed script
const CREATOR_ID = 'mdBW2iIUy2diyIrnK55s';
const CREATOR_NAME = 'Fintech Demo User';

const communities = [
  {
    name: 'Crypto Trading Strategy',
    description: 'A step-by-step guide to trading profitably with proven strategies, risk management, and market analysis.',
    price: 3000,
    localImagePath: 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4d90f0e1-6eea-4969-b9e7-8807d6e8f61c\\crypto_trading_strategy_community_1774085977788.png',
    placeholderUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1080',
    category: 'Finance',
    tags: ['crypto', 'trading', 'profit', 'investment']
  },
  {
    name: 'AI Prompt Pack',
    description: 'Ready-made, high-converting prompts for freelancers to 10x their productivity and output quality.',
    price: 5000,
    placeholderUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1080',
    category: 'Technology',
    tags: ['ai', 'prompts', 'freelancing', 'productivity']
  },
  {
    name: 'Bet9ja Prediction Templates',
    description: 'Weekly betting picks with a solid staking strategy to help you stay ahead of the game consistently.',
    price: 1500,
    placeholderUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1080',
    category: 'Sports',
    tags: ['betting', 'prediction', 'bet9ja', 'strategy']
  },
  {
    name: 'Affiliate Marketing Playbook',
    description: 'The full Expertnaire setup guide. Everything you need to start and scale your affiliate marketing business.',
    price: 4000,
    placeholderUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080',
    category: 'Marketing',
    tags: ['affiliate', 'marketing', 'expertnaire', 'passive-income']
  }
];

async function uploadToCloudinary(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Local file not found: ${filePath}`);
      return null;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'communities',
      upload_preset: 'qrtraffic' // Using the preset found in the code
    });
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return null;
  }
}

async function seedCommunities() {
  console.log('🚀 Starting community seeding...');

  for (const comm of communities) {
    let imageUrl = comm.placeholderUrl;

    if (comm.localImagePath) {
      console.log(`📸 Uploading image for ${comm.name}...`);
      const uploadedUrl = await uploadToCloudinary(comm.localImagePath);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log(`✅ Image uploaded: ${imageUrl}`);
      }
    }

    const communityData = {
      name: comm.name,
      description: comm.description,
      creatorId: CREATOR_ID,
      creatorName: CREATOR_NAME,
      image: imageUrl,
      bannerImage: imageUrl,
      category: comm.category || 'Other',
      privacy: 'public',
      memberCount: 1,
      price: comm.price,
      currency: 'NGN',
      isPaid: true,
      tags: comm.tags,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    try {
      const docRef = await db.collection('communities').add(communityData);
      console.log(`✅ Created community: ${comm.name} (ID: ${docRef.id})`);

      // Add creator as member
      await db.collection('communityMembers').doc(`${docRef.id}_${CREATOR_ID}`).set({
        communityId: docRef.id,
        userId: CREATOR_ID,
        role: 'admin',
        joinedAt: Timestamp.now()
      });
      console.log(`   - Added creator as admin member`);

    } catch (error) {
      console.error(`❌ Error creating community ${comm.name}:`, error);
    }
  }

  console.log('🎉 Seeding completed!');
  process.exit(0);
}

seedCommunities();
