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
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import AIOnboardingSticky from "@/app/common/website/AIOnboardingSticky"

const TESTIMONIALS = [
  {
    quote: "As a standup comedian, Pasive makes it easy for my fans to subscribe and I send targeted emails by city whenever I'm on tour. Nothing else comes close.",
    author: "Chidi Okonkwo",
    role: "Comedian"
  },
  {
    quote: "I've built an email list that's fully mine. No algorithm can take that away. Pasive made it simple from day one.",
    author: "Ngozi Obi",
    role: "Fitness Creator"
  },
  {
    quote: "The Pasive Store let me start selling my style guides immediately. Brand visibility went up and the checkout is seamless.",
    author: "Dami Adeyemi",
    role: "Fashion Creator"
  },
  {
    quote: "Everything in one place — my store, brand deals, and email list. I don't know how I managed without it.",
    author: "Amaka Eze",
    role: "Lifestyle Creator"
  }
];

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
    <div className="flex flex-col min-h-screen bg-background selection:bg-foreground selection:text-background font-sans overflow-x-hidden">
      <Header isMenuOpen={false} setIsMenuOpen={() => { }} />

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
            <h1 className="text-[12vw] sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.85] tracking-tighter text-foreground text-left lg:text-center transition-all">
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

      {/* ── Collage Section: Creativity Powered ── */}
      <section className="px-6 py-32 bg-background relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-auto">
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
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.9]">
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

      {/* ── Feature: Complete Creative Control ── */}
      <section className="px-6 py-40 bg-zinc-950 text-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="inline-block px-3 py-1 border border-zinc-700 text-[10px] uppercase tracking-widest text-zinc-400 rounded-none">
                The Algorithm Killer
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                Complete <br /> creative <br /> control
              </h2>
              <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                No shadow-banning. No reach suppression. Your content is delivered directly to your fans via email, SMS, and your private feed.
              </p>
              <div className="pt-6 grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">100%</div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500">Reach</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-emerald-400">0</div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500">Algorithmic bias</div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2 group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-none blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&q=80"
                alt="Mobile Dashboard Mockup"
                className="relative border border-zinc-800 shadow-3xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700 rounded-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── High Contrast: Creators. Fans. ── */}
      <section className="px-6 py-40 bg-background text-foreground text-center space-y-16">
        <h2 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none uppercase">
          Creators. Fans. <br /> <span className="opacity-20 italic font-medium">Nothing in between.</span>
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

      {/* ── Feature: Passions into Businesses ── */}
      <section className="px-6 py-40 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-baseline justify-between mb-24 gap-6">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Turning passions <br /> into businesses</h2>
            <p className="text-xl text-muted-foreground max-w-sm">From digital products to recurring subscriptions, we provide the infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Downloads",
                desc: "Sell courses, templates, and assets with one-click checkouts.",
                icon: DollarSign,
                color: "text-amber-500"
              },
              {
                title: "Membership Tiers",
                desc: "Build recurring revenue streams with custom fan perks.",
                icon: Star,
                color: "text-purple-500"
              },
              {
                title: "Brand Deals",
                desc: "Land high-paying partnerships with automated media kits.",
                icon: Zap,
                color: "text-emerald-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-background rounded-none border border-border hover:border-foreground transition-all duration-500 space-y-6">
                <div className={`w-12 h-12 rounded-none bg-muted flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                <div className="pt-4 overflow-hidden h-6">
                  <div className="group-hover:-translate-y-full transition-transform duration-500">
                    <div className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      Learn more <Plus className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 pt-2">
                      Let's go <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-32 bg-background border-b border-border">
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

      {/* ── Final CTA ── */}
      <section className="px-6 py-40 relative group overflow-hidden">
        <div className="absolute inset-0 bg-foreground pointer-events-none transition-transform duration-1000 scale-[1.01] group-hover:scale-100" />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12 text-background">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none italic">
            Ready to rule your house?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 h-16 px-12 text-xl font-bold">
              Get Started Now
            </Button>
            <span className="text-lg opacity-60">Join 100+ creators today</span>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-40 h-40 border border-background/20 rounded-none blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-primary/20 rounded-none blur-[100px]" />
      </section>

      <AIOnboardingSticky />
      <Footer />
    </div>
  )
}
