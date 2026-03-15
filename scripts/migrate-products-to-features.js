
require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

// Products/Features data from websiteData.ts
const productsData = [
  {
    id: "digital-products",
    title: "Digital Products",
    description: "Sell any and every kind of digital product, from content packs to designs to bundles and more without stress.",
    icon: "Download",
    color: "purple-500",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    slug: "digital-products",
    href: "/features/digital-products",
    content: `
      <h2>Digital Products Made Simple</h2>
      <p>Transform your digital creations into a profitable business with our comprehensive digital product platform. Whether you're a designer, photographer, developer, or content creator, Pasive makes it easy to sell your digital assets to customers worldwide.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Instant Delivery System:</strong> Automatic delivery of digital files immediately after purchase</li>
        <li><strong>Multiple File Format Support:</strong> Upload and sell any file type - images, videos, documents, software, and more</li>
        <li><strong>Bulk Upload Capabilities:</strong> Upload multiple files at once to save time</li>
        <li><strong>Customer Download Tracking:</strong> Monitor how many times your products have been downloaded</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Design templates and graphics</li>
        <li>Stock photos and illustrations</li>
        <li>Digital art and NFTs</li>
        <li>Lightroom presets and filters</li>
        <li>Software tools and plugins</li>
        <li>Music and audio files</li>
      </ul>
      
      <p>Start monetizing your digital creations today with zero setup fees and instant payouts.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "ebooks",
    title: "Ebooks",
    description: "Pasive is the best platform to sell your ebooks both downloadable and non-downloadable in any format.",
    icon: "BookOpen",
    color: "blue-500",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center",
    slug: "ebooks",
    href: "/features/ebooks",
    content: `
      <h2>Publish and Sell Your Ebooks</h2>
      <p>Turn your knowledge and stories into profit with our comprehensive ebook platform. Pasive provides everything you need to publish, distribute, and sell your ebooks to readers around the world.</p>
      
      <h3>Advanced Features</h3>
      <ul>
        <li><strong>Built-in Ebook Reader:</strong> Customers can read directly on your site</li>
        <li><strong>DRM Protection:</strong> Protect your content from unauthorized distribution</li>
        <li><strong>Multiple Formats:</strong> Support for PDF, EPUB, and MOBI formats</li>
        <li><strong>Preview Functionality:</strong> Let customers preview before purchasing</li>
        <li><strong>Reading Analytics:</strong> Track engagement and reading progress</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Fiction novels and series</li>
        <li>Business and entrepreneurship guides</li>
        <li>Self-help and personal development</li>
        <li>Technical manuals and documentation</li>
        <li>Children's books and educational content</li>
        <li>Academic textbooks and research</li>
      </ul>
      
      <p>Join thousands of successful authors who trust Pasive to distribute their ebooks worldwide.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "courses-memberships",
    title: "Courses",
    description: "You can host your courses & membership sites with unlimited videos & files, unlimited storage, and have unlimited students.",
    icon: "GraduationCap",
    color: "green-500",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    slug: "courses",
    href: "/features/courses",
    content: `
      <h2>Create and Sell Online Courses</h2>
      <p>Build your online education empire with our comprehensive course creation platform. From video hosting to student management, we provide everything you need to create, market, and sell profitable online courses.</p>
      
      <h3>Powerful Features</h3>
      <ul>
        <li><strong>Unlimited Video Hosting:</strong> Upload and stream videos without storage limits</li>
        <li><strong>Progress Tracking:</strong> Monitor student progress and completion rates</li>
        <li><strong>Quizzes & Assignments:</strong> Create interactive learning experiences</li>
        <li><strong>Certificates:</strong> Award completion certificates to students</li>
        <li><strong>Discussion Forums:</strong> Build learning communities</li>
        <li><strong>Content Dripping:</strong> Release lessons on a schedule</li>
        <li><strong>Mobile-Friendly Player:</strong> Students can learn anywhere</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Online masterclasses and workshops</li>
        <li>Skill-based training programs</li>
        <li>Professional certifications</li>
        <li>Hobby and creative courses</li>
        <li>Language learning programs</li>
        <li>Premium membership sites</li>
      </ul>
      
      <p>Transform your expertise into a scalable online business with unlimited earning potential.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "events-training",
    title: "Event Tickets & Training",
    description: "Sell tickets for all kinds of events and access to masterclasses, events, workshops, training, webinars, and even more.",
    icon: "Calendar",
    color: "orange-500",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=center",
    slug: "events",
    href: "/features/events",
    content: `
      <h2>Event Tickets & Training Management</h2>
      <p>Streamline your event management and ticket sales with our comprehensive platform. From intimate workshops to large conferences, manage every aspect of your events with ease.</p>
      
      <h3>Event Management Features</h3>
      <ul>
        <li><strong>Ticketing System:</strong> Sell tickets with multiple pricing tiers</li>
        <li><strong>QR Code Generation:</strong> Automatic ticket generation with QR codes</li>
        <li><strong>Attendee Management:</strong> Track registrations and attendance</li>
        <li><strong>Email Reminders:</strong> Automated event reminders and updates</li>
        <li><strong>Virtual Event Integration:</strong> Seamless Zoom and Teams integration</li>
        <li><strong>Seating Arrangements:</strong> Manage seat assignments for venues</li>
        <li><strong>Check-in System:</strong> Mobile check-in for event day</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Professional conferences and summits</li>
        <li>Educational workshops and seminars</li>
        <li>Virtual webinars and masterclasses</li>
        <li>Training sessions and bootcamps</li>
        <li>Networking events and meetups</li>
        <li>Corporate training programs</li>
      </ul>
      
      <p>Make event management effortless and focus on delivering value to your attendees.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "services",
    title: "Services",
    description: "Sell any kind of service, from coaching services to consultations to counseling sessions to design services and more.",
    icon: "Headphones",
    color: "indigo-500",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center",
    slug: "services",
    href: "/features/services",
    content: `
      <h2>Professional Services Platform</h2>
      <p>Transform your expertise into a thriving service business. Whether you're a coach, consultant, designer, or freelancer, our platform provides everything you need to sell and deliver professional services.</p>
      
      <h3>Service Management Tools</h3>
      <ul>
        <li><strong>Booking Calendar:</strong> Integrated scheduling with time zone support</li>
        <li><strong>Service Packages:</strong> Create bundled service offerings</li>
        <li><strong>Client Communication:</strong> Built-in messaging and video calls</li>
        <li><strong>Payment Scheduling:</strong> Flexible payment plans and deposits</li>
        <li><strong>Review System:</strong> Build trust with client testimonials</li>
        <li><strong>Time Tracking:</strong> Monitor billable hours accurately</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Life and business coaching</li>
        <li>Management and strategy consulting</li>
        <li>Graphic and web design services</li>
        <li>Content writing and copywriting</li>
        <li>Digital marketing consultation</li>
        <li>Therapy and counseling sessions</li>
      </ul>
      
      <p>Scale your service business with automated bookings, payments, and client management.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: "physical-goods",
    title: "Physical Goods",
    description: "You can also use Pasive to sell your physical product from clothing to books to electronics and appliances and more.",
    icon: "Package",
    color: "teal-500",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&crop=center",
    slug: "physical-goods",
    href: "/features/physical-goods",
    content: `
      <h2>Physical Product E-commerce</h2>
      <p>Expand beyond digital with our comprehensive physical product platform. From handmade crafts to retail goods, manage inventory, shipping, and fulfillment all in one place.</p>
      
      <h3>E-commerce Features</h3>
      <ul>
        <li><strong>Inventory Management:</strong> Track stock levels and variants</li>
        <li><strong>Shipping Integration:</strong> Connect with major shipping carriers</li>
        <li><strong>Order Tracking:</strong> Real-time shipment tracking for customers</li>
        <li><strong>Payment Processing:</strong> Secure payments with fraud protection</li>
        <li><strong>Tax Calculations:</strong> Automatic tax calculations by location</li>
        <li><strong>Return Management:</strong> Streamlined returns and exchanges</li>
      </ul>
      
      <h3>Perfect For</h3>
      <ul>
        <li>Handmade crafts and artisan goods</li>
        <li>Fashion and apparel items</li>
        <li>Books and printed materials</li>
        <li>Electronics and gadgets</li>
        <li>Home and kitchen appliances</li>
        <li>Art prints and collectibles</li>
      </ul>
      
      <p>Launch your physical product business with powerful e-commerce tools and global shipping capabilities.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&crop=center"
  }
];

async function migrateProductsToFeatures() {
  try {
    console.log('Starting products to features migration...');
    
    for (const product of productsData) {
      console.log(`Migrating product: ${product.title}`);
      
      // Create document with custom ID based on slug
      await setDoc(doc(db, 'features', product.slug), {
        title: product.title,
        description: product.description,
        href: product.href,
        slug: product.slug,
        icon: product.icon,
        content: product.content,
        featuredImage: product.featuredImage,
        imageUrl: product.image, // Keep for backwards compatibility
        color: product.color,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Successfully migrated: ${product.title}`);
    }
    
    console.log('🎉 All products migrated to features successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error migrating products to features:', error);
    process.exit(1);
  }
}

migrateProductsToFeatures();
