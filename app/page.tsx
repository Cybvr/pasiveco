"use client"
import { useState, useEffect, useRef } from "react"
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
  Star
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

// Creators for the marquee
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
  <div className="relative flex overflow-x-hidden bg-primary py-4 text-primary-foreground font-medium uppercase tracking-widest text-sm">
    <div className="animate-marquee whitespace-nowrap flex items-center">
      {[...CREATORS, ...CREATORS, ...CREATORS].map((creator, i) => (
        <span key={i} className="mx-8 flex items-center gap-2">
          {creator.name} <span className="opacity-50">•</span> {creator.role}
          <span className="mx-8">/</span>
        </span>
      ))}
    </div>
  </div>
);

const FeatureCard = ({ title, subtitle, description, icon: Icon, image, reverse = false }: any) => (
  <section className={`py-24 px-6 ${reverse ? 'bg-muted/30' : 'bg-background'}`}>
    <div className={`max-w-7xl mx-auto flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
      <div className="lg:w-1/2 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
          <Icon className="w-4 h-4" />
          {subtitle}
        </div>
        <h2 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
          {title}
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
          {description}
        </p>
        <Button size="lg" className="rounded-full px-8 py-6 text-lg">
          Get started for free
        </Button>
      </div>
      <div className="lg:w-1/2">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <img
            src={image}
            alt={title}
            className="relative rounded-3xl shadow-2xl border border-border w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary selection:text-primary-foreground">
      <Header isMenuOpen={false} setIsMenuOpen={() => {}} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 select-none pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic text-foreground">
            All you need to <br />
            power your <br />
            <span className="text-primary">creator growth</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            One supercharged creator hub to manage everything. Scale your business and own your data with your sales, marketing, and brand deals in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-10 py-8 text-xl font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all h-auto">
              Start for free
            </Button>
          </div>
        </div>
      </section>

      <Marquee />

      {/* One and Done Section */}
      <section className="py-24 px-6 bg-foreground text-background">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-6xl font-bold tracking-tight">One and Done</h2>
            <p className="text-2xl opacity-80 leading-relaxed">
              One supercharged creator hub to manage everything. Scale your business and own your data with your sales, marketing, and brand deals in one place.
            </p>
            <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
              Explore Platform
            </Button>
          </div>
          <div className="relative">
            <img 
              src="/images/artifacts/creator_hub_dashboard_1773559784918.png" 
              alt="Dashboard" 
              className="rounded-2xl shadow-2xl border border-border/10"
            />
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <FeatureCard
        subtitle="Customize your page"
        title="Make your brand unforgettable"
        description="Build a fully customizable Link in Bio or full website to promote your links, products, email list, and all social platforms—in minutes."
        icon={Palette}
        image="/images/artifacts/link_in_bio_design_1773559804736.png"
      />

      <FeatureCard
        subtitle="Own your audience"
        title="Screw the algorithm & market direct to fans"
        description="Stop renting your audience—own it. Build a subscriber list, send emails, and automate DMs to turn comments into cash and followers into fans."
        icon={Users}
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
        reverse
      />

      <FeatureCard
        subtitle="Drive sales"
        title="Sell your own products & promote affiliate links"
        description="Sell digital products, courses, appointments, and link to affiliates, right from your Link in Bio. Drive more sales with native checkout and cash out in one day."
        icon={DollarSign}
        image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
      />

      <FeatureCard
        subtitle="Get paid"
        title="Build your dream brand partnerships"
        description="Show brands where to spend their money: on you. Turn affiliate links into brand deals, pitch to brands directly, and use real-time media kits to land partnerships that pay."
        icon={Briefcase}
        image="/images/artifacts/brand_deals_inbox_1773559825324.png"
        reverse
      />

      {/* Brand Deals Inbox Snippet */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Turn your inbox into brand deals</h2>
            <p className="text-xl text-muted-foreground">We integrate with your emails and workflow to help you find the best brands, negotiate high rates, and reply with winning pitches in seconds.</p>
          </div>
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="space-y-4">
              {[
                { brand: "OSEA", status: "Paid", type: "Affiliate", date: "10:04 AM" },
                { brand: "Fenty Beauty", status: "Negotiating", type: "Paid", date: "Jan 31" },
                { brand: "Lululemon", status: "Signed", type: "Paid", date: "Jan 28" },
              ].map((deal, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {deal.brand[0]}
                    </div>
                    <div className="text-left font-bold">{deal.brand}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${deal.status === 'Paid' ? 'bg-green-500/10 text-green-600' : deal.status === 'Signed' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                      {deal.status}
                    </span>
                    <span className="text-sm text-muted-foreground">{deal.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center rotate-3">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-5xl font-bold tracking-tight">AI that Helps You Work Smarter</h2>
              <p className="text-xl text-muted-foreground">An AI learning engine that gets smarter the more you use it—by building promotional emails, writing copy, and generating data insights.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AI_TOOLS.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 font-medium">
                    <Check className="w-5 h-5 text-primary" />
                    {tool}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-12 rounded-[3rem] border border-primary/10 relative">
               <div className="absolute inset-0 bg-grid-black/[0.02] flex items-center justify-center" />
               <div className="relative space-y-6">
                 <div className="p-6 bg-card rounded-2xl shadow-xl border border-border max-w-sm mr-auto animate-float">
                   <p className="text-sm font-medium">"Hey AI, generate a promotional email for my new Course."</p>
                 </div>
                 <div className="p-6 bg-primary text-primary-foreground rounded-2xl shadow-xl max-w-sm ml-auto animate-float-delayed">
                   <p className="text-sm font-medium">"Sure! I've drafted a compelling email highlighting your course value props and added a direct checkout link."</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 px-6 bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold">Become the next big thing with Pasive</h2>
            <p className="text-xl text-muted-foreground">Wherever you are in your creator journey, Pasive has the tools you need to level up and grow your income.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
             {[Smartphone, Shield, Zap, TrendingUp, Mail, Globe].map((Icon, i) => (
               <div key={i} className="group p-8 bg-card rounded-3xl border border-border hover:border-primary transition-all hover:shadow-2xl hover:shadow-primary/10 flex flex-col items-center gap-4">
                 <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                 <span className="text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity">Integration</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="text-5xl font-bold text-center">The most ambitious creators love Pasive.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-10 bg-muted/30 rounded-[2.5rem] space-y-6 relative group hover:bg-muted/50 transition-colors">
                <div className="flex text-yellow-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xl leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary italic">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-bold">{t.author}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6 bg-foreground text-background text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl font-bold">Get the best bang for your buck on the internet</h2>
          <p className="text-xl opacity-80">Join over 100,000+ creators who trust Pasive with their business.</p>
          <div className="flex items-center justify-center gap-8 py-8">
             <div className="space-y-2">
               <div className="text-4xl font-bold">$0</div>
               <div className="uppercase tracking-widest text-xs opacity-60">Free Forever</div>
             </div>
             <div className="w-px h-16 bg-background/20" />
             <div className="space-y-2">
               <div className="text-4xl font-bold">$30<span className="text-xl opacity-60">/mo</span></div>
               <div className="uppercase tracking-widest text-xs opacity-60">Creator Plus</div>
             </div>
          </div>
          <Link href="/pricing">
            <Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 font-bold px-12 h-auto py-6">
              View All Plans
            </Button>
          </Link>
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out 2s infinite;
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