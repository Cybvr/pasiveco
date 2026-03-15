
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const solutions = [
  {
    title: "Analytics",
    description: "Get detailed insights into your bio page performance with comprehensive analytics and reporting tools.",
    icon: "BarChart3",
    color: "blue-500",
    slug: "analytics",
    href: "/solutions/analytics",
    content: `
      <h1>Analytics & Performance Insights</h1>
      
      <p>Make data-driven decisions with comprehensive analytics that give you deep insights into your bio page performance and audience behavior.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Real-time Visitor Tracking:</strong> Monitor live traffic and engagement on your bio page</li>
        <li><strong>Link Click Analytics:</strong> Track which links get the most clicks and engagement</li>
        <li><strong>Geographic Insights:</strong> See where your visitors are coming from worldwide</li>
        <li><strong>Device & Browser Analytics:</strong> Understand your audience's technical preferences</li>
        <li><strong>Traffic Sources:</strong> Identify which platforms drive the most traffic</li>
        <li><strong>Time-based Reports:</strong> Analyze performance trends over time</li>
        <li><strong>Custom Goals:</strong> Set and track conversion goals for your links</li>
        <li><strong>Export & Sharing:</strong> Download reports and share insights with your team</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Content creators tracking their reach</li>
        <li>Businesses measuring marketing campaigns</li>
        <li>Influencers optimizing their bio links</li>
        <li>Marketers analyzing audience behavior</li>
        <li>Brands measuring social media ROI</li>
      </ul>
      
      <p>Transform your bio page into a powerful marketing tool with actionable insights that help you grow your audience and optimize your content strategy.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "QR Code Generator",
    description: "Create beautiful, customizable QR codes that link directly to your bio page for seamless offline-to-online experiences.",
    icon: "QrCode",
    color: "purple-500",
    slug: "qr-codes",
    href: "/solutions/qr-codes",
    content: `
      <h1>Smart QR Code Solutions</h1>
      
      <p>Bridge the gap between offline and online experiences with beautiful, customizable QR codes that drive traffic to your bio page.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Custom Design Options:</strong> Personalize colors, shapes, and add your logo</li>
        <li><strong>High-Resolution Output:</strong> Perfect for print materials and digital displays</li>
        <li><strong>Dynamic QR Codes:</strong> Update destinations without reprinting codes</li>
        <li><strong>Bulk Generation:</strong> Create multiple QR codes for different campaigns</li>
        <li><strong>Scan Analytics:</strong> Track when and where your codes are scanned</li>
        <li><strong>Multiple Formats:</strong> Download as PNG, SVG, or PDF</li>
        <li><strong>Error Correction:</strong> Ensure scannability even with minor damage</li>
        <li><strong>Campaign Tracking:</strong> Monitor performance across different marketing materials</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Business cards and networking materials</li>
        <li>Restaurant menus and table tents</li>
        <li>Event flyers and promotional materials</li>
        <li>Product packaging and labels</li>
        <li>Store displays and signage</li>
        <li>Conference badges and presentations</li>
      </ul>
      
      <p>Make it easy for people to connect with you in the real world by seamlessly directing them to your digital presence.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "Link in Bio",
    description: "Transform your single bio link into a powerful landing page that showcases all your important links and content.",
    icon: "Link",
    color: "green-500",
    slug: "link-in-bio",
    href: "/solutions/link-in-bio",
    content: `
      <h1>Ultimate Link in Bio Solution</h1>
      
      <p>Replace that single link in your bio with a powerful, customizable landing page that showcases all your content, products, and services in one place.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Unlimited Links:</strong> Add as many links as you need without restrictions</li>
        <li><strong>Custom Branding:</strong> Match your brand colors, fonts, and style</li>
        <li><strong>Rich Media Support:</strong> Add images, videos, and interactive content</li>
        <li><strong>Smart Organization:</strong> Group links by categories and priorities</li>
        <li><strong>Social Media Integration:</strong> Connect all your social platforms</li>
        <li><strong>Mobile Optimized:</strong> Perfect experience on all devices</li>
        <li><strong>SEO Friendly:</strong> Optimize your page for search engines</li>
        <li><strong>Custom Domains:</strong> Use your own domain for professional branding</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Instagram influencers and creators</li>
        <li>TikTok content creators</li>
        <li>Musicians and artists</li>
        <li>Coaches and consultants</li>
        <li>E-commerce businesses</li>
        <li>Podcasters and YouTubers</li>
      </ul>
      
      <p>Maximize your social media presence by giving your audience easy access to everything you offer through one powerful link.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "E-commerce Integration",
    description: "Sell products directly from your bio page with built-in e-commerce features and payment processing.",
    icon: "ShoppingCart",
    color: "orange-500",
    slug: "ecommerce",
    href: "/solutions/ecommerce",
    content: `
      <h1>Complete E-commerce Solution</h1>
      
      <p>Turn your bio page into a powerful sales platform with integrated e-commerce features that make it easy to sell products and services directly to your audience.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Product Showcase:</strong> Display products with high-quality images and descriptions</li>
        <li><strong>Secure Payments:</strong> Accept payments through Stripe, PayPal, and more</li>
        <li><strong>Inventory Management:</strong> Track stock levels and manage product variants</li>
        <li><strong>Order Processing:</strong> Automated order fulfillment and customer notifications</li>
        <li><strong>Digital Downloads:</strong> Sell digital products with instant delivery</li>
        <li><strong>Subscription Products:</strong> Set up recurring payments for services</li>
        <li><strong>Discount Codes:</strong> Create promotional campaigns and special offers</li>
        <li><strong>Customer Support:</strong> Built-in messaging and support tools</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Artists selling prints and merchandise</li>
        <li>Coaches offering courses and consultations</li>
        <li>Musicians selling albums and merchandise</li>
        <li>Photographers offering prints and services</li>
        <li>Content creators monetizing their audience</li>
        <li>Small businesses expanding online presence</li>
      </ul>
      
      <p>Start selling immediately with zero setup fees and keep more of your earnings with our competitive transaction rates.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center"
  },
  {
    title: "AI-Powered Features",
    description: "Leverage artificial intelligence to optimize your bio page performance and automate content creation.",
    icon: "Brain",
    color: "indigo-500",
    slug: "ai-features",
    href: "/solutions/ai-features",
    content: `
      <h1>AI-Powered Bio Optimization</h1>
      
      <p>Harness the power of artificial intelligence to create, optimize, and automate your bio page for maximum engagement and conversions.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li><strong>Smart Content Generation:</strong> AI-generated bio descriptions and link titles</li>
        <li><strong>Performance Optimization:</strong> AI recommendations for improving engagement</li>
        <li><strong>Automated A/B Testing:</strong> Test different versions and automatically optimize</li>
        <li><strong>Intelligent Scheduling:</strong> AI-powered optimal posting times</li>
        <li><strong>Chatbot Integration:</strong> Automated customer support and lead qualification</li>
        <li><strong>Personalization Engine:</strong> Dynamic content based on visitor behavior</li>
        <li><strong>Trend Analysis:</strong> AI insights into content trends and opportunities</li>
        <li><strong>SEO Optimization:</strong> Automated keyword optimization and meta tags</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Busy entrepreneurs automating their presence</li>
        <li>Marketing teams scaling content creation</li>
        <li>Influencers optimizing engagement rates</li>
        <li>E-commerce brands personalizing experiences</li>
        <li>Service providers automating lead generation</li>
        <li>Content creators maximizing reach</li>
      </ul>
      
      <p>Let AI handle the optimization while you focus on creating amazing content and building relationships with your audience.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center"
  }
];

async function migrateSolutions() {
  console.log('Starting solutions migration...');
  
  try {
    for (const solution of solutions) {
      console.log(`Migrating solution: ${solution.title}`);
      await addDoc(collection(db, 'solutions'), solution);
      console.log(`✅ Successfully migrated: ${solution.title}`);
    }
    
    console.log('🎉 All solutions migrated successfully!');
  } catch (error) {
    console.error('❌ Error migrating solutions:', error);
  }
}

migrateSolutions();
