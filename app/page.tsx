"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import Header from "@/app/common/website/Header"
import Footer from "@/app/common/website/Footer"
import {
  Check,
  ArrowRight,
  TrendingUp,
  Mail,
  DollarSign,
  Shield,
  Zap,
  Globe,
  Star,
  Plus,
  Package,
  BookOpen,
  Video,
  Play,
  X,
  Ticket,
  Briefcase,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import AIOnboardingSticky from "@/app/common/website/AIOnboardingSticky"
import CurrencyPayoutSection from "@/app/common/website/CurrencyPayoutSection"
import VibrantSpaceWidget from "@/app/common/website/VibrantSpaceWidget"
import { getUserCount } from "@/services/userService"
import CookieConsentBanner from "@/components/common/CookieConsentBanner"

const TESTIMONIALS = [
  {
    quote: "As a creator, Pasive makes it easy to bring my fans into one dedicated space where we can truly connect. Nothing else comes close.",
    author: "Chidi Okonkwo",
    role: "Comedian"
  },
  {
    quote: "I've built a space that's fully mine. No algorithm can take that away. Pasive made it simple from day one.",
    author: "Ngozi Obi",
    role: "Fitness Creator"
  },
  {
    quote: "The Pasive Store let me start selling my style guides immediately. Discovering products on the affiliate network boosted my income instantly.",
    author: "Dami Adeyemi",
    role: "Fashion Creator"
  },
  {
    quote: "Everything in one place — my store, affiliate network, and space. I don't know how I managed without it.",
    author: "Amaka Eze",
    role: "Lifestyle Creator"
  }
];

const SALES_EARNINGS = [
  { name: "Abdussamad S", amount: "₦200", time: "11 days ago" },
  { name: "Precious O", amount: "₦200", time: "11 days ago" },
  { name: "Aniebiet U", amount: "₦200", time: "11 days ago" },
  { name: "Favour A", amount: "₦200", time: "11 days ago" },
  { name: "Mary A", amount: "₦200", time: "11 days ago" },
  { name: "Oluwabukola F", amount: "₦200", time: "11 days ago" },
  { name: "Bunmi R", amount: "₦200", time: "11 days ago" },
  { name: "Rukayat R", amount: "₦186", time: "11 days ago" },
  { name: "Emmanuel C", amount: "₦186", time: "11 days ago" },
  { name: "Nwachinemerem O", amount: "₦200", time: "11 days ago" },
  { name: "Eniola O", amount: "₦186", time: "11 days ago" },
  { name: "Maryann N", amount: "₦200", time: "11 days ago" },
  { name: "Rofiu A", amount: "₦186", time: "11 days ago" },
  { name: "Mariam A", amount: "₦200", time: "11 days ago" },
  { name: "Fredrick A", amount: "₦186", time: "11 days ago" },
  { name: "Chigozie I", amount: "₦186", time: "11 days ago" },
  { name: "Mistura A", amount: "₦186", time: "11 days ago" },
  { name: "Asaph N", amount: "₦200", time: "11 days ago" },
  { name: "Franklin E", amount: "₦186", time: "11 days ago" },
  { name: "Wasiu A", amount: "₦200", time: "11 days ago" },
  { name: "Mosunmade F", amount: "₦186", time: "11 days ago" },
  { name: "Faizat A", amount: "₦465", time: "11 days ago" },
  { name: "Olusegun D", amount: "₦465", time: "11 days ago" },
  { name: "Semilore A", amount: "₦500", time: "11 days ago" },
  { name: "Mujeebat A", amount: "₦500", time: "11 days ago" },
  { name: "Perpetual O", amount: "₦465", time: "11 days ago" },
  { name: "Ayomikun O", amount: "₦27,900", time: "2 days ago" },
  { name: "Ayomikun O", amount: "₦18,600", time: "2 days ago" },
  { name: "Desmond O", amount: "₦30,000", time: "2 days ago" },
  { name: "Gbenga A", amount: "₦27,900", time: "2 days ago" },
  { name: "Folajimi O", amount: "₦27,900", time: "2 days ago" },
  { name: "Oluwaseyi B", amount: "₦27,900", time: "2 days ago" },
  { name: "Benjamin S", amount: "₦15,000", time: "2 days ago" },
  { name: "Precious B", amount: "₦13,950", time: "2 days ago" },
  { name: "Abigail E", amount: "₦15,000", time: "2 days ago" },
  { name: "Daniel A", amount: "₦15,000", time: "4 days ago" },
  { name: "Adebisi A", amount: "₦15,000", time: "4 days ago" },
  { name: "Elijah K", amount: "₦13,950", time: "4 days ago" },
  { name: "Aisha I", amount: "₦15,000", time: "4 days ago" },
  { name: "Nasir M", amount: "₦13,950", time: "4 days ago" },
  { name: "Faizah O", amount: "₦15,000", time: "4 days ago" },
  { name: "Fredrick A", amount: "₦27,900", time: "11 days ago" },
  { name: "Joy P", amount: "₦30,000", time: "11 days ago" },
  { name: "Janet A", amount: "₦30,000", time: "11 days ago" },
  { name: "Joy P", amount: "₦200", time: "11 days ago" },
]

function SalesEarningsTicker() {
  return (
    <section className="sales-earnings-ticker">
      <div className="sales-earnings-ticker__fade sales-earnings-ticker__fade--left" />
      <div className="sales-earnings-ticker__fade sales-earnings-ticker__fade--right" />

      <div className="sales-earnings-ticker__track">
        {[...SALES_EARNINGS, ...SALES_EARNINGS].map((earning, index) => (
          <div
            key={`${earning.name}-${earning.amount}-${earning.time}-${index}`}
            className="sales-earnings-ticker__item"
            aria-hidden={index >= SALES_EARNINGS.length}
          >
            <span className="sales-earnings-ticker__name">{earning.name}</span>
            <span className="sales-earnings-ticker__muted">earned</span>
            <span className="sales-earnings-ticker__amount">{earning.amount}</span>
            <span className="sales-earnings-ticker__muted">{earning.time}</span>
            <span className="sales-earnings-ticker__dot">•</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    const fetchUserCount = async () => {
      const count = await getUserCount()
      setUserCount(count)
    }
    fetchUserCount()
  }, [])

  const displayCount = userCount !== null ? (userCount >= 1000 ? `${(userCount / 1000).toFixed(1)}k+` : userCount) : '...'

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  if (loading || user) return null

  return (
    <div className="marketing-font flex flex-col min-h-screen bg-background selection:bg-foreground selection:text-background font-sans overflow-x-clip home-page [&_h1]:uppercase [&_h2]:uppercase [&_h3]:uppercase [&_h4]:uppercase [&_h5]:uppercase [&_h6]:uppercase">
      <div className="sticky top-0 z-50">
        <Header isMenuOpen={false} setIsMenuOpen={() => { }} />
      </div>

      <SalesEarningsTicker />

      {/* ── Patreon Style Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/redesign/hero.png"
            alt="Hero background"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay lg:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-6xl w-full text-center space-y-12">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-none sm:leading-[0.85] tracking-tighter text-foreground text-left lg:text-center transition-all">
              <span className="block italic font-light opacity-60">Your house</span>
              <span className="block -mt-1 sm:-mt-4">Your rules</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 pt-12 text-left">
            <div className="max-w-md space-y-4">
              <p className="text-xl md:text-2xl font-medium leading-tight">
                Stop chasing algorithms. Build a business you own, with direct fan access and native commerce tools.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="rounded-none px-8 bg-foreground text-background hover:bg-foreground/90 transition-all">
                  Get started
                </Button>
                <Button variant="outline" size="lg" className="rounded-none px-8 hover:bg-background/20 transition-all">
                  How it works
                </Button>
              </div>
              <p className="text-xs uppercase tracking-widest font-mono opacity-50">Join {displayCount} creators building their house on Pasive</p>
            </div>

            <div className="hidden lg:block text-xs uppercase tracking-[0.3em] font-mono opacity-50 space-y-1">
              <p>Pasive Platform v2.0</p>
              <p>Creative Independence Era</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-px h-12 bg-foreground" />
        </div>
      </section>

      <section className="relative z-10 bg-background px-6 py-12">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="group relative aspect-[9/16] w-full overflow-hidden bg-foreground text-background shadow-2xl transition-transform duration-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-4 focus:ring-offset-background"
            aria-label="Play Pasive video"
          >
            <img
              src="https://i.ytimg.com/vi/tk4mRRz2xWI/hqdefault.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
            <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/30 bg-white text-black transition-transform duration-500 group-hover:scale-110">
              <Play className="h-7 w-7 fill-current" />
            </span>
          </button>
        </div>
      </section>

      {isVideoOpen ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pasive YouTube video"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative aspect-[9/16] w-full max-w-[460px] overflow-hidden bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/tk4mRRz2xWI?autoplay=1&mute=1&playsinline=1&rel=0"
              title="Pasive YouTube Short"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-black/70 text-white backdrop-blur transition-colors hover:bg-black"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <section className="px-6 py-16 bg-background relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-video sm:aspect-square lg:aspect-auto h-[400px] lg:h-auto">
            {/* Collage elements */}
            <div className="absolute top-0 left-0 w-2/3 aspect-[4/5] bg-muted/20 overflow-hidden shadow-2xl z-20 group hover:scale-[1.02] transition-transform duration-700 rounded-none">
              <img src="/images/redesign/hero.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 text-xs font-mono uppercase bg-background/80 backdrop-blur px-2 py-1 rounded-none">Digital Art</div>
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 aspect-square bg-muted/20 overflow-hidden shadow-2xl z-30 group hover:scale-[1.05] transition-transform duration-700 rounded-none">
              <img src="/images/redesign/podcast.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 text-xs font-mono uppercase bg-background/80 backdrop-blur px-2 py-1 rounded-none">Audio</div>
            </div>
            <div className="absolute top-1/4 right-0 w-1/3 aspect-[3/4] bg-muted/20 overflow-hidden shadow-xl z-10 group hover:scale-[1.02] transition-transform duration-700 rounded-none">
              <img src="/images/redesign/fitness.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 text-xs font-mono uppercase bg-background/80 backdrop-blur px-2 py-1 rounded-none">Lifestyle</div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.9]">
              Creativity <span className="block opacity-40">powered</span> <span className="italic font-light">by fandom</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Pasive is more than a platform. It's an ecosystem for creators to build deep, direct relationships with their most passionate fans.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Link href="/about" className="group flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors">
                Learn our mission <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-zinc-950 text-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="inline-block px-3 py-1 border border-zinc-700 text-[10px] uppercase tracking-widest text-zinc-400 rounded-none">
                Your Space Hub
              </div>
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none">
                Build <br /> vibrant <br /> spaces
              </h2>
              <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                Bring your fans together in one place. Your content, discussions, and digital products all delivered directly to your dedicated space.
              </p>
              <div className="pt-6 grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">100%</div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500">Ownership</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-400">0</div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500">Distractions</div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <VibrantSpaceWidget />
            </div>

          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-background text-foreground text-center space-y-16">
        <h2 className="text-5xl md:text-9xl font-extrabold tracking-tighter leading-none uppercase">
          Creators. Fans. <br /> <span className="opacity-20 italic font-medium lowercase">Nothing in between.</span>
        </h2>

        <div className="max-w-xl mx-auto space-y-8">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Pasive removes the friction between creation and monetization. Your followers become your patrons instantly.
          </p>
          <Button size="lg" className="rounded-none h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform">
            Start your journey
          </Button>
        </div>
      </section>

      <section className="px-6 py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-24 gap-6">
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight">One platform. <br /> Every product.</h2>
            <p className="text-xl text-muted-foreground max-w-sm">From digital assets to physical goods, we provide the infrastructure for every kind of creator.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {[
              {
                title: "Digital Products",
                desc: "Sell any and every kind of digital product, from content packs to designs to bundles and more without stress.",
                icon: Package,
                color: "text-blue-500"
              },
              {
                title: "Ebooks",
                desc: "Pasive is the best platform to sell your ebooks both downloadable and non-downloadable in any format.",
                icon: BookOpen,
                color: "text-amber-500"
              },
              {
                title: "Courses & Memberships",
                desc: "You can host your courses & membership sites with unlimited videos & files, unlimited storage, and have unlimited students, plus you get content security to prevent theft.",
                icon: Video,
                color: "text-purple-500"
              },
              {
                title: "Event Tickets & Training",
                desc: "Sell tickets for events and access to masterclasses, workshops, training, webinars, and more.",
                icon: Ticket,
                color: "text-rose-500"
              },
              {
                title: "Services",
                desc: "Sell any kind of service, from coaching and consultations to counseling sessions and design services.",
                icon: Briefcase,
                color: "text-emerald-500"
              },
              {
                title: "Physical Goods",
                desc: "Use Pasive to sell your physical products from clothing to books to electronics and appliances.",
                icon: ShoppingBag,
                color: "text-orange-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-12 bg-background hover:bg-muted/10 transition-all duration-500 space-y-8 flex flex-col h-full relative overflow-hidden">
                <div className={`w-14 h-14 flex items-center justify-center bg-muted/50 transition-colors group-hover:bg-background ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <div className="space-y-4 flex-grow">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
                </div>
                <div className="pt-6">
                  <div className="text-xs font-mono uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    Start selling <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CurrencyPayoutSection />

      <section className="px-6 py-16 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">Trusted by the best</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-background p-10 flex flex-col justify-between space-y-8 h-full">
                <p className="text-lg font-light leading-relaxed italic opacity-80">"{t.quote}"</p>
                <div className="space-y-1">
                  <div className="font-bold text-sm tracking-widest uppercase">{t.author}</div>
                  <div className="text-xs text-muted-foreground uppercase">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 relative group overflow-hidden">
        <div className="absolute inset-0 bg-foreground pointer-events-none transition-transform duration-1000 scale-[1.01] group-hover:scale-100" />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12 text-background">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none italic">
            Ready to rule your house?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-16 px-12 text-xl font-bold">
              Get Started Now
            </Button>
            <span className="text-lg opacity-60">Join {displayCount} creators today</span>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-40 h-40 border border-background/20 rounded-none blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-primary/20 rounded-none blur-[100px]" />
      </section>

      <AIOnboardingSticky />
      <Footer />
      <CookieConsentBanner />
    </div>
  )
}
