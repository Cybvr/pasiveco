
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: "q1",
    question: "What can I add to my bio page?",
    answer:
      "You can create a comprehensive bio page with your profile information, custom links, social media links, and products for sale.",
  },
  {
    id: "q2",
    question: "How do I edit my bio page?",
    answer:
      "Use the editor to update your profile details, links, and social media items, then save your changes.",
  },
  {
    id: "q3",
    question: "Can I sell products directly from my bio page?",
    answer:
      "Yes! You can add products to your shop tab, including product images, descriptions, prices, and direct purchase links. Your products will be displayed beautifully alongside your other content.",
  },

  {
    id: "q5",
    question: "How do QR codes work with my bio page?",
    answer:
      "Generate custom QR codes that link directly to your bio page. You can customize the QR code design, colors, and add your logo. Print them on business cards, flyers, or display them anywhere to drive traffic to your bio page.",
  },
  {
    id: "q6",
    question: "Can I track who visits my bio page?",
    answer:
      "Yes, our analytics dashboard provides detailed insights including visitor counts, click-through rates on your links, geographic data, device information, and engagement patterns to help you optimize your content strategy.",
  },
  {
    id: "q7",
    question: "How do I add social media links to my bio page?",
    answer:
      "In the bio editor, you can add links to all major social platforms including Instagram, TikTok, YouTube, Twitter, LinkedIn, and more. These appear as clickable icons below your profile information.",
  },
  {
    id: "q8",
    question: "Can I update my bio page details anytime?",
    answer:
      "Absolutely. You can return to the editor anytime to update your links, bio, and profile content.",
  },
  {
    id: "q9",
    question: "Is my bio page mobile-friendly?",
    answer:
      "Yes, all bio pages are fully responsive and optimized for mobile devices. Your page will look great and function perfectly on smartphones, tablets, and desktop computers.",
  },
  {
    id: "q10",
    question: "How do I share my bio page?",
    answer:
      "Your bio page gets a custom URL (pasive.co/yourusername) that you can share anywhere. Use the built-in share features to copy the link, generate QR codes, or share directly to social media platforms.",
  }
];
