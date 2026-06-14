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
import CurrencyPayoutSection from "@/app/common/website/CurrencyPayoutSection"
import VibrantSpaceWidget from "@/app/common/website/VibrantSpaceWidget"
import { getUserCount } from "@/services/userService"
import CookieConsentBanner from "@/components/common/CookieConsentBanner"

const TESTIMONIALS = [
  {
    quote: "As a creator, Pasive makes it easy to bring my audience into one dedicated space where we can truly connect. Nothing else comes close.",
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


const SHORTS_VIDEOS = [
  { id: "tk4mRRz2xWI", label: "Pasive short 1" },
  { id: "IQ5qH3G7CWE", label: "Pasive short 2" },
  { id: "Be0ClH82Sxw", label: "Pasive short 3" },
  { id: "9c1dSXPUkf4", label: "Pasive short 4" },
  { id: "38eQ2yXDMaw", label: "Pasive short 5" },
  { id: "FuKxneywESs", label: "Pasive short 6" },
]


export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userCount, setUserCount] = useState<number | null>(null)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

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
    <div className="marketing-font relative flex flex-col min-h-screen bg-background selection:bg-foreground selection:text-background font-sans overflow-x-hidden home-page">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header isMenuOpen={false} setIsMenuOpen={() => { }} overlay />
      </div>

      {/* ── Patreon Style Hero ── */}
      <section className="dark bg-background text-foreground relative h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/redesign/hero.png"
            alt="Hero background"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay lg:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-normal leading-none sm:leading-[0.85] tracking-tighter text-foreground transition-all">
            <span className="block italic font-light text-muted-foreground">Your house</span>
            <span className="block -mt-1 text-foreground sm:-mt-3">Your rules</span>
          </h1>

          <p className="max-w-md text-base font-medium leading-tight text-muted-foreground md:text-lg">
            Build a business you own, with direct fan access and native commerce tools.
          </p>

          <div className="flex gap-4">
            <Button size="lg">
              Get started
            </Button>
            <Button variant="outline" size="lg">
              How it works
            </Button>
          </div>

          <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">Join {displayCount} creators building their house on Pasive</p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-px h-12 bg-foreground" />
        </div>
      </section>

      <section className="relative z-10 bg-background py-12">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-4">
            {SHORTS_VIDEOS.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => setActiveVideoId(video.id)}
                className="group relative aspect-[9/16] w-[38vw] min-w-[150px] max-w-[220px] snap-start overflow-hidden rounded-sm bg-foreground text-background shadow-xl transition-transform duration-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-4 focus:ring-offset-background sm:w-[190px] lg:w-[205px]"
                aria-label={`Play ${video.label}`}
              >
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <span className="absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-white text-black transition-transform duration-500 group-hover:scale-110">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeVideoId ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pasive YouTube video"
          onClick={() => setActiveVideoId(null)}
        >
          <div
            className="relative aspect-[9/16] w-full max-w-[460px] overflow-hidden rounded-sm bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
              title="Pasive YouTube Short"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setActiveVideoId(null)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-sm bg-black/70 text-white backdrop-blur transition-colors hover:bg-black"
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
            <div className="absolute top-0 left-0 w-2/3 aspect-[4/5] bg-muted/20 overflow-hidden shadow-2xl z-20 group hover:scale-[1.02] transition-transform duration-700 rounded-sm">
              <img src="/images/redesign/hero.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 rounded-sm bg-background/80 px-2 py-1 text-xs font-mono uppercase text-foreground backdrop-blur">Digital Art</div>
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 aspect-square bg-muted/20 overflow-hidden shadow-2xl z-30 group hover:scale-[1.05] transition-transform duration-700 rounded-sm">
              <img src="/images/redesign/podcast.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 rounded-sm bg-background/80 px-2 py-1 text-xs font-mono uppercase text-foreground backdrop-blur">Audio</div>
            </div>
            <div className="absolute top-1/4 right-0 w-1/3 aspect-[3/4] bg-muted/20 overflow-hidden shadow-xl z-10 group hover:scale-[1.02] transition-transform duration-700 rounded-sm">
              <img src="/images/redesign/fitness.png" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-4 left-4 rounded-sm bg-background/80 px-2 py-1 text-xs font-mono uppercase text-foreground backdrop-blur">Lifestyle</div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[0.9]">
              Creativity <span className="block text-muted-foreground">powered</span> <span className="italic font-light text-foreground">by fandom</span>
            </h2>
            <p className="max-w-lg text-base text-muted-foreground leading-relaxed">
              Pasive is more than a platform. It's an ecosystem for creators to build deep, direct relationships with their most passionate audience.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Link href="/about" className="group flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-primary">
                Learn our mission <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background px-6 py-20 text-foreground">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="inline-block rounded-sm border border-border px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Your Space Hub
              </div>
              <h2 className="text-4xl text-foreground md:text-7xl font-normal tracking-tighter leading-none">
                Build <br /> vibrant <br /> spaces
              </h2>
              <p className="max-w-md text-base font-light leading-relaxed text-muted-foreground">
                Bring your audience together in one place. Your content, discussions, and digital products all delivered directly to your dedicated space.
              </p>
              <div className="pt-6 grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-foreground">100%</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Ownership</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-foreground">0</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Distractions</div>
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
        <h2 className="text-5xl md:text-9xl font-normal tracking-tighter leading-none text-foreground">
          Creators. audience. <br /> <span className="italic font-medium lowercase text-muted-foreground">Nothing in between.</span>
        </h2>

        <div className="max-w-xl mx-auto space-y-8">
          <p className="text-base text-muted-foreground leading-relaxed">
            Pasive removes the friction between creation and monetization. Your followers become your patrons instantly.
          </p>
          <Button size="lg">
            Start your journey
          </Button>
        </div>
      </section>

      <section className="px-6 py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-24 gap-6">
            <h2 className="text-4xl text-foreground md:text-7xl font-normal tracking-tight">One platform. <br /> Every product.</h2>
            <p className="max-w-sm text-base text-muted-foreground">From digital assets to physical goods, we provide the infrastructure for every kind of creator.</p>
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
                <div className={`w-14 h-14 flex items-center justify-center rounded-sm bg-muted/50 transition-colors group-hover:bg-background ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <div className="space-y-4 flex-grow">
                  <h3 className="text-2xl font-normal tracking-tight text-foreground">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
                <div className="pt-6">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
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
            <h2 className="text-5xl text-foreground md:text-6xl font-normal tracking-tighter">Trusted by the best</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-background p-10 flex flex-col justify-between space-y-8 h-full">
                <p className="text-base font-light italic leading-relaxed text-foreground">"{t.quote}"</p>
                <div className="space-y-1">
                  <div className="font-bold text-sm tracking-widest uppercase text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground uppercase">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative group overflow-hidden bg-muted/30 px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted/40 pointer-events-none transition-transform duration-1000 scale-[1.01] group-hover:scale-100" />
        <div className="relative z-10 mx-auto max-w-5xl space-y-12 text-center text-foreground">
          <h2 className="text-5xl md:text-8xl font-normal tracking-tighter leading-none italic text-foreground">
            Ready to rule your house?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="secondary" size="lg">
              Get Started Now
            </Button>
            <span className="text-base text-muted-foreground">Join {displayCount} creators today</span>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-40 h-40 border border-background/20 rounded-sm blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-primary/20 rounded-sm blur-[100px]" />
      </section>

      <Footer />
      <CookieConsentBanner />
    </div>
  )
}
