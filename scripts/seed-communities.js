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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const communities = [
  {
    name: 'Socialize Active VC Server',
    description: 'A high-energy voice chat and hangout space for chill conversations, memes, anime, emotes, events, and giveaways.',
    memberCount: 1200000,
    rating: 4.0,
    reviewsCount: 7,
    placeholderUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080',
    category: 'Networking',
    tags: ['voice-chat', 'hangout', 'social', 'chill', 'anime', 'memes', 'emotes']
  },
  {
    name: 'Dadscord Active VC',
    description: 'A SFW social community for making friends, hanging out, watching anime, joining events, and staying active in VC.',
    memberCount: 1010000,
    rating: 4.1,
    reviewsCount: 1,
    placeholderUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1080',
    category: 'Networking',
    tags: ['voice-chat', 'sfw', 'anime', 'chill', 'social', 'emotes']
  },
  {
    name: 'Study Together',
    description: 'A global student community for study sessions, motivation, focus rooms, accountability, and productive routines.',
    memberCount: 976000,
    rating: 4.1,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080',
    category: 'Education',
    tags: ['study', 'students', 'focus', 'motivation', 'productivity', 'social']
  },
  {
    name: 'ChillZone Social VC',
    description: 'A fast-paced social space with active voice and text chats, anime, emotes, calls, and community hangouts.',
    memberCount: 732000,
    rating: 3.9,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080',
    category: 'Networking',
    tags: ['voice-chat', 'social', 'anime', 'emotes', 'chill', 'hangout']
  },
  {
    name: 'Live Insaan',
    description: 'A community events space with talent shows, singing events, music bots, social chat, and creator-led activities.',
    memberCount: 674000,
    rating: 4.0,
    reviewsCount: 2,
    placeholderUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1080',
    category: 'Creators',
    tags: ['community', 'events', 'fun', 'music', 'talent-show']
  },
  {
    name: 'Karuta Hub',
    description: 'A lively anime card-collection community for collectors, traders, economy chat, and anime fan discussions.',
    memberCount: 455000,
    rating: 1.9,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1080',
    category: 'Anime',
    tags: ['anime', 'collecting', 'cards', 'economy', 'community']
  },
  {
    name: 'Jets Dream World',
    description: 'A social community with active VC, anime chat, emotes, giveaways, tags, and a large Pepe and Peepo emote collection.',
    memberCount: 406000,
    rating: 4.3,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1080',
    category: 'Networking',
    tags: ['social', 'emotes', 'anime', 'voice-chat', 'chill', 'giveaways']
  },
  {
    name: 'E-Girl World',
    description: 'A social voice chat community with active calls, anime conversations, emotes, giveaways, and casual hangouts.',
    memberCount: 398000,
    rating: 3.4,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1080',
    category: 'Networking',
    tags: ['voice-chat', 'social', 'anime', 'active', 'emotes', 'chill']
  },
  {
    name: 'ChillBar Chatting',
    description: 'A social chat and voice community with anime, music, stickers, emotes, active calls, and friendly events.',
    memberCount: 396000,
    rating: 5.0,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1080',
    category: 'Networking',
    tags: ['chatting', 'voice-chat', 'anime', 'music', 'emotes', 'stickers']
  },
  {
    name: 'Chill Space',
    description: 'A fun social server for chat, memes, anime, emotes, giveaways, events, and active community conversations.',
    memberCount: 379000,
    rating: 4.4,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1080',
    category: 'Networking',
    tags: ['chat', 'social', 'memes', 'anime', 'emotes', 'events']
  },
  {
    name: 'Cozyhive',
    description: 'A definitive Pepe emote community with a huge emoji collection, casual chat, and a cozy social atmosphere.',
    memberCount: 364000,
    rating: 4.8,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080',
    category: 'Creators',
    tags: ['emoji', 'emotes', 'pepe', 'community', 'chat']
  },
  {
    name: 'FlaviBot.xyz',
    description: 'The community and support space for FlaviBot, with bot help, chill conversation, updates, and community support.',
    memberCount: 354000,
    rating: 5.0,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1080',
    category: 'Technology',
    tags: ['bot', 'support', 'chill', 'community', 'updates']
  },
  {
    name: 'Voicemod',
    description: 'A community town for Voicemod users, creators, and newcomers to connect, share ideas, and get support.',
    memberCount: 348000,
    rating: 4.0,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1080',
    category: 'Technology',
    tags: ['voice', 'audio', 'creator-tools', 'support', 'community']
  },
  {
    name: 'Koma Cafe Anime and Art',
    description: 'An active anime and art community for Genshin and Honkai fans, creative chat, emotes, events, and competitions.',
    memberCount: 319000,
    rating: 5.0,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1080',
    category: 'Anime',
    tags: ['anime', 'art', 'genshin', 'honkai', 'emotes', 'events']
  },
  {
    name: 'Sounds World',
    description: 'A partnered creator community for SoundDrout fans with fun chat, music discussion, creator updates, and events.',
    memberCount: 268000,
    rating: 3.8,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1080',
    category: 'Creators',
    tags: ['fun', 'music', 'creator', 'community', 'events']
  },
  {
    name: 'Wondx Customisation',
    description: 'A creative profile customisation community for artists, profile design, events, giveaways, and visual inspiration.',
    memberCount: 252000,
    rating: 4.0,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1080',
    category: 'Design',
    tags: ['customisation', 'profile-design', 'artists', 'events', 'giveaways']
  },
  {
    name: "Idas Anime Cafe",
    description: 'A welcoming anime and community space with friendly people, anime emotes, casual chat, and cozy social energy.',
    memberCount: 242000,
    rating: 3.3,
    reviewsCount: 0,
    placeholderUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1080',
    category: 'Anime',
    tags: ['anime', 'emotes', 'community', 'cafe', 'friendly']
  },
  {
    name: 'Social Heaven',
    description: 'An active social and anime community with voice chat, emotes, giveaways, chatting, fun events, and new people to meet.',
    memberCount: 233000,
    rating: 3.8,
    reviewsCount: 35,
    placeholderUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1080',
    category: 'Networking',
    tags: ['anime', 'chill', 'social', 'voice-chat', 'emotes', 'giveaways']
  }
];

