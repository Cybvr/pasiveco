require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch, serverTimestamp, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const SOCIAL_SEED_VERSION = 1;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const discoverUsers = [
  {
    id: 'c1',
    name: 'Lin Xia',
    niche: 'Fashion',
    handle: '@linxia',
    image: 'https://i.pravatar.cc/200?img=5',
    posts: [
      { id: 'ava-brooks-post-1', message: 'Shot a clean spring campaign today. Soft denim, white tanks, and gold hoops still do the job every single time.', createdAt: '2025-03-16T09:15:00.000Z' },
      { id: 'ava-brooks-post-2', message: 'If your outfit needs saving, add one strong jacket and stop overthinking the rest.', createdAt: '2025-03-14T18:40:00.000Z' },
    ],
  },
  {
    id: 'c2',
    name: 'Amara Okafor',
    niche: 'Fitness',
    handle: '@amaramoves',
    image: 'https://i.pravatar.cc/200?img=13',
    posts: [
      { id: 'jordan-lee-post-1', message: 'Simple push day today: incline press, weighted dips, cable flys. Nothing fancy, just volume and consistency.', createdAt: '2025-03-16T07:05:00.000Z' },
      { id: 'jordan-lee-post-2', message: 'Protein target hit before 2pm. That usually decides whether the whole day stays on track.', createdAt: '2025-03-13T14:12:00.000Z' },
    ],
  },
  {
    id: 'c3',
    name: 'Sofía Ramírez',
    niche: 'Beauty',
    handle: '@sofiaramirez',
    image: 'https://i.pravatar.cc/200?img=47',
    posts: [
      { id: 'sofia-kim-post-1', message: 'Trying a lighter skin tint this week instead of full coverage and my routine feels way less heavy on camera.', createdAt: '2025-03-15T16:30:00.000Z' },
      { id: 'sofia-kim-post-2', message: 'Best glow combo right now: hydrating toner, gel cream, then a tiny bit of balm on the high points.', createdAt: '2025-03-12T11:08:00.000Z' },
    ],
  },
  {
    id: 'c4',
    name: 'Ingrid Solberg',
    niche: 'Tech',
    handle: '@ingridsolberg',
    image: 'https://i.pravatar.cc/200?img=18',
    posts: [
      { id: 'marcus-hill-post-1', message: 'Tested three compact creator mics back to back. The cheapest one was good enough, the middle one was the sweet spot.', createdAt: '2025-03-15T10:20:00.000Z' },
      { id: 'marcus-hill-post-2', message: 'Creators do not need a bigger setup first. Better framing and cleaner audio beat more gear almost every time.', createdAt: '2025-03-11T20:45:00.000Z' },
    ],
  },
  {
    id: 'c5',
    name: 'Ananya Patel',
    niche: 'Lifestyle',
    handle: '@ananyadaily',
    image: 'https://i.pravatar.cc/200?img=32',
    posts: [
      { id: 'emily-stone-post-1', message: 'Reset the apartment in 25 minutes, made pasta, lit a candle, and suddenly the week feels manageable again.', createdAt: '2025-03-14T21:10:00.000Z' },
      { id: 'emily-stone-post-2', message: 'Tiny habit that helps: leave tomorrow morning coffee gear out before bed and stop negotiating with yourself at 7am.', createdAt: '2025-03-10T08:55:00.000Z' },
    ],
  },
  {
    id: 'c6',
    name: 'Chinedu Adeyemi',
    niche: 'Travel',
    handle: '@chinedutravel',
    image: 'https://i.pravatar.cc/200?img=67',
    posts: [
      { id: 'noah-park-post-1', message: 'Sunrise train into Kyoto was worth waking up for. Quiet platform, cold air, no crowd, perfect start.', createdAt: '2025-03-13T05:50:00.000Z' },
      { id: 'noah-park-post-2', message: 'Travel rule: book the first night somewhere easy, not somewhere impressive. Energy matters more than aesthetics on arrival.', createdAt: '2025-03-09T13:25:00.000Z' },
    ],
  },
];

const viewerProfile = {
  id: 'viewer-me',
  name: 'You',
  handle: '@you',
  username: 'you',
  image: 'https://i.pravatar.cc/200?img=12',
  category: 'Creator',
  bio: 'Building community, sharing ideas, and turning attention into income.',
  location: 'Remote',
  links: [{ id: 'viewer-link-1', title: 'Creator newsletter', url: 'https://example.com/newsletter', description: 'Weekly notes on content, growth, and monetization.' }],
  shop: [{ id: 'viewer-shop-1', name: 'Creator playbook', price: '$29', description: 'Templates and workflows for planning a month of content.', url: 'https://example.com/playbook' }],
};

