"use client"
 
import React, { useState } from 'react'
import Header from "@/app/common/website/Header"
import Footer from "@/app/common/website/Footer"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Users, 
  Package, 
  Store, 
  DollarSign, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Quote, 
  ShieldCheck, 
  Zap,
  Star
} from "lucide-react"
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion"
 
const STATS = [
  { label: "Affiliate partners", value: "2,000+" },
  { label: "Products", value: "30,000+" },
  { label: "Merchants", value: "35,000+" },
  { label: "Earned by affiliates", value: "NGN 40,000,000+" },
]
 
const TESTIMONIALS = [
  {
    quote: "On September 1st, 2023 I got myself on the Pasive affiliate network. I started by promoting weight loss products for one week, then switched to the how-to-make-money niche. It took me 1 month to make my first 20k and two months later, I made my first 100k in life from affiliate marketing.",
    author: "Godfrey Mato",
    role: "Affiliate Marketer"
  },
  {
    quote: "I checked my Pasive dashboard now. Only to discover I had made 8 million as an affiliate marketer. Yesterday is gone; you have today to make that decision that will change your life forever. Affiliate marketing may not be your dream business, but believe me, if can fund your lifestyle.",
    author: "Obamakinde Samuel",
    role: "Affiliate Marketer"
  }
]
 
const FAQS = [
  {
    question: "What is the Pasive affiliate network?",
    answer: "The Pasive Affiliate Network is a marketplace where digital creators (merchants) list their products for affiliates to find and promote. Affiliates earn a commission for every sale made through their unique link."
  },
  {
    question: "How is commission determined?",
    answer: "Commissions are set by the product owner (merchant). It can range from 10% to as high as 70% of the product price."
  },
  {
    question: "How can I join the affiliate network?",
    answer: "Simply sign up on Pasive, subscribe to our yearly affiliate plan for NGN 3,000, and start browsing thousands of products to promote."
  },
  {
    question: "How many products are in the affiliate network?",
    answer: "There are currently over 30,000 products across various categories including education, health, finance, and lifestyle."
  },
  {
    question: "How soon can I receive my payout after I make a sale?",
    answer: "Payouts are typically processed automatically based on our standard withdrawal schedule, ensuring you get your earnings quickly and reliably."
  }
]
 
