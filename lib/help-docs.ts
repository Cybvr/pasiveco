export interface HelpDocTable {
  headers: string[]
  rows: string[][]
}

export interface HelpDocSection {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
  table?: HelpDocTable
  note?: string
}

export interface HelpDoc {
  id: string
  title: string
  summary: string
  category: string
  readTime: string
  sections: HelpDocSection[]
}

export const HELP_DOCS: HelpDoc[] = [
  {
    id: 'getting-started',
    title: 'Getting started with Pasive',
    summary: 'Set up your creator page, publish your profile, and understand the core areas of the dashboard.',
    category: 'General',
    readTime: '4 min read',
    sections: [
      {
        id: 'overview',
        title: 'What Pasive helps you do',
        paragraphs: [
          'Pasive gives creators a single place to publish a profile page, sell products, monitor audience activity, and manage payouts from one dashboard.',
          'The core workflow is simple: complete your profile, customize your public page, add products or offers, then share your page anywhere your audience already follows you.',
        ],
      },
      {
        id: 'first-steps',
        title: 'Recommended first steps',
        bullets: [
          'Open Customize to update your profile image, bio, brand colors, and page layout.',
          'Visit Products to publish digital products, links, or offers you want to sell.',
          'Review Analytics regularly so you can learn which links and products drive the most engagement.',
          'Set up your withdrawal and payment details before you begin monetizing your audience.',
        ],
      },
      {
        id: 'dashboard-areas',
        title: 'Main dashboard areas',
        table: {
          headers: ['Area', 'What it is for'],
          rows: [
            ['Home', 'Quick overview of recent activity and platform highlights.'],
            ['Discovery', 'Explore pages, creators, and ideas that can influence your own setup.'],
            ['Customize', 'Edit the look, content, and structure of your public page.'],
            ['Products', 'Create and manage what you sell.'],
            ['Analytics', 'Track visits, clicks, and performance trends.'],
          ],
        },
      },
      {
        id: 'best-practices',
        title: 'Best practices',
        bullets: [
          'Keep your headline and call to action extremely clear.',
          'Lead with the one thing you want visitors to do next.',
          'Use analytics to refine your page instead of guessing what works.',
          'Keep your payout settings up to date so revenue can be processed without delay.',
        ],
      },
    ],
  },
  {
    id: 'profile-and-page-setup',
    title: 'Profile and page setup',
    summary: 'Learn how to make your public page clear, trustworthy, and ready for conversion.',
    category: 'General',
    readTime: '5 min read',
    sections: [
      {
        id: 'profile-basics',
        title: 'Profile basics',
        paragraphs: [
          'Your page should immediately tell people who you are, what you offer, and what action they should take next.',
          'Use a recognizable profile image, a concise description, and a strong primary link or offer near the top of the page.',
        ],
      },
      {
        id: 'trust-signals',
        title: 'Trust signals that help conversion',
        bullets: [
          'Use a consistent creator or brand name across your profile and products.',
          'Add short, benefit-focused copy instead of long generic bios.',
          'Keep links current so visitors do not land on broken destinations.',
          'Make your pricing and offer descriptions simple to understand.',
        ],
      },
      {
        id: 'content-ideas',
        title: 'Content you can place on your page',
        bullets: [
          'Lead magnet or email capture offer',
          'Featured digital product or paid resource',
          'Booking or consultation links',
          'Social proof, testimonials, or community links',
          'Social profiles and other important destinations',
        ],
      },
      {
        id: 'maintenance',
        title: 'Keep your page fresh',
        paragraphs: [
          'Treat your public page like a live storefront. Refresh campaigns, product links, and featured content whenever your priorities change.',
          'If your traffic shifts based on launches or promotions, update your page to match the audience intent behind that traffic source.',
        ],
      },
    ],
  },
  {
    id: 'products-and-sales',
    title: 'Products and sales',
    summary: 'Use products to monetize your audience with clear offers, fast fulfillment, and simple follow-through.',
    category: 'Products',
    readTime: '5 min read',
    sections: [
      {
        id: 'offer-structure',
        title: 'Structure your offer clearly',
        paragraphs: [
          'Strong product pages are usually simple. Lead with the outcome, explain who the product is for, and remove unnecessary friction from the buying decision.',
        ],
        bullets: [
          'Describe the transformation or result, not just the file type or format.',
          'Show exactly what buyers receive after purchase.',
          'Use pricing that is easy to scan and easy to compare.',
        ],
      },
      {
        id: 'launch-checklist',
        title: 'Before you publish',
        bullets: [
          'Confirm the product title and description are accurate.',
          'Check that the price and delivery flow are correct.',
          'Make sure links, files, or access instructions are ready.',
          'Preview how the product appears on your public page.',
        ],
      },
      {
        id: 'post-purchase',
        title: 'After a purchase',
        paragraphs: [
          'Your transaction provider records payment activity, but your app should use its internal data to decide what a buyer can access. This keeps access control predictable and auditable inside your own product.',
        ],
        note: 'When possible, treat payment provider records as financial proof and your application database as the source of truth for entitlement and access.',
      },
    ],
  },
  {
    id: 'analytics-and-growth',
    title: 'Analytics and growth',
    summary: 'Use data from your dashboard to understand which content, offers, and links are performing best.',
    category: 'Growth',
    readTime: '4 min read',
    sections: [
      {
        id: 'what-to-watch',
        title: 'Metrics worth watching',
        bullets: [
          'Profile visits and overall traffic direction',
          'Clicks on important links and products',
          'Top-performing pages, campaigns, or entry points',
          'Trends over time instead of one-day spikes in isolation',
        ],
      },
      {
        id: 'how-to-use',
        title: 'How to use analytics well',
        paragraphs: [
          'Analytics are most useful when they change what you do next. Use your data to decide which offer to feature, what copy to rewrite, and which channels send the highest-quality visitors.',
          'Review performance consistently rather than only during launches. Small adjustments compound over time.',
        ],
      },
      {
        id: 'experiments',
        title: 'Simple experiments to run',
        bullets: [
          'Swap your primary headline and compare click behavior.',
          'Feature one product at the top of the page for a fixed period.',
          'Change your call-to-action language to focus on a clearer benefit.',
          'Match your page copy to the source of traffic from a campaign or platform.',
        ],
      },
    ],
  },
  {
    id: 'payment-payout-integration',
    title: 'Payment and payout integration',
    summary: 'Understand how Stripe, Flutterwave, and webhooks work together for global collections and localized payouts.',
    category: 'Payments',
    readTime: '6 min read',
    sections: [
      {
        id: 'how-it-works',
        title: 'How it works',
        paragraphs: [
          'Pasive uses a multi-layered payment system. Western buyers are routed to Stripe, African buyers are routed to Flutterwave, and webhooks from both providers update Firestore to grant product access or subscription status.',
        ],
      },
      {
        id: 'collections',
        title: 'Global collections',
        paragraphs: [
          'When a buyer checks out, we detect their currency/location and route them to the appropriate gateway:',
        ],
        bullets: [
          'Western buyers -> Stripe',
          'African buyers -> Flutterwave',
          'Stripe supports USD, EUR, GBP, and similar currencies via card wallets and card payments.',
          'Flutterwave supports NGN, GHS, KES, ZAR, and similar local currencies via mobile money, bank transfer, and local cards.',
        ],
      },
      {
        id: 'payouts',
        title: 'Seller payouts',
        paragraphs: [
          "Money flows into Pasive's balance first. We then distribute payouts based on the seller's location:",
          'Payout to African sellers -> Flutterwave Payouts',
          'Payout to Western-based African sellers -> Stripe Connect',
          'African sellers are paid through Flutterwave directly to supported bank accounts or mobile money wallets.',
          'Western-based African sellers are paid through Stripe Connect and must connect their Stripe account in settings.',
        ],
      },
      {
        id: 'mental-model',
        title: 'The mental model',
        table: {
          headers: ['Layer', 'Role'],
          rows: [
            ['Stripe', 'Western buyer collections and payouts to Western-based African sellers via Stripe Connect'],
            ['Flutterwave', 'African buyer collections and payouts to African sellers via Flutterwave Payouts'],
            ['Webhooks', 'Bridge between processors and Firestore'],
          ],
        },
        note: 'Without webhooks writing to Firestore, our systems would not know when a payment is successful. The webhook handlers for both Stripe and Flutterwave are critical for unlocking product access.',
      },
    ],
  },
  {
    id: 'affiliate-network',
    title: 'Affiliate network guide',
    summary: 'Learn how the Pasive affiliate network works for affiliates promoting products and merchants listing offers.',
    category: 'Affiliates',
    readTime: '5 min read',
    sections: [
      {
        id: 'network-overview',
        title: 'What the affiliate network is',
        paragraphs: [
          'The Pasive Affiliate Network is a marketplace where digital creators and merchants list products for affiliates to discover and promote.',
          'Affiliates earn a commission on each successful sale made through their unique affiliate link.',
        ],
      },
      {
        id: 'why-join',
        title: 'Why affiliates join',
        bullets: [
          'Browse a large catalog of digital products ready to promote.',
          'Choose offers across categories like education, health, finance, and lifestyle.',
          'Earn commissions set by the product owner, often ranging from 10% to 70%.',
          'Use the network to start selling without creating your own product first.',
        ],
      },
      {
        id: 'how-to-join',
        title: 'How to join the network',
        bullets: [
          'Create your Pasive account.',
          'Subscribe to the affiliate plan to unlock network access.',
          'Browse products and choose what you want to promote.',
          'Share your affiliate link and earn when your referrals buy.',
        ],
      },
      {
        id: 'for-merchants',
        title: 'How merchants use it',
        paragraphs: [
          'Merchants can list their products on the marketplace so affiliates can discover and promote them.',
          'This gives creators an additional distribution channel and helps products reach more buyers through affiliate referrals.',
        ],
        bullets: [
          'Sign up on Pasive.',
          'Upload your product.',
          'List the product on the marketplace for affiliates to promote.',
        ],
      },
      {
        id: 'affiliate-payouts',
        title: 'Affiliate commissions and payouts',
        paragraphs: [
          'Commission percentages are defined by the merchant for each product. Affiliate earnings are then paid out through Pasive based on the platform withdrawal schedule and payout setup.',
        ],
        note: 'If you are promoting products as an affiliate, make sure your payout details are complete so commissions can be released without delay.',
      },
    ],
  },
]

export function getHelpDocs() {
  return HELP_DOCS
}

export function getHelpDocById(id: string) {
  return HELP_DOCS.find((doc) => doc.id === id)
}

export function getRelatedHelpDocs(currentId: string, limit = 3) {
  return HELP_DOCS.filter((doc) => doc.id !== currentId).slice(0, limit)
}