async function uploadToCloudinary(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Local file not found: ${filePath}`);
      return null;
    }
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      throw new Error('Cloudinary upload preset is not defined');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'communities',
      upload_preset: uploadPreset
    });
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return null;
  }
}

async function deleteCommunityAndMembers(communityRef) {
  const membersSnap = await db.collection('communityMembers').where('communityId', '==', communityRef.id).get();

  for (const memberDoc of membersSnap.docs) {
    await memberDoc.ref.delete();
  }

  await communityRef.delete();
}

async function seedCommunities() {
  console.log('🚀 Starting community seeding...');

  for (const comm of communities) {
    let imageUrl = comm.placeholderUrl;
    const sourceKey = `discord-${slugify(comm.name)}`;

    if (comm.localImagePath) {
      console.log(`📸 Uploading image for ${comm.name}...`);
      const uploadedUrl = await uploadToCloudinary(comm.localImagePath);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log(`✅ Image uploaded: ${imageUrl}`);
      }
    }

    try {
      const canonicalRef = db.collection('communities').doc(sourceKey);
      const canonicalDoc = await canonicalRef.get();
      let existingDoc = canonicalDoc.exists ? canonicalDoc : null;

      if (!existingDoc) {
        const sourceSnap = await db.collection('communities').where('sourceKey', '==', sourceKey).limit(1).get();
        existingDoc = sourceSnap.empty ? null : sourceSnap.docs[0];
      }

      if (!existingDoc) {
        const nameSnap = await db.collection('communities').where('name', '==', comm.name).limit(1).get();
        existingDoc = nameSnap.empty ? null : nameSnap.docs[0];
      }

      const existingData = existingDoc?.data() || {};
      const communityData = {
        ...existingData,
        name: existingData.name || comm.name,
        description: comm.description,
        creatorId: CREATOR_ID,
        creatorName: CREATOR_NAME,
        image: imageUrl,
        bannerImage: imageUrl,
        category: comm.category || 'Other',
        privacy: 'public',
        memberCount: comm.memberCount || 1,
        sourceMemberCount: comm.memberCount || 1,
        price: comm.price || 0,
        currency: 'NGN',
        isPaid: false,
        source: 'discord-directory',
        sourceKey,
        slug: existingData.slug || `${slugify(comm.name)}-${Math.random().toString(36).substring(2, 7)}`,
        tags: comm.tags,
        rating: comm.rating || 0,
        sourceRating: comm.rating || 0,
        reviewsCount: comm.reviewsCount || 0,
        sourceReviewsCount: comm.reviewsCount || 0,
        createdAt: existingData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await canonicalRef.set(communityData, { merge: true });

      if (existingDoc && existingDoc.ref.id !== canonicalRef.id) {
        await deleteCommunityAndMembers(existingDoc.ref);
      }

      const duplicateSnaps = await Promise.all([
        db.collection('communities').where('sourceKey', '==', sourceKey).get(),
        db.collection('communities').where('name', '==', comm.name).get()
      ]);

      for (const duplicateSnap of duplicateSnaps) {
        for (const duplicateDoc of duplicateSnap.docs) {
          if (duplicateDoc.id !== canonicalRef.id) {
            await deleteCommunityAndMembers(duplicateDoc.ref);
          }
        }
      }

      if (!existingDoc) {
        console.log(`✅ Created community: ${comm.name} (ID: ${canonicalRef.id})`);
      } else {
        console.log(`✅ Updated community: ${communityData.name} (ID: ${canonicalRef.id})`);
      }

      // Add creator as member
      await db.collection('communityMembers').doc(`${canonicalRef.id}_${CREATOR_ID}`).set({
        communityId: canonicalRef.id,
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
