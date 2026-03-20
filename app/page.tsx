"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import Header from "@/app/common/website/Header"
import Footer from "@/app/common/website/Footer"
import {
  Check,
  Smartphone,
  Palette,
  BarChart,
  Instagram,
  Twitter,
  Heart,
  Play,
  MessageCircle,
  Plus,
  Send,
  User,
  Bot,
  ChevronDown,
  Package,
  Youtube,
  Twitch,
  Globe,
  Download,
  BookOpen,
  GraduationCap,
  Calendar,
  Headphones,
  Zap,
  Shield,
  TrendingUp,
  Mail,
  DollarSign,
  Briefcase,
  Star,
  ArrowRight
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const CREATORS = [
  { name: "Chloe Shih", role: "Creator" },
  { name: "Heather Gardner", role: "Comedy" },
  { name: "Scott Ho", role: "Fitness" },
  { name: "DJ Habibeats", role: "DJ" },
  { name: "Elena Shinohara", role: "Gymnastics" },
  { name: "Chipmunksoftiktok", role: "Chipmunks" },
  { name: "Stream Elements", role: "Streaming" },
  { name: "Mr TOV", role: "Creator" },
  { name: "Andrea Botez", role: "Lifestyle" },
];

const TESTIMONIALS = [
  {
    quote: "As a standup comedian, the best way to market is on social media. Pasive makes it easy for my fans to put in their email addresses and subscribe to my updates, and I create targeted promotional emails based on their city.",
    author: "Ahmedlovesbread",
    role: "Comedian"
  },
  {
    quote: "I've been able to build an email list using Pasive to create a community that is not reliant on social platforms.",
    author: "Cesi",
    role: "Gaming"
  },
  {
    quote: "The Pasive Store has made it seamless for me to monetize and boosted my brand visibility.",
    author: "Cleo Rualo",
    role: "Career Coach"
  },
  {
    quote: "Pasive is an amazing tool for all types of creators! The convenience of having everything in one platform has made it stand out for me.",
    author: "DailyAlissa",
    role: "Gaming creator"
  }
];

const AI_TOOLS = [
  "Social Asset Generation",
  "Ready for You Email Marketing",
  "Social Digest Emails",
  "Email Automations",
  "Product Descriptions",
  "Audience Intelligence",
  "Image Thumbnails"
];

const Marquee = () => (
  <div className="relative flex overflow-x-hidden border-y border-border py-3.5 text-muted-foreground font-mono uppercase tracking-widest text-xs">
    <div className="animate-marquee whitespace-nowrap flex items-center">
      {[...CREATORS, ...CREATORS, ...CREATORS].map((creator, i) => (
        <span key={i} className="mx-6 flex items-center gap-3">
          <span className="text-foreground font-medium">{creator.name}</span>
          <span className="opacity-30">·</span>
          <span>{creator.role}</span>
          <span className="mx-6 opacity-20">|</span>
        </span>
      ))}
    </div>
  </div>
);

const FEATURES = [
  {
    label: "Link in Bio",
    title: "Make your brand unforgettable",
    body: "Build a fully customizable Link in Bio or full website to promote your links, products, email list, and all social platforms—in minutes.",
    icon: Palette,
    image: "/images/artifacts/link_in_bio_design_1773559804736.png",
  },
  {
    label: "Audience Ownership",
    title: "Screw the algorithm. Market direct to fans.",
    body: "Stop renting your audience—own it. Build a subscriber list, send emails, and automate DMs to turn comments into cash and followers into fans.",
    icon: Mail,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    label: "Commerce",
    title: "Sell your products & promote affiliate links",
    body: "Sell digital products, courses, appointments, and link to affiliates, right from your Link in Bio. Drive more sales with native checkout and cash out in one day.",
    icon: DollarSign,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
  {
    label: "Brand Deals",
    title: "Build your dream brand partnerships",
    body: "Show brands where to spend their money: on you. Turn affiliate links into brand deals, pitch to brands directly, and use real-time media kits to land partnerships that pay.",
    icon: Briefcase,
    image: "/images/artifacts/brand_deals_inbox_1773559825324.png",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  if (loading || user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-foreground selection:text-background">
      <Header isMenuOpen={false} setIsMenuOpen={() => {}} />

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Creator Platform
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-8xl max-w-4xl mb-8">
            Everything you need to grow as a creator
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="max-w-lg text-base text-muted-foreground leading-relaxed">
              One platform for your sales, marketing, and brand deals. Scale your business and own your audience.
            </div>
            <div className="flex-shrink-0 flex gap-3">
              <Button size="lg" className="h-11 px-6 rounded-md text-sm font-semibold">
                Start for free
              </Button>
              <Button variant="ghost" size="lg" className="h-11 px-4 rounded-md text-sm text-muted-foreground gap-1.5">
                See how it works <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* ── Dashboard showcase ── */}
      <section className="px-6 py-16 border-b border-border sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 items-center">
            <div className="space-y-5">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
              <h2 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl">One and Done</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                One supercharged creator hub to manage everything. Scale your business and own your data with your sales, marketing, and brand deals in one place.
              </p>
              <Link href="/features" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline">
                Explore platform <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src="/images/artifacts/creator_hub_dashboard_1773559784918.png"
                alt="Pasive dashboard"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature list ── */}
      <section className="border-b border-border">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="px-6 py-16 border-b border-border last:border-b-0 sm:py-20"
          >
            <div className={`max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div className="space-y-5">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">{f.label}</p>
                <h2 className="text-2xl font-bold tracking-tight leading-snug sm:text-3xl lg:text-4xl">{f.title}</h2>
                <p className="text-base leading-relaxed text-muted-foreground">{f.body}</p>
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-md text-sm gap-1.5">
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-auto block object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Brand deals inbox ── */}
      <section className="px-6 py-16 border-b border-border sm:py-20">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div className="space-y-5 lg:sticky lg:top-24">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Partnerships</p>
            <h2 className="text-2xl font-bold tracking-tight leading-snug sm:text-3xl">Turn your inbox into brand deals</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We integrate with your emails to help you find the best brands, negotiate high rates, and reply with winning pitches in seconds.
            </p>
          </div>
          <div className="space-y-2 border border-border rounded-xl overflow-hidden bg-card">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Brand Deals Inbox</p>
            </div>
            {[
              { brand: "OSEA", status: "Paid", type: "Affiliate", date: "10:04 AM" },
              { brand: "Fenty Beauty", status: "Negotiating", type: "Paid", date: "Jan 31" },
              { brand: "Lululemon", status: "Signed", type: "Paid", date: "Jan 28" },
            ].map((deal, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-foreground/10 rounded-md flex items-center justify-center text-xs font-bold text-foreground">
                    {deal.brand[0]}
                  </div>
                  <span className="text-sm font-medium">{deal.brand}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium tabular-nums ${
                    deal.status === 'Paid'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : deal.status === 'Signed'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {deal.status}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">{deal.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI section ── */}
      <section className="px-6 py-16 border-b border-border sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-5 lg:sticky lg:top-24">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">AI</p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Work smarter, not harder</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                An AI engine that gets smarter the more you use it—building promotional emails, writing copy, and generating data insights on autopilot.
              </p>
              <ul className="space-y-2.5 pt-2">
                {AI_TOOLS.map((tool, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="border border-border rounded-xl p-5 bg-muted/20">
                <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">You</p>
                <p className="text-sm leading-relaxed">"Generate a promotional email for my new course."</p>
              </div>
              <div className="border border-primary/20 rounded-xl p-5 bg-primary/5">
                <p className="text-xs font-mono text-primary/60 mb-3 uppercase tracking-widest">Pasive AI</p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  "Sure! I've drafted a compelling email highlighting your course value props and added a direct checkout link."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-16 border-b border-border sm:py-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">Social proof</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Creators trust Pasive</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-background p-8 space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-8 bg-foreground/10 rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.author}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section className="px-6 py-16 sm:py-20 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Best bang for your buck on the internet</h2>
              <p className="text-base text-muted-foreground">Join over 100,000+ creators who trust Pasive with their business.</p>
            </div>
            <div className="flex items-stretch gap-px bg-border rounded-xl overflow-hidden flex-shrink-0">
              <div className="bg-background px-8 py-6 space-y-1 text-center">
                <div className="text-2xl font-bold">$0</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Free forever</div>
              </div>
              <div className="bg-background px-8 py-6 space-y-1 text-center">
                <div className="text-2xl font-bold">$30<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Creator Plus</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-11 px-6 rounded-md text-sm font-semibold">
              Start for free
            </Button>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-11 px-6 rounded-md text-sm gap-1.5">
                View all plans <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
