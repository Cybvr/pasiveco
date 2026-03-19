
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo user ID
const DEMO_USER_ID = 'mdBW2iIUy2diyIrnK55s';

// Demo profile data
const demoProfile = {
  userId: DEMO_USER_ID,
  username: 'fintech-demo',
  displayName: 'Fintech Demo User',
  bio: 'Passionate about fintech innovation and helping others succeed in the digital economy.',
  profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b13c?w=150&h=150&fit=crop&crop=face',
  isPublic: true,
  links: [
    {
      id: '1',
      title: 'Nigerian Fintech Playbook',
      url: 'https://fintechplaybook.ng',
      type: 'link'
    },
    {
      id: '2', 
      title: '1-on-1 App Dev Session',
      url: 'https://calendly.com/appdev-session',
      type: 'link'
    },
    {
      id: '3',
      title: 'Payments Setup Guide',
      url: 'https://paymentsetup.guide',
      type: 'link'
    },
    {
      id: '4',
      title: 'Designing with Cursor',
      url: 'https://cursor.design/course',
      type: 'link'
    }
  ],
  socialLinks: [
    {
      id: '1',
      platform: 'Twitter',
      url: 'https://twitter.com/fintechdemo',
      active: true
    },
    {
      id: '2', 
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/fintechdemo',
      active: true
    },
    {
      id: '3',
      platform: 'Instagram',
      url: '',
      active: false
    }
  ],
  theme: 'default',
  appearance: {
    buttonShape: 'rounded',
    fontFamily: 'inter',
    fontSize: 'medium',
    buttonSize: 'medium',
    buttonColor: '#000000',
    textColor: '#333333'
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
};

// Demo products data
const demoProducts = [
  {
    userId: DEMO_USER_ID,
    name: 'Fintech API Gateway',
    description: 'A comprehensive API gateway solution for fintech applications with built-in security, rate limiting, and analytics.',
    price: 99.99,
    currency: 'USD',
    category: 'Software',
    url: 'https://github.com/demo/fintech-api-gateway',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
    status: 'active',
    tags: ['fintech', 'api', 'gateway', 'security'],
    inventory: {
      quantity: 0,
      trackInventory: false
    },
    shipping: {
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      shippingRequired: false
    },
    seo: {
      title: 'Fintech API Gateway - Secure & Scalable',
      description: 'Professional API gateway solution for fintech applications',
      keywords: ['fintech', 'api', 'gateway', 'security', 'payments']
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: DEMO_USER_ID,
    name: 'Crypto Trading Bot',
    description: 'Automated cryptocurrency trading bot with advanced algorithms and risk management features.',
    price: 299.99,
    currency: 'USD', 
    category: 'Software',
    url: 'https://github.com/demo/crypto-trading-bot',
    images: ['https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=150&fit=crop',
    status: 'active',
    tags: ['crypto', 'trading', 'bot', 'automation'],
    inventory: {
      quantity: 0,
      trackInventory: false
    },
    shipping: {
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      shippingRequired: false
    },
    seo: {
      title: 'Crypto Trading Bot - Automated Trading',
      description: 'Advanced cryptocurrency trading bot with AI-powered algorithms',
      keywords: ['crypto', 'trading', 'bot', 'automation', 'bitcoin']
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: DEMO_USER_ID,
    name: 'Budgeting Mobile App',
    description: 'Beautiful and intuitive mobile app for personal budgeting and expense tracking with AI insights.',
    price: 4.99,
    currency: 'USD',
    category: 'Mobile App',
    url: 'https://apps.apple.com/app/budget-tracker-demo',
    images: ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop'],
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=150&fit=crop',
    status: 'active',
    tags: ['budgeting', 'mobile', 'finance', 'tracking'],
    inventory: {
      quantity: 0,
      trackInventory: false
    },
    shipping: {
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      shippingRequired: false
    },
    seo: {
      title: 'Budget Tracker - Personal Finance App',
      description: 'Smart budgeting app with AI-powered insights for better financial health',
      keywords: ['budgeting', 'finance', 'mobile', 'tracking', 'expenses']
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');
    
    console.log('📝 Creating demo user document...');
    await setDoc(doc(db, 'users', DEMO_USER_ID), {
      email: 'demo@pasive.co',
      emailVerified: true,
      isActive: true,
      isAdmin: false,
      role: 'user',
      metadata: { signUpMethod: 'email' },
      ...demoProfile,
    }, { merge: true });
    console.log('✅ Demo user document created successfully');
    
    // Create products
    console.log('📦 Creating demo products...');
    for (let i = 0; i < demoProducts.length; i++) {
      const product = demoProducts[i];
      const productId = `demo-product-${DEMO_USER_ID}-${i + 1}`;
      await setDoc(doc(db, 'products', productId), product);
      console.log(`✅ Created product: ${product.name}`);
    }
    
    console.log('🎉 Demo data seeding completed successfully!');
    console.log(`📋 Summary:`);
    console.log(`   - User ID: ${DEMO_USER_ID}`);
    console.log(`   - User created with username: ${demoProfile.username}`);
    console.log(`   - ${demoProfile.links.length} links added`);
    console.log(`   - ${demoProducts.length} products created`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDemoData();