const profileDetails = {
  c1: { bio: 'Editorial stylist sharing campaign notes, outfit formulas, and creative direction.', location: 'Shanghai, China', links: [{ id: 'c1-link-1', title: 'Spring capsule guide', url: 'https://example.com/linxia/capsule', description: 'My minimalist wardrobe staples for every week.' }, { id: 'c1-link-2', title: 'Brand portfolio', url: 'https://example.com/linxia/portfolio', description: 'Recent campaigns and styling work.' }], shop: [{ id: 'c1-shop-1', name: 'Styling consult', price: '$120', description: '45-minute wardrobe strategy session.', url: 'https://example.com/linxia/consult' }] },
  c2: { bio: 'Coach focused on strength, consistency, and sustainable fitness routines.', location: 'Lagos, Nigeria', links: [{ id: 'c2-link-1', title: '7-day push plan', url: 'https://example.com/amara/push-plan', description: 'Free training split to build upper-body strength.' }], shop: [{ id: 'c2-shop-1', name: 'Mobility program', price: '$35', description: 'Daily warmup and recovery guide.', url: 'https://example.com/amara/mobility' }] },
  c3: { bio: 'Beauty creator testing everyday routines, camera-friendly products, and glow combos.', location: 'Madrid, Spain', links: [{ id: 'c3-link-1', title: 'Routine breakdown', url: 'https://example.com/sofia/routine', description: 'Current skincare and makeup stack.' }], shop: [{ id: 'c3-shop-1', name: 'Makeup bag edit', price: '$22', description: 'Shoppable list of my weekly essentials.', url: 'https://example.com/sofia/bag' }] },
  c4: { bio: 'Tech reviewer helping creators choose practical tools, setups, and workflows.', location: 'Oslo, Norway', links: [{ id: 'c4-link-1', title: 'Creator setup notes', url: 'https://example.com/ingrid/setup', description: 'Audio, camera, and desk gear recommendations.' }], shop: [{ id: 'c4-shop-1', name: 'Audio buyer guide', price: '$18', description: 'Best creator microphones under every budget.', url: 'https://example.com/ingrid/audio' }] },
  c5: { bio: 'Lifestyle storyteller sharing homemaking resets, routines, and slower living ideas.', location: 'Mumbai, India', links: [{ id: 'c5-link-1', title: 'Sunday reset checklist', url: 'https://example.com/ananya/reset', description: 'The exact system I use to get back on track.' }], shop: [{ id: 'c5-shop-1', name: 'Habit tracker pack', price: '$12', description: 'Printable and digital routines for everyday life.', url: 'https://example.com/ananya/tracker' }] },
  c6: { bio: 'Travel creator documenting slow trips, practical itineraries, and smarter planning.', location: 'Nairobi, Kenya', links: [{ id: 'c6-link-1', title: 'Kyoto sunrise spots', url: 'https://example.com/chinedu/kyoto', description: 'My favorite quiet early-morning travel stops.' }], shop: [{ id: 'c6-shop-1', name: 'Carry-on planner', price: '$15', description: 'Simple trip planning sheets for frequent travel.', url: 'https://example.com/chinedu/planner' }] },
};

const baseProfiles = discoverUsers.map((user) => ({
  id: user.id,
  name: user.name,
  handle: user.handle,
  username: user.handle.replace(/^@/, ''),
  image: user.image,
  category: user.niche,
  bio: profileDetails[user.id]?.bio || `${user.niche} creator`,
  location: profileDetails[user.id]?.location || 'Remote',
  links: profileDetails[user.id]?.links || [],
  shop: profileDetails[user.id]?.shop || [],
}));

