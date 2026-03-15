export interface FooterData {
  brand: {
    logoAlt: string;
    name: string;
    tagline: string;
  };
  form: {
    placeholder: string;
    buttonText: string;
    description: string;
  };
  socialMedia: {
    iconName: string;
    url?: string;
  }[];
  navigation: {
    category: string;
    links: {
      text: string;
      url: string;
    }[];
  }[];
  footerLinks: {
    text: string;
    url: string;
  }[];
  copyright: {
    text: string;
  };
}

export const footerData: FooterData = {
  brand: {
    logoAlt: "Logo",
    name: "pasive",
    tagline: "All-in-one creator link platform."
  },
  form: {
    placeholder: "Enter your email",
    buttonText: "Get Started",
    description: "Join thousands creating beautiful link pages"
  },
  socialMedia: [
    { iconName: "Instagram" },
    { iconName: "Twitter" },
    { iconName: "Youtube" }
  ],
  navigation: [
    {
      category: "Features",
      links: [
        { text: "Digital Products", url: "/features/digital-products" },
        { text: "Ebooks", url: "/features/ebooks" },
        { text: "Courses", url: "/features/courses" },
        { text: "Events & Training", url: "/features/event-tickets-training" },
        { text: "Services", url: "/features/services" },
        { text: "Physical Goods", url: "/features/physical-goods" }
      ]
    },
    {
      category: "Solutions",
      links: [
        { text: "Analytics", url: "/solutions/analytics" },
        { text: "QR Code Generator", url: "/solutions/qr-codes" },
        { text: "Link in Bio", url: "/solutions/link-in-bio" },
        { text: "E-commerce", url: "/solutions/ecommerce" },
        { text: "AI Features", url: "/solutions/ai-features" }
      ]
    },
    {
      category: "Support",
      links: [
        { text: "Help Center", url: "#" },
        { text: "Contact Us", url: "#" },
        { text: "Status", url: "#" },
        { text: "API Docs", url: "#" }
      ]
    },
    {
      category: "Company",
      links: [
        { text: "About", url: "/about" },
        { text: "Blog", url: "/blog" },
        { text: "Careers", url: "#" },
        { text: "Press", url: "#" }
      ]
    }
  ],
  footerLinks: [
    { text: "Privacy Policy", url: "#" },
    { text: "Terms of Service", url: "#" },
    { text: "Cookie Policy", url: "#" }
  ],
  copyright: {
    text: "© 2025 pasive. All rights reserved."
  }
};