export default function AffiliateNetworkPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
 
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-foreground selection:text-background font-sans overflow-x-hidden">
      <Header isMenuOpen={false} setIsMenuOpen={() => { }} />
 
      {/* ── Hero Section ── */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/artifacts/affiliate_network_hero_1774269393018.png"
            alt="Affiliate Network Hero"
            className="w-full h-full object-cover grayscale-[0.4] opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/40 to-transparent" />
        </div>
 
        <div className="relative z-10 max-w-7xl w-full">
          <div className="max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[14vw] sm:text-8xl md:text-9xl lg:text-[11rem] font-bold leading-[0.8] tracking-tighter text-foreground text-left">
                <span className="block opacity-40 italic font-extralight tracking-tight">Earn extra</span>
                <span className="block -mt-1 sm:-mt-4">Income.</span>
              </h1>
            </motion.div>
 
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="pl-2 border-l-4 border-foreground"
            >
              <p className="text-xl md:text-3xl font-medium leading-tight max-w-2xl tracking-tight">
                Promote other people’s products. Start promoting African digital products instantly and earn on every sale.
              </p>
            </motion.div>
 
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-col sm:flex-row gap-6 pt-4"
            >
              <Button size="lg" className="rounded-none h-16 px-12 text-xl font-black bg-foreground text-background hover:bg-foreground/90 transition-all uppercase tracking-tighter">
                Get Started Now <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        </div>
 
        <div className="absolute bottom-10 right-10 hidden md:block text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-difference">
          Pasive Network v1.0 // 2024
        </div>
      </section>
 
      {/* ── Network Intro Section ── */}
      <section className="px-6 py-32 bg-background relative z-10 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid lg:grid-cols-2 gap-20 items-end">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase">
                  Join the <span className="italic font-light opacity-30">Biggest</span> Network in Africa
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                  Pasive is the largest marketplace for digital creators in Africa. Thousands of creators use Pasive to sell services and digital products globally. You can help them reach more people and earn by doing that.
                </p>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-none group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight uppercase">30,000+ Products</h3>
                  <p className="text-muted-foreground">Finally, a wide range of products you can start selling right now as an affiliate.</p>
                </div>
                <div className="space-y-4 group">
                  <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-none group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight uppercase">High Commissions</h3>
                  <p className="text-muted-foreground">Earn significant commissions every time someone buys through your affiliate link.</p>
                </div>
              </div>
            </div>
 
            <div className="relative aspect-[4/5] bg-muted/20 overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                alt="Affiliate working"
              />
              <div className="absolute top-8 right-8 bg-background p-6 shadow-xl border border-border">
                <p className="text-5xl font-black tracking-tighter leading-none">1,000+</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Ready to sell products</p>
              </div>
            </div>
          </div>
 
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-y border-border py-20">
            {STATS.map((stat, i) => (
              <div key={i} className="space-y-2 text-center lg:text-left transition-transform hover:scale-105">
                <div className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">{stat.value}</div>
                <div className="text-xs uppercase tracking-[0.2em] font-mono opacity-50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── How to Join Section ── */}
      <section className="px-6 py-40 bg-zinc-950 text-zinc-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="text-center space-y-6">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              How to <span className="italic font-light opacity-30">Join the</span> <span className="block italic font-light opacity-30">Affiliate Network</span>
            </h2>
          </div>
 
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {[
              { id: "01", title: "Sign up", text: "Create your Pasive account in seconds to get started on your journey." },
              { id: "02", title: "Subscribe", text: "Subscribe to our yearly plan to access the Affiliate Network - NGN 3,000" },
              { id: "03", title: "Browse", text: "Browse our catalog of products and choose what you want to promote." },
              { id: "04", title: "Earn", text: "Get your link, recommend it to people, make a sale & earn a commission." }
            ].map((step, i) => (
              <div key={i} className="p-10 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all group rounded-none h-full">
                <div className="text-4xl font-black text-zinc-700 group-hover:text-primary transition-colors mb-8">{step.id}</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">{step.title}</h3>
                <p className="text-zinc-400 font-light leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
 
          <div className="flex flex-col items-center space-y-8 pt-12">
            <Button size="lg" className="rounded-none h-16 px-16 text-xl font-bold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 uppercase tracking-tighter">
              Subscribe Now
            </Button>
            <div className="flex items-center gap-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4 text-primary" />
              Join 2000+ affiliates already earning
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-[10%] left-[5%] text-[20vw] font-black italic select-none">JOIN.</div>
          <div className="absolute bottom-[10%] right-[5%] text-[20vw] font-black italic select-none">EARN.</div>
        </div>
      </section>
 
      {/* ── Community Section ── */}
      <section className="px-6 py-40 border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter uppercase">
              Learn, <span className="italic font-light opacity-30">Connect</span> & Grow with Top <span className="italic">Affiliates</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-light">
              Join a thriving community of affiliates sharing insights, strategies, and opportunities to grow faster together.
            </p>
            <Button variant="outline" size="lg" className="rounded-none h-14 px-10 text-lg font-bold border-foreground hover:bg-foreground hover:text-background transition-all uppercase tracking-tighter">
              Join Affiliate Community
            </Button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" className="w-full aspect-square object-cover grayscale" />
            <img src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80" className="w-full aspect-square object-cover mt-12 grayscale" />
          </div>
        </div>
      </section>
 
      {/* ── Testimonials Section ── */}
      <section className="px-6 py-40 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex items-end justify-between border-b border-border pb-12">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
              Reviews / <span className="italic font-light opacity-30">Network Stories</span>
            </h2>
            <div className="hidden lg:block">
              <Quote className="w-20 h-20 opacity-10" />
            </div>
          </div>
 
          <div className="grid md:grid-cols-2 gap-12">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-12 border border-border flex flex-col justify-between space-y-12 hover:border-foreground transition-colors group">
                <Quote className="w-12 h-12 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="text-2xl md:text-3xl font-light leading-snug italic tracking-tight opacity-90">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4 pt-8">
                  <div className="w-12 h-12 bg-muted rounded-none shrink-0 border border-border flex items-center justify-center font-bold text-xl">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-sm">{t.author}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── Merchant CTA Section ── */}
      <section className="px-6 py-40 bg-foreground text-background relative group">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] italic uppercase group-hover:scale-105 transition-transform duration-1000 origin-left">
              Boost your <br /> Sales with <span className="font-light opacity-40">Affiliates</span>
            </h2>
            <p className="text-xl opacity-60 max-w-lg leading-relaxed font-light">
              Want to leverage the Pasive Affiliate Network? Here's how to list your products for amazing affiliates to find.
            </p>
          </div>
          
          <div className="space-y-8 bg-background/5 p-12 backdrop-blur-sm border border-background/10">
            {[
              "Sign up on Pasive",
              "Upload your Product",
              "List your product on the marketplace."
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-6 group/item">
                <div className="w-10 h-10 border border-background/20 flex items-center justify-center font-mono font-bold text-sm group-hover/item:border-background transition-colors">
                  0{i+1}
                </div>
                <div className="text-xl font-medium tracking-tight uppercase">{step}</div>
              </div>
            ))}
            <div className="pt-8">
              <Button size="lg" className="w-full h-16 rounded-none text-xl font-black bg-background text-foreground hover:bg-background/90 uppercase truncate">
                List Your Product Now
              </Button>
            </div>
          </div>
        </div>
      </section>
 
      {/* ── FAQ Section ── */}
      <section className="px-6 py-40 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </div>
 
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border bg-background group overflow-hidden transition-all">
                <button 
                  className="w-full px-8 py-6 flex items-center justify-between text-left group-hover:bg-muted/5 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-lg font-bold uppercase tracking-tight">{faq.question}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-8 text-muted-foreground leading-relaxed font-light border-t border-border mt-2 pt-6">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      <Footer />
    </div>
  )
}