const basePostMeta = {
  'ava-brooks-post-1': { likeCount: 124, comments: [{ id: 'comment-1', authorId: 'c4', authorName: 'Ingrid Solberg', authorHandle: '@ingridsolberg', authorImage: 'https://i.pravatar.cc/200?img=18', message: 'The soft denim note is exactly what brands keep asking for right now.', createdAt: '2025-03-16T10:30:00.000Z' }] },
  'ava-brooks-post-2': { likeCount: 86, comments: [] },
  'jordan-lee-post-1': { likeCount: 98, comments: [{ id: 'comment-2', authorId: 'c5', authorName: 'Ananya Patel', authorHandle: '@ananyadaily', authorImage: 'https://i.pravatar.cc/200?img=32', message: 'Volume and consistency is the whole formula honestly.', createdAt: '2025-03-16T08:45:00.000Z' }] },
  'jordan-lee-post-2': { likeCount: 72, comments: [] },
  'sofia-kim-post-1': { likeCount: 111, comments: [{ id: 'comment-3', authorId: 'viewer-me', authorName: 'You', authorHandle: '@you', authorImage: viewerProfile.image, message: 'Love lighter routines for everyday camera days.', createdAt: '2025-03-15T17:05:00.000Z' }] },
  'sofia-kim-post-2': { likeCount: 91, comments: [] },
  'marcus-hill-post-1': { likeCount: 77, comments: [] },
  'marcus-hill-post-2': { likeCount: 68, comments: [] },
  'emily-stone-post-1': { likeCount: 120, comments: [] },
  'emily-stone-post-2': { likeCount: 84, comments: [] },
  'noah-park-post-1': { likeCount: 105, comments: [{ id: 'comment-4', authorId: 'c1', authorName: 'Lin Xia', authorHandle: '@linxia', authorImage: 'https://i.pravatar.cc/200?img=5', message: 'That sounds like the perfect train ride.', createdAt: '2025-03-13T08:10:00.000Z' }] },
  'noah-park-post-2': { likeCount: 66, comments: [] },
};

const baseThreads = [
  { id: 'thread-c1', participantId: 'c1', messages: [{ id: 'msg-c1-1', senderId: 'c1', text: 'Want to swap creator rates for a spring campaign?', createdAt: '2025-03-16T11:18:00.000Z' }, { id: 'msg-c1-2', senderId: 'viewer-me', text: 'Yes, send your brief and deliverables.', createdAt: '2025-03-16T11:22:00.000Z' }] },
  { id: 'thread-c5', participantId: 'c5', messages: [{ id: 'msg-c5-1', senderId: 'c5', text: 'Your latest post would fit our cozy-home roundup.', createdAt: '2025-03-15T19:04:00.000Z' }, { id: 'msg-c5-2', senderId: 'viewer-me', text: 'I am in. Happy to share a few images too.', createdAt: '2025-03-15T19:20:00.000Z' }] },
  { id: 'thread-c6', participantId: 'c6', messages: [{ id: 'msg-c6-1', senderId: 'c6', text: 'I have a Japan rail itinerary template if you want it.', createdAt: '2025-03-14T07:42:00.000Z' }] },
];

async function migrateSocialData() {
  const metaRef = doc(db, 'socialMeta', 'default');
  const metaSnap = await getDoc(metaRef);

  if (metaSnap.exists() && metaSnap.data().seedVersion === SOCIAL_SEED_VERSION) {
    console.log('✅ Social data already migrated.');
    return;
  }

  const batch = writeBatch(db);

  [viewerProfile, ...baseProfiles].forEach((profile) => {
    batch.set(doc(db, 'socialProfiles', profile.id), profile, { merge: true });
  });

  baseProfiles.forEach((profile) => {
    const sourceUser = discoverUsers.find((user) => user.id === profile.id);
    (sourceUser?.posts || []).forEach((post) => {
      const meta = basePostMeta[post.id] || { likeCount: 0, comments: [] };
      batch.set(doc(db, 'socialPosts', post.id), {
        authorId: profile.id,
        message: post.message,
        createdAt: post.createdAt,
        category: profile.category,
        baseLikeCount: meta.likeCount,
        likedByUserIds: [],
        comments: meta.comments,
      }, { merge: true });
    });
  });

  baseThreads.forEach((thread) => {
    batch.set(doc(db, 'socialThreads', thread.id), thread, { merge: true });
  });

  batch.set(metaRef, { seedVersion: SOCIAL_SEED_VERSION, seededAt: serverTimestamp() }, { merge: true });
  await batch.commit();
  console.log('✅ Seeded Firestore social collections: socialProfiles, socialPosts, socialThreads.');
}

migrateSocialData().catch((error) => {
  console.error('❌ Failed to migrate social data:', error);
  process.exit(1);
});
