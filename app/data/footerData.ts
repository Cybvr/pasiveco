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
    logoAlt: "Pasive Logo",
    name: "Pasive",
    tagline: "One supercharged creator hub to manage everything. Scale your business and own your data with your sales, marketing, and brand deals in one place."
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
      category: "Learn more",
      links: [
        { text: "Pasive for Managers", url: "/solutions/managers" },
        { text: "Pasive for Brands", url: "/solutions/brands" },
        { text: "Pricing", url: "/pricing" },
        { text: "Blog", url: "/blog" },
        { text: "Referral Program", url: "/referrals" }
      ]
    },
    {
      category: "Creator Tools",
      links: [
        { text: "Link in Bio", url: "/solutions/link-in-bio" },
        { text: "Store", url: "/features/digital-products" },
        { text: "Email Marketing", url: "/features/email-marketing" },
        { text: "Media Kit", url: "/features/media-kit" },
        { text: "Income Dashboard", url: "/dashboard" }
      ]
    },
    {
      category: "Legal",
      links: [
        { text: "Terms of Service", url: "/legal/terms" },
        { text: "Privacy Policy", url: "/legal/privacy" },
        { text: "Cookie Notice", url: "/legal/cookies" },
        { text: "Report Violation", url: "/legal/report" },
        { text: "Community Standards", url: "/legal/community" }
      ]
    },
    {
      category: "Pasive",
      links: [
        { text: "About Us", url: "/about" },
        { text: "Careers", url: "/careers" },
        { text: "Help Center", url: "/help" }
      ]
    }
  ],
  footerLinks: [
    { text: "Terms of Service", url: "/legal/terms" },
    { text: "Privacy Policy", url: "/legal/privacy" },
    { text: "Cookie Notice", url: "/legal/cookies" }
  ],
  copyright: {
    text: "© 2025 Pasive. All rights reserved."
  }
};
