
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blogPosts = [
  {
    title: "Getting Started with Pasive: Create Your Link-in-Bio Page",
    content: `
      <h1>Getting Started with Pasive</h1>
      
      <p>Welcome to Pasive, the ultimate platform for creators to build stunning link-in-bio pages that convert visitors into customers. In this guide, we'll walk you through creating your first page.</p>
      
      <h2>Setting Up Your Profile</h2>
      <p>The first step is to create your profile. Head to your dashboard and click on "Edit Profile" to get started.</p>
      
      <h3>Key Elements</h3>
      <ul>
        <li><strong>Profile Picture:</strong> Choose a high-quality image that represents you or your brand</li>
        <li><strong>Bio:</strong> Write a compelling description that tells visitors what you do</li>
        <li><strong>Display Name:</strong> Use your real name or brand name</li>
        <li><strong>Username:</strong> Pick a memorable username for your custom URL</li>
      </ul>
      
      <h2>Adding Your First Links</h2>
      <p>Once your profile is set up, you can start adding links to your most important content, products, or services.</p>
      
      <h2>Customizing Your Page</h2>
      <p>Pasive offers extensive customization options including themes, backgrounds, and layouts to match your brand perfectly.</p>
    `,
    excerpt: "Learn how to create your first link-in-bio page with Pasive and start converting visitors into customers.",
    date: "December 20, 2024",
    slug: "getting-started-with-pasive",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop&crop=center"
  },
  {
    title: "10 Tips to Maximize Your Link-in-Bio Conversions",
    content: `
      <h1>10 Tips to Maximize Your Link-in-Bio Conversions</h1>
      
      <p>Your link-in-bio page is often the first impression potential customers have of your brand. Here are 10 proven strategies to increase conversions.</p>
      
      <h2>1. Prioritize Your Most Important Links</h2>
      <p>Place your most valuable links at the top of your page where they're most visible.</p>
      
      <h2>2. Use Compelling Call-to-Actions</h2>
      <p>Instead of generic text like "Click here," use action-oriented phrases like "Shop Now" or "Get Your Free Guide."</p>
      
      <h2>3. Keep It Simple</h2>
      <p>Don't overwhelm visitors with too many options. Focus on 5-7 key links maximum.</p>
      
      <h2>4. Add Social Proof</h2>
      <p>Include testimonials, follower counts, or recent achievements to build trust.</p>
      
      <h2>5. Use High-Quality Images</h2>
      <p>Visual elements can increase engagement by up to 94%. Make sure your profile picture and link thumbnails are crisp and professional.</p>
      
      <h2>6. Regular Updates</h2>
      <p>Keep your page fresh by regularly updating links and content based on your current campaigns or offerings.</p>
      
      <h2>7. Mobile Optimization</h2>
      <p>Over 80% of social media users browse on mobile. Ensure your page looks great on all devices.</p>
      
      <h2>8. Track Your Analytics</h2>
      <p>Use Pasive's built-in analytics to understand which links perform best and optimize accordingly.</p>
      
      <h2>9. Consistent Branding</h2>
      <p>Maintain consistent colors, fonts, and messaging across your page to reinforce your brand identity.</p>
      
      <h2>10. A/B Test Your Content</h2>
      <p>Try different headlines, descriptions, and layouts to see what resonates best with your audience.</p>
    `,
    excerpt: "Discover proven strategies to turn your link-in-bio page into a conversion powerhouse with these expert tips.",
    date: "December 18, 2024",
    slug: "maximize-link-in-bio-conversions",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"
  },
  {
    title: "The Power of QR Codes for Modern Marketing",
    content: `
      <h1>The Power of QR Codes for Modern Marketing</h1>
      
      <p>QR codes have made a remarkable comeback, becoming an essential tool for bridging offline and online marketing. Here's how to leverage them effectively.</p>
      
      <h2>Why QR Codes Matter in 2024</h2>
      <p>The pandemic accelerated QR code adoption, and they're now a standard part of the digital marketing toolkit.</p>
      
      <h3>Benefits of QR Code Marketing</h3>
      <ul>
        <li><strong>Instant Access:</strong> Customers can reach your content in seconds</li>
        <li><strong>Trackable:</strong> Monitor scans and engagement in real-time</li>
        <li><strong>Versatile:</strong> Use on business cards, flyers, packaging, and more</li>
        <li><strong>Cost-Effective:</strong> Generate unlimited codes for various campaigns</li>
      </ul>
      
      <h2>Creative QR Code Use Cases</h2>
      
      <h3>1. Business Cards</h3>
      <p>Replace lengthy contact information with a single QR code that leads to your full digital profile.</p>
      
      <h3>2. Event Marketing</h3>
      <p>Make it easy for attendees to connect with you and access event-specific content or offers.</p>
      
      <h3>3. Product Packaging</h3>
      <p>Provide additional product information, tutorials, or exclusive offers.</p>
      
      <h3>4. Restaurant Menus</h3>
      <p>Digital menus that can be updated in real-time and accessed contactlessly.</p>
      
      <h2>Best Practices</h2>
      
      <h3>Design Considerations</h3>
      <ul>
        <li>Ensure sufficient contrast between the code and background</li>
        <li>Test codes at different sizes before printing</li>
        <li>Include a clear call-to-action</li>
        <li>Consider adding your brand colors or logo</li>
      </ul>
      
      <h3>Placement Strategy</h3>
      <p>Position QR codes where they're easily scannable - avoid curved surfaces or areas with poor lighting.</p>
      
      <h2>Measuring Success</h2>
      <p>Track scan rates, conversion rates, and user engagement to optimize your QR code campaigns for maximum impact.</p>
    `,
    excerpt: "Discover how QR codes can bridge the gap between offline and online marketing to drive engagement and conversions.",
    date: "December 15, 2024",
    slug: "power-of-qr-codes-marketing",
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=400&fit=crop&crop=center"
  },
  {
    title: "Building Your Personal Brand with a Link-in-Bio Page",
    content: `
      <h1>Building Your Personal Brand with a Link-in-Bio Page</h1>
      
      <p>In today's digital landscape, a strong personal brand can open doors to new opportunities. Your link-in-bio page is the perfect hub to showcase everything you stand for.</p>
      
      <h2>What is Personal Branding?</h2>
      <p>Personal branding is the practice of marketing yourself and your career as a brand. It's about creating a reputation and impression that positions you as an expert in your field.</p>
      
      <h2>Key Elements of Your Brand Identity</h2>
      
      <h3>1. Define Your Unique Value Proposition</h3>
      <p>What makes you different from others in your field? Identify your unique strengths and communicate them clearly.</p>
      
      <h3>2. Develop Consistent Visual Elements</h3>
      <ul>
        <li>Color palette that reflects your personality</li>
        <li>Professional photography</li>
        <li>Consistent fonts and design elements</li>
        <li>Logo or personal mark</li>
      </ul>
      
      <h3>3. Craft Your Brand Message</h3>
      <p>Develop a clear, concise message that explains who you are and what you do in a way that resonates with your target audience.</p>
      
      <h2>Showcasing Your Brand Through Your Links</h2>
      
      <h3>Portfolio and Work Samples</h3>
      <p>Include links to your best work, case studies, or portfolio pieces that demonstrate your expertise.</p>
      
      <h3>Thought Leadership Content</h3>
      <p>Share articles, videos, or podcasts where you share insights and establish yourself as a thought leader.</p>
      
      <h3>Social Proof</h3>
      <p>Link to testimonials, reviews, or media mentions that validate your expertise and credibility.</p>
      
      <h2>Engaging Your Audience</h2>
      
      <h3>Tell Your Story</h3>
      <p>Use your bio section to share your journey, values, and what drives you. People connect with authentic stories.</p>
      
      <h3>Provide Value</h3>
      <p>Include links to free resources, tools, or content that provide immediate value to your audience.</p>
      
      <h3>Make It Easy to Connect</h3>
      <p>Include multiple ways for people to reach out, whether for collaborations, opportunities, or just to connect.</p>
      
      <h2>Measuring Your Brand Impact</h2>
      <p>Track engagement metrics to understand which aspects of your brand resonate most with your audience and adjust accordingly.</p>
    `,
    excerpt: "Learn how to use your link-in-bio page as a powerful tool to build and showcase your personal brand effectively.",
    date: "December 12, 2024",
    slug: "building-personal-brand-link-in-bio",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop&crop=center"
  },
  {
    title: "E-commerce Integration: Sell Directly from Your Bio",
    content: `
      <h1>E-commerce Integration: Sell Directly from Your Bio</h1>
      
      <p>Transform your link-in-bio page into a powerful sales channel by integrating e-commerce features that make purchasing seamless for your customers.</p>
      
      <h2>The Rise of Social Commerce</h2>
      <p>Social commerce is reshaping how businesses sell online. With shortened attention spans and mobile-first browsing, customers want to purchase without leaving their current platform.</p>
      
      <h2>Benefits of Bio-Based Selling</h2>
      
      <h3>Reduced Friction</h3>
      <p>Eliminate the steps between discovery and purchase by showcasing products directly on your bio page.</p>
      
      <h3>Higher Conversion Rates</h3>
      <p>Fewer clicks to purchase typically means higher conversion rates and less cart abandonment.</p>
      
      <h3>Better Analytics</h3>
      <p>Track the entire customer journey from social media to purchase in one integrated system.</p>
      
      <h2>Product Showcase Strategies</h2>
      
      <h3>1. Featured Products</h3>
      <p>Highlight your best-selling or newest items with eye-catching images and compelling descriptions.</p>
      
      <h3>2. Collections and Bundles</h3>
      <p>Group related products together to increase average order value and simplify the shopping experience.</p>
      
      <h3>3. Limited-Time Offers</h3>
      <p>Create urgency with exclusive deals available only through your bio page.</p>
      
      <h2>Payment and Fulfillment</h2>
      
      <h3>Seamless Checkout</h3>
      <p>Integrate with popular payment processors to offer multiple payment options including digital wallets.</p>
      
      <h3>Inventory Management</h3>
      <p>Keep track of stock levels and automatically update product availability across all channels.</p>
      
      <h3>Order Processing</h3>
      <p>Streamline fulfillment with automated order processing and customer notifications.</p>
      
      <h2>Digital Products and Services</h2>
      
      <h3>Instant Delivery</h3>
      <p>Sell digital downloads, courses, or consultations with immediate access after purchase.</p>
      
      <h3>Subscription Services</h3>
      <p>Offer recurring services or content with built-in subscription management.</p>
      
      <h2>Marketing Your Products</h2>
      
      <h3>Social Proof</h3>
      <p>Display customer reviews, ratings, and user-generated content to build trust.</p>
      
      <h3>Cross-Promotion</h3>
      <p>Use your various social channels to drive traffic to different products on your bio page.</p>
      
      <h2>Success Metrics</h2>
      <p>Monitor conversion rates, average order value, and customer lifetime value to optimize your bio-based sales strategy.</p>
    `,
    excerpt: "Discover how to turn your link-in-bio page into a powerful e-commerce platform that drives sales directly from social media.",
    date: "December 10, 2024",
    slug: "ecommerce-integration-sell-from-bio",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center"
  }
];

async function migrateBlogPosts() {
  console.log('Starting blog migration...');

  for (const post of blogPosts) {
    try {
      console.log(`Migrating blog post: ${post.title}`);
      await addDoc(collection(db, 'blog_posts'), post);
      console.log(`✅ Successfully migrated: ${post.title}`);
    } catch (error) {
      console.error(`❌ Error migrating ${post.title}:`, error);
      return;
    }
  }

  console.log('🎉 All blog posts migrated successfully!');
}

migrateBlogPosts();
