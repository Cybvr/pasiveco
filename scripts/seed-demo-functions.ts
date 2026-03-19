import { db } from '../lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from '../services/userService';
import { Product } from '../services/productsService';

const DEMO_USER_ID = 'mdBW2iIUy2diyIrnK55s';

export const createDemoUser = async (): Promise<void> => {
  const demoUser: Omit<User, 'id' | 'userId'> = {
    email: 'demo@pasive.co',
    emailVerified: true,
    isActive: true,
    isAdmin: false,
    role: 'user',
    metadata: { signUpMethod: 'email' },
    username: 'demo-fintech-user',
    displayName: 'Demo Fintech User',
    bio: 'Fintech enthusiast, app developer, and payment systems expert. Building the future of digital finance.',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face',
    links: [
      {
        id: '1',
        title: 'Nigerian Fintech Playbook',
        url: 'https://example.com/nigerian-fintech-playbook',
        type: 'guide'
      },
      {
        id: '2',
        title: '1-on-1 App Dev Session',
        url: 'https://calendly.com/demo-user/app-development-session',
        type: 'booking'
      },
      {
        id: '3',
        title: 'Payments Setup Guide',
        url: 'https://example.com/payments-setup-guide',
        type: 'tutorial'
      },
      {
        id: '4',
        title: 'Designing with Cursor',
        url: 'https://example.com/designing-with-cursor-ai',
        type: 'course'
      }
    ],
    socialLinks: [
      {
        id: '1',
        platform: 'Twitter',
        url: 'https://twitter.com/demo_fintech_dev',
        active: true,
        thumbnail: '/images/pages/twitter.svg'
      },
      {
        id: '2',
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/demo-fintech-developer',
        active: true,
        thumbnail: '/images/pages/linkedin.svg'
      },
      {
        id: '3',
        platform: 'GitHub',
        url: 'https://github.com/demo-fintech-dev',
        active: true,
        thumbnail: '/images/pages/github.svg'
      },
      {
        id: '4',
        platform: 'Instagram',
        url: '',
        active: false,
        thumbnail: '/images/pages/instagram.svg'
      }
    ],
    theme: 'default',
    appearance: {
      buttonShape: 'rounded',
      fontFamily: 'inter',
      fontSize: 'medium',
      buttonSize: 'medium',
      buttonColor: '#1a73e8',
      textColor: '#202124'
    },
    slug: 'demo-fintech-user',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  try {
    await setDoc(doc(db, 'users', DEMO_USER_ID), demoUser, { merge: true });
    console.log('✅ Demo user created successfully');
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    throw error;
  }
};

export const createDemoProducts = async (): Promise<void> => {
  const demoProducts: Omit<Product, 'id'>[] = [
    {
      userId: DEMO_USER_ID,
      name: 'Fintech API Gateway',
      description: 'A comprehensive API gateway solution designed specifically for fintech applications. Features include built-in security, rate limiting, transaction monitoring, and real-time analytics. Perfect for startups and enterprises looking to scale their financial services.',
      price: 299.99,
      currency: 'USD',
      category: 'Fintech Software',
      url: 'https://github.com/demo-user/fintech-api-gateway',
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      status: 'active',
      tags: ['fintech', 'api-gateway', 'security', 'microservices', 'payments'],
      inventory: {
        quantity: 1,
        trackInventory: false
      },
      shipping: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shippingRequired: false
      },
      seo: {
        title: 'Fintech API Gateway - Secure & Scalable Payment Infrastructure',
        description: 'Professional API gateway solution for fintech companies with advanced security and monitoring',
        keywords: ['fintech', 'api gateway', 'payments', 'security', 'microservices', 'financial services']
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      userId: DEMO_USER_ID,
      name: 'Crypto Trading Bot',
      description: 'An intelligent cryptocurrency trading bot powered by machine learning algorithms. Supports multiple exchanges, automated trading strategies, risk management, and portfolio optimization. Includes backtesting capabilities and real-time market analysis.',
      price: 599.99,
      currency: 'USD',
      category: 'Trading Software',
      url: 'https://github.com/demo-user/crypto-trading-bot',
      images: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
      status: 'active',
      tags: ['cryptocurrency', 'trading-bot', 'machine-learning', 'automation', 'bitcoin'],
      inventory: {
        quantity: 1,
        trackInventory: false
      },
      shipping: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shippingRequired: false
      },
      seo: {
        title: 'Crypto Trading Bot - AI-Powered Automated Trading',
        description: 'Advanced cryptocurrency trading bot with ML algorithms for automated trading strategies',
        keywords: ['crypto trading', 'trading bot', 'cryptocurrency', 'automation', 'machine learning', 'bitcoin']
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      userId: DEMO_USER_ID,
      name: 'Budgeting Mobile App',
      description: 'A beautifully designed mobile application for personal budgeting and expense tracking. Features smart categorization, bill reminders, savings goals, and financial insights. Available for both iOS and Android with cloud sync capabilities.',
      price: 14.99,
      currency: 'USD',
      category: 'Mobile App',
      url: 'https://apps.apple.com/app/smart-budgeting-app',
      images: [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop'
      ],
      thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
      status: 'active',
      tags: ['budgeting', 'mobile-app', 'personal-finance', 'expense-tracking', 'savings'],
      inventory: {
        quantity: 5000,
        trackInventory: false
      },
      shipping: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shippingRequired: false
      },
      seo: {
        title: 'Smart Budgeting Mobile App - Personal Finance Management',
        description: 'Beautiful mobile app for budgeting, expense tracking, and financial goal management',
        keywords: ['budgeting app', 'expense tracker', 'personal finance', 'mobile app', 'money management', 'savings']
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ];

  try {
    for (let i = 0; i < demoProducts.length; i++) {
      const product = demoProducts[i];
      const productId = `demo-product-fintech-${i + 1}`;
      await setDoc(doc(db, 'products', productId), product);
      console.log(`✅ Created product: ${product.name}`);
    }
    console.log('✅ All demo products created successfully');
  } catch (error) {
    console.error('❌ Error creating demo products:', error);
    throw error;
  }
};

export const seedAllDemoData = async (): Promise<void> => {
  console.log('🌱 Starting complete demo data seeding...');

  try {
    await createDemoUser();
    await createDemoProducts();

    console.log('🎉 Complete demo data seeding finished successfully!');
    console.log(`📋 Summary for user ${DEMO_USER_ID}:`);
    console.log('   - ✅ User document with 4 featured links');
    console.log('   - ✅ 3 fintech products created');
    console.log('   - ✅ Social media links configured');
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
};
