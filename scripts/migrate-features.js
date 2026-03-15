
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

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

// Features data from websiteData.ts
const featuresData = [
  {
    title: "Easy Setup",
    description: "Get your store running in minutes with our intuitive setup process",
    icon: "Zap",
    href: "/features/easy-setup",
    slug: "easy-setup",
    content: "Our platform is designed with simplicity in mind. With our step-by-step setup wizard, you can have your online store up and running in just minutes. No technical expertise required - just follow our guided process and start selling immediately.",
    featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&crop=center"
  },
  {
    title: "Global Payments",
    description: "Accept payments from customers worldwide with multiple payment options",
    icon: "CreditCard",
    href: "/features/global-payments",
    slug: "global-payments",
    content: "Expand your reach globally with our comprehensive payment system. Accept payments from customers anywhere in the world through multiple payment methods including credit cards, digital wallets, and local payment options. Our secure payment processing ensures both you and your customers can transact with confidence.",
    featuredImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center"
  },
  {
    title: "Analytics & Insights",
    description: "Track your sales performance with detailed analytics and reporting",
    icon: "BarChart3",
    href: "/features/analytics-insights",
    slug: "analytics-insights",
    content: "Make data-driven decisions with our comprehensive analytics dashboard. Track your sales performance, understand customer behavior, monitor traffic patterns, and identify growth opportunities. Our detailed reporting helps you optimize your business strategy and maximize revenue.",
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
  },
  {
    title: "24/7 Support",
    description: "Get help whenever you need it with our dedicated support team",
    icon: "MessageCircle",
    href: "/features/support",
    slug: "support",
    content: "Never feel alone on your entrepreneurial journey. Our dedicated support team is available around the clock to help you with any questions or challenges you might face. Whether it's technical support, business advice, or troubleshooting, we're here to ensure your success.",
    featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=center"
  }
];

async function migrateFeatures() {
  try {
    console.log('Starting features migration...');
    
    for (const feature of featuresData) {
      console.log(`Migrating feature: ${feature.title}`);
      
      // Create document with custom ID based on slug
      await setDoc(doc(db, 'features', feature.slug), {
        title: feature.title,
        description: feature.description,
        href: feature.href,
        slug: feature.slug,
        icon: feature.icon,
        content: feature.content,
        featuredImage: feature.featuredImage,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Successfully migrated: ${feature.title}`);
    }
    
    console.log('🎉 All features migrated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error migrating features:', error);
    process.exit(1);
  }
}

migrateFeatures();
