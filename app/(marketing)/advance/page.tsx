
'use client'
import React from 'react'
import Link from 'next/link'
import { CheckCircle2, DollarSign, Rocket, Clock, ShieldCheck, Mail, Info, TrendingUp, Wallet, ArrowRight, Zap, Target, Plus, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function AdvancePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-foreground selection:text-background font-sans overflow-x-hidden [&_h1]:uppercase [&_h2]:uppercase [&_h3]:uppercase [&_h4]:uppercase [&_h5]:uppercase [&_h6]:uppercase">

      {/* ── Brutalist Hero ── */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 pt-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl w-full space-y-12">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 border border-foreground/20 text-[10px] uppercase tracking-[0.3em] font-mono opacity-60">
              Funding v1.0 // Advance Program
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.85] tracking-tighter text-foreground text-left">
              <span className="block italic font-light opacity-40">Fuel for</span>
              <span className="block -mt-1 sm:-mt-4">Your Empire</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 pt-12">
            <div className="max-w-xl space-y-6">
              <p className="text-xl md:text-2xl font-medium leading-tight border-l-4 border-primary pl-6 py-2">
                Creator Payout Advances allow eligible Pasive creators to access up to <span className="text-primary font-bold">₦200,000</span> instantly. Repay automatically as you grow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-none px-10 h-14 bg-foreground text-background hover:bg-foreground/90 transition-all font-bold text-lg group" asChild>
                  <a href="mailto:payoutadvance@Pasive.co">
                    Apply Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="rounded-none px-10 h-14 font-bold text-lg hover:bg-primary/5 border-foreground/20 transition-all">
                  Documentation
                </Button>
              </div>
            </div>

            <div className="hidden lg:block text-right space-y-2">
              <p className="text-[10px] uppercase tracking-[0.4em] font-mono opacity-40">Eligibility status: Active</p>
              <p className="text-[10px] uppercase tracking-[0.4em] font-mono opacity-40">Payout Window: Instant</p>
              <p className="text-[10px] uppercase tracking-[0.4em] font-mono opacity-40">Region: Nigeria (NG)</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 flex gap-4 opacity-20">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce delay-100" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce delay-200" />
        </div>
      </section>

      {/* ── High Contrast: What it is ── */}
      <section className="px-6 py-32 bg-zinc-950 text-zinc-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none italic font-light">
                The Capital <br /> <span className="opacity-40 italic not-italic">You deserve</span>
              </h2>
              <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
                Stop waiting for 30-day payout cycles. A Creator Payout Advance is a short-term funding option that gives you the speed to move at the pace of your creativity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { icon: Rocket, title: "Product Launch", desc: "Scale production & course creation" },
                { icon: Target, title: "Ad Spend", desc: "Amplify your reach instantly" },
                { icon: Zap, title: "Speed", desc: "Unlock funds in under 24hrs" },
                { icon: ShieldCheck, title: "Safety", desc: "Automated repayment structure" }
              ].map((item, i) => (
                <div key={i} className="group space-y-3">
                  <div className="w-10 h-10 flex items-center justify-center border border-zinc-800 bg-zinc-900 group-hover:border-primary transition-colors">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold">{item.title}</h4>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative border border-zinc-800 p-10 md:p-16 bg-zinc-900/50 backdrop-blur-xl">
              <div className="text-xs font-mono uppercase tracking-[0.5em] text-zinc-500 mb-8 flex items-center gap-4">
                <span className="w-8 h-px bg-zinc-800" /> Auto-Repayment Sync
              </div>
              <h3 className="text-3xl md:text-5xl font-bold mb-8 leading-none tracking-tight">Zero Manual <br /> effort Required.</h3>
              <p className="text-zinc-400 mb-12">Repayment happens automatically from your future Pasive sales. As you make money, your advance clears itself.</p>
              <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
                Live Status: Connected <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Qualifications ── */}
      <section className="px-6 py-40 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col lg:flex-row items-baseline justify-between gap-8">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none italic font-light lowercase">
              Qualification <span className="not-italic opacity-20 block sm:inline">Checklist</span>
            </h2>
            <div className="max-w-xs text-xs uppercase tracking-widest text-muted-foreground font-mono leading-loose">
              Verified records only. Approval subject to internal risk modeling and sales density scores.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {[
              { id: "01", title: "Active Selling", desc: "Consistent sales history on the platform for at least 3 months." },
              { id: "02", title: "Revenue floor", desc: "Meet a minimum monthly revenue threshold for your category." },
              { id: "03", title: "Identity (KYC)", desc: "Full verification of account holder and banking details." },
              { id: "04", title: "Reputation", desc: "Maintain a dispute rate below 0.5% and low chargeback volume." },
              { id: "05", title: "Volume", desc: "Recent revenue performance must show growth or stability." },
              { id: "06", title: "Compliance", desc: "Full adherence to Pasive Creator Terms & Conditions." }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-background hover:bg-muted/30 transition-colors space-y-6">
                <span className="block text-xs font-mono tracking-[0.5em] text-primary">{step.id}</span>
                <h4 className="text-2xl font-bold tracking-tight">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Limit: N200,000 ── */}
      <section className="px-6 py-60 bg-foreground text-background text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none text-[20rem] font-black tracking-tighter select-none whitespace-nowrap overflow-hidden leading-none">
          LIMIT LIMIT LIMIT LIMIT LIMIT LIMIT LIMIT
        </div>
        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          <h2 className="text-7xl md:text-[12rem] font-black tracking-tighter leading-none lowercase">
            <span className="block opacity-20">Up to</span> ₦200,000
          </h2>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto opacity-70 italic">
            Whether you're scaling course production or running your first major ad campaign, we've got the backing you need to win.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8 hover:[&_div]:scale-110 transition-all">
            {["Sales Density", "Growth Velocity", "Verified Settlements"].map((t, i) => (
              <div key={i} className="text-xs uppercase tracking-[0.5em] font-bold border border-background/20 px-6 py-3 transition-transform">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scenarios: Launch vs Access ── */}
      <section className="px-6 py-40 border-b border-border">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="inline-block px-3 py-1 bg-primary text-[10px] uppercase font-bold tracking-widest text-primary-foreground">
              Scenario 01
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none italic font-light lowercase">
              Launch <br /> <span className="not-italic opacity-20">Capital</span>
            </h2>
            <div className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed border-l-2 border-border pl-8">
                If you're preparing to launch a new product, an advance helps cover expenses before the first sale hits.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 font-mono text-[10px] uppercase tracking-widest opacity-60">
                <li className="flex items-center gap-3"><Plus className="w-3 h-3 text-primary" /> Video Editing</li>
                <li className="flex items-center gap-3"><Plus className="w-3 h-3 text-primary" /> Ad Placement</li>
                <li className="flex items-center gap-3"><Plus className="w-3 h-3 text-primary" /> Visual Design</li>
                <li className="flex items-center gap-3"><Plus className="w-3 h-3 text-primary" /> Guest Features</li>
              </ul>
            </div>
          </div>

          <div className="space-y-12">
            <div className="inline-block px-3 py-1 border border-foreground/20 text-[10px] uppercase font-bold tracking-widest">
              Scenario 02
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none italic font-light lowercase">
              Early <br /> <span className="not-italic opacity-20">Access</span>
            </h2>
            <div className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed border-l-2 border-border pl-8">
                Already made sales but waiting for payout cycles? Request an advance based on verified pending settlements.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 font-mono text-[10px] uppercase tracking-widest opacity-60">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3" /> Settlement Bridge</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3" /> Quick Reinvestment</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3" /> Expense Buffer</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3" /> High Velocity</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Pasive ── */}
      <section className="px-6 py-40 border-b border-border bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-[0.5em] font-mono opacity-40">The Ecosystem</div>
                <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none uppercase">
                  More than <br /><span className="italic font-light opacity-30">Just funding</span>
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Pasive is the infrastructure for creative independence. We provide creators with the tools to build their own digital headquarters—free from the noise of social algorithms.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Digital Spaces</h4>
                  <p className="text-sm text-muted-foreground">Community-first hubs for your most loyal supporters.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Direct Commerce</h4>
                  <p className="text-sm text-muted-foreground">Sell templates, courses, and assets with one-click checkouts.</p>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="rounded-none border-foreground px-8 hover:bg-foreground hover:text-background transition-all group" asChild>
                  <Link href="/">
                    Visit Home <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  <img src="/images/redesign/hero.png" alt="Creator Hub" className="w-full h-full object-cover grayscale" />
                </div>
                <div className="aspect-[3/4] bg-muted mt-12 overflow-hidden border border-border">
                  <img src="/images/redesign/fitness.png" alt="Creator Activity" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 blur-[120px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Apply ── */}
      <section className="px-6 py-40 text-center space-y-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-9xl font-extrabold tracking-tighter leading-none uppercase">
            Ready to <br /> <span className="opacity-20 italic font-medium lowercase">Scale Up?</span>
          </h2>
          <div className="rounded-none border border-foreground p-12 md:p-20 bg-background group hover:bg-foreground hover:text-background transition-all duration-700">
            <h3 className="text-2xl font-bold mb-8">payoutadvance@Pasive.co</h3>
            <p className="text-xl opacity-60 mb-12 max-w-md mx-auto">Include your account email, store link, and requested amount.</p>
            <Button size="lg" className="rounded-none h-16 px-12 text-xl font-bold bg-primary text-primary-foreground group-hover:bg-background group-hover:text-foreground border-none transition-all" asChild>
              <a href="mailto:payoutadvance@Pasive.co">Send Application <ArrowRight className="ml-3 w-6 h-6" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer Metadata ── */}
      <section className="px-6 py-12 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.4em] font-mono opacity-40">
          <div className="flex gap-8">
            <span>© 2026 Pasive Funding</span>
            <span>Nigerian Creators Only</span>
          </div>
          <div className="flex gap-8">
            <span>Verification required</span>
            <span>Limits vary by creator</span>
          </div>
        </div>
      </section>
    </div>
  )
}
