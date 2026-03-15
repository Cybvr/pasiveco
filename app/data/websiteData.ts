import { Download, BookOpen, GraduationCap, Calendar, Headphones, Package } from 'lucide-react';

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  features: string[];
  examples: string[];
}

// Icon mapping for products
export const iconMap = {
  'Download': Download,
  'BookOpen': BookOpen,
  'GraduationCap': GraduationCap,
  'Calendar': Calendar,
  'Headphones': Headphones,
  'Package': Package
};

export const websiteData = {
  hero: {
    title: "Sell Any Kind of Product, Service or Subscription",
    subtitle: "The all-in-one platform that empowers creators and entrepreneurs to monetize their expertise",
    ctaText: "Start Selling Today",
    backgroundImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop&crop=center"
  },

  products: [
    {
      id: "digital-products",
      title: "Digital Products",
      description: "Sell any and every kind of digital product, from content packs to designs to bundles and more without stress.",
      icon: "Download",
      color: "purple-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
      features: [
        "Instant delivery system",
        "Multiple file format support",
        "Bulk upload capabilities",
        "Customer download tracking"
      ],
      examples: [
        "Design templates",
        "Stock photos",
        "Digital art",
        "Presets & filters",
        "Software tools",
        "Music & audio files"
      ]
    },
    {
      id: "ebooks",
      title: "Ebooks",
      description: "Pasive is the best platform to sell your ebooks both downloadable and non-downloadable in any format.",
      icon: "BookOpen",
      color: "blue-500",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center",
      features: [
        "Built-in ebook reader",
        "DRM protection",
        "Multiple formats (PDF, EPUB, MOBI)",
        "Preview functionality",
        "Reading analytics"
      ],
      examples: [
        "Fiction novels",
        "Business guides",
        "Self-help books",
        "Technical manuals",
        "Children's books",
        "Academic textbooks"
      ]
    },
    {
      id: "courses-memberships",
      title: "Courses",
      description: "You can host your courses & membership sites with unlimited videos & files, unlimited storage, and have unlimited students.",
      icon: "GraduationCap",
      color: "green-500",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
      features: [
        "Unlimited video hosting",
        "Progress tracking",
        "Quizzes & assignments",
        "Certificates of completion",
        "Discussion forums",
        "Content dripping",
        "Mobile-friendly player"
      ],
      examples: [
        "Online masterclasses",
        "Skill-based training",
        "Professional certifications",
        "Hobby courses",
        "Language learning",
        "Premium memberships"
      ]
    },
    {
      id: "events-training",
      title: "Event Tickets & Training",
      description: "Sell tickets for all kinds of events and access to masterclasses, events, workshops, training, webinars, and even more.",
      icon: "Calendar",
      color: "orange-500",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=center",
      features: [
        "Ticketing system",
        "QR code generation",
        "Attendee management",
        "Email reminders",
        "Virtual event integration",
        "Seating arrangements",
        "Check-in system"
      ],
      examples: [
        "Conferences",
        "Workshops",
        "Webinars",
        "Masterclasses",
        "Networking events",
        "Training sessions"
      ]
    },
    {
      id: "services",
      title: "Services",
      description: "Sell any kind of service, from coaching services to consultations to counseling sessions to design services and more.",
      icon: "Headphones",
      color: "indigo-500",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center",
      features: [
        "Booking calendar integration",
        "Service packages",
        "Client communication tools",
        "Payment scheduling",
        "Review system",
        "Time zone management"
      ],
      examples: [
        "Life coaching",
        "Business consulting",
        "Design services",
        "Writing services",
        "Marketing consultation",
        "Therapy sessions"
      ]
    },
    {
      id: "physical-goods",
      title: "Physical Goods",
      description: "You can also use Pasive to sell your physical product from clothing to books to electronics and appliances and more.",
      icon: "Package",
      color: "teal-500",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&crop=center",
      features: [
        "Inventory management",
        "Shipping integration",
        "Order tracking",
        "Multiple payment options",
        "Tax calculations",
        "Return management"
      ],
      examples: [
        "Handmade crafts",
        "Fashion items",
        "Books & magazines",
        "Electronics",
        "Home appliances",
        "Art & collectibles"
      ]
    }
  ] as ProductCategory[],

  features: {
    title: "Why Choose Pasive?",
    items: [
      {
        title: "Easy Setup",
        description: "Get your store running in minutes with our intuitive setup process",
        icon: "Zap",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&crop=center"
      },
      {
        title: "Global Payments",
        description: "Accept payments from customers worldwide with multiple payment options",
        icon: "CreditCard",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop&crop=center"
      },
      {
        title: "Analytics & Insights",
        description: "Track your sales performance with detailed analytics and reporting",
        icon: "BarChart3",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
      },
      {
        title: "24/7 Support",
        description: "Get help whenever you need it with our dedicated support team",
        icon: "MessageCircle",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=center"
      }
    ]
  },

  testimonials: [
    {
      name: "Sarah Johnson",
      role: "Course Creator",
      content: "Pasive has transformed my online business. The course hosting features are incredible and my students love the experience.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Digital Artist",
      content: "Selling my digital art has never been easier. The instant delivery system works perfectly for my customers.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Author",
      content: "The ebook platform is fantastic. I love how easy it is to upload and sell my books in multiple formats.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5
    }
  ],

  stats: {
    title: "Trusted by Creators Worldwide",
    items: [
      {
        number: "50K+",
        label: "Active Sellers",
        description: "Creators earning with Pasive"
      },
      {
        number: "1M+",
        label: "Products Sold",
        description: "Digital and physical products"
      },
      {
        number: "150+",
        label: "Countries",
        description: "Global reach and presence"
      },
      {
        number: "99.9%",
        label: "Uptime",
        description: "Reliable platform performance"
      }
    ]
  },

  cta: {
    title: "Ready to Start Selling?",
    subtitle: "Join thousands of successful creators who trust Pasive to power their online business",
    primaryButton: "Get Started Free",
    secondaryButton: "View Pricing",
    backgroundImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop&crop=center"
  }
};