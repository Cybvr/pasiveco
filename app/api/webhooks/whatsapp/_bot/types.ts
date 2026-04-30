export type WhatsAppStep =
  | "welcome"
  | "product_type"
  | "product_name"
  | "product_price"
  | "product_file"
  | "bank_prompt"
  | "bank_details"
  | "discount_create"
  | "job_full_name"
  | "job_portfolio"
  | "job_age"
  | "job_location"
  | "job_role"
  | "job_screening"
  | "complete";

export type WhatsAppSession = {
  flow?: "commerce" | "jobs";
  step?: WhatsAppStep;
  previousFlow?: "commerce" | "jobs";
  previousStep?: WhatsAppStep;
  productType?: string;
  productName?: string;
  productPrice?: number;
  productSlug?: string;
  fileId?: string;
  fileName?: string;
  salesLink?: string;
  candidateFullName?: string;
  candidatePortfolioLinks?: string;
  candidateAge?: number;
  candidatePhone?: string;
  candidateLocation?: string;
  jobRole?: string;
  jobId?: string;
  screeningQuestionIndex?: number;
  screeningAnswers?: Array<{ question: string; answer: string }>;
  updatedAt?: any;
};

export type WhatsAppContact = {
  profile?: { name?: string };
  wa_id?: string;
};

export const SESSION_COLLECTION = "whatsappSessions";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pasive.co";

export const PRODUCT_TYPES: Record<string, string> = {
  "1": "Ebooks / PDFs",
  "ebooks": "Ebooks / PDFs",
  "ebooks / pdfs": "Ebooks / PDFs",
  "pdf": "Ebooks / PDFs",
  "pdfs": "Ebooks / PDFs",
  "2": "Courses / Videos",
  "courses": "Courses / Videos",
  "courses / videos": "Courses / Videos",
  "videos": "Courses / Videos",
  "3": "Templates / Tools",
  "templates": "Templates / Tools",
  "templates / tools": "Templates / Tools",
  "tools": "Templates / Tools",
  "4": "Something else",
  "something else": "Something else",
};

export const PRODUCT_CATEGORY_BY_TYPE: Record<string, string> = {
  "Ebooks / PDFs": "ebook",
  "Courses / Videos": "courses",
  "Templates / Tools": "digital-download",
  "Something else": "digital-download",
};

export const JOB_ROLES: Record<string, { id: string; title: string; questions: string[] }> = {
  "1": {
    id: "whatsapp-content-creator",
    title: "Content Creator",
    questions: [
      "Which platforms do you create content for most? Instagram, TikTok, YouTube, X, or something else?",
      "Send 1-2 links to your best content or portfolio.",
      "How many short-form posts or videos can you comfortably create per week?",
    ],
  },
  "2": {
    id: "whatsapp-video-editor",
    title: "Video Editor",
    questions: [
      "Which editing tools do you use? Premiere Pro, CapCut, DaVinci Resolve, Final Cut, or something else?",
      "Send a link to your best editing work or portfolio.",
      "What is your usual turnaround time for a 30-60 second video?",
    ],
  },
  "3": {
    id: "whatsapp-social-media-manager",
    title: "Social Media Manager",
    questions: [
      "Which social platforms have you managed professionally?",
      "Briefly describe one campaign, account, or page you helped grow.",
      "Which tools do you use for scheduling, analytics, or content planning?",
    ],
  },
};

export const JOB_ROLE_ALIASES: Record<string, string> = {
  "1": "1",
  "content creator": "1",
  "creator": "1",
  "2": "2",
  "video editor": "2",
  "editor": "2",
  "3": "3",
  "social media manager": "3",
  "social media": "3",
  "social manager": "3",
};

export const GREETINGS = ["hello", "hi", "hey"];

export const welcomeMessage =
  "Hey! Welcome to Pasive — sell your digital products and get paid instantly. Want to get started?\n\nReply with:\n1. Yes, let's go\n2. Tell me more first";

export const productTypeMessage =
  "You create once, we handle payments, delivery, and payouts. No website needed. What do you sell?\n\nReply with:\n1. Ebooks / PDFs\n2. Courses / Videos\n3. Templates / Tools\n4. Something else";

export const jobRoleMessage =
  "Which role are you applying for?\n\nReply with:\n1. Content Creator\n2. Video Editor\n3. Social Media Manager";
