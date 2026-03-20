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
    category: 'Basics',
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
    category: 'Profile',
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
    category: 'Monetization',
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
    category: 'Analytics',
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
    id: 'paystack-integration-overview',
    title: 'Paystack integration overview',
    summary: 'Understand how Paystack, Firestore, and webhooks work together for subscriptions, purchases, invoices, and payouts.',
    category: 'Payments',
    readTime: '6 min read',
    sections: [
      {
        id: 'how-it-works',
        title: 'How it works',
        paragraphs: [
          'Paystack handles the money. Firestore handles the state. They work together via webhooks — Paystack tells your backend when money moves, your backend updates Firestore, and your app reads Firestore to control access.',
        ],
      },
      {
        id: 'creator-subscriptions',
        title: "User subscribes to another user's page",
        paragraphs: [
          "A user pays to subscribe to another user's page. That payment goes through Paystack. Paystack fires a webhook to your backend, which writes the subscription record to Firestore. Every access check in the app reads Firestore — not Paystack.",
        ],
        bullets: [
          'Firestore: subscriptions/{subscriberId} with pageOwnerId, plan, status, expiry',
        ],
      },
      {
        id: 'platform-plan',
        title: 'User subscribes to your platform (tiered plan)',
        paragraphs: [
          "A user pays for a platform plan such as basic or pro to unlock features like analytics or customization. The mechanic is the same — a Paystack webhook hits your backend, and the backend updates the user's record in Firestore.",
        ],
        bullets: [
          'Firestore: users/{userId} with plan and planExpiry',
        ],
      },
      {
        id: 'invoices',
        title: 'Subscription invoices',
        paragraphs: [
          'Paystack stores these natively. You hit the Paystack API on demand to fetch and display them. No need to duplicate them in Firestore unless you want offline access or custom formatting.',
        ],
        bullets: [
          'Paystack API: GET /transaction or GET /subscription',
        ],
      },
      {
        id: 'digital-products',
        title: 'Who bought a digital product',
        paragraphs: [
          'A one-time payment runs through Paystack. The webhook fires, your backend writes the purchase to Firestore, Firestore becomes the access record, and Paystack remains the transaction record.',
        ],
        bullets: [
          'Firestore: purchases/{buyerId} with productId',
        ],
      },
      {
        id: 'payouts',
        title: 'User payouts',
        paragraphs: [
          "When someone pays to subscribe to a user's page, that money lands in your Paystack account first — not the user's. Your platform is the middleman.",
          'You then send the user their cut minus your platform percentage to their bank account. The user should add bank details in the app first. Paystack Transfers handles the bank transfer itself.',
          'Payouts can be scheduled automatically or triggered manually by the user. In both cases, your platform initiates the payout, Paystack executes it, and Firestore logs the result.',
        ],
        bullets: [
          'Firestore: users/{userId} stores recipientCode created when bank details are saved',
          'Firestore: payouts/{userId} logs transfer record, status, and amount',
        ],
      },
      {
        id: 'mental-model',
        title: 'The mental model',
        table: {
          headers: ['Layer', 'Role'],
          rows: [
            ['Paystack', 'Payment processor and transaction ledger'],
            ['Firestore', 'Access control database'],
            ['Webhooks', 'Bridge between Paystack and Firestore'],
          ],
        },
        note: 'Without the webhook writing to Firestore, Paystack knows money moved but your app does not know to unlock anything. The webhook handler is the most critical piece in the whole system.',
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
