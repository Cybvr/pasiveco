'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock, Lock, Sparkles, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/context/CurrencyContext'
import {
  emailPlans,
  getEmailPlanPrice,
  getEmailPlanPriceInNgn,
  type EmailBillingPeriod,
} from '@/lib/email-plans'
import { formatCurrency } from '@/utils/currency'

type SelectedEmailOption =
  | { planId: 'free'; billingPeriod: 'monthly' }
  | { planId: 'reach'; billingPeriod: EmailBillingPeriod }

export default function EmailSalesView() {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const router = useRouter()
  const pricingRef = useRef<HTMLElement | null>(null)
  const [selectedOption, setSelectedOption] = useState<SelectedEmailOption>({
    planId: 'free',
    billingPeriod: 'monthly',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthlyPrice = getEmailPlanPrice('reach', 'monthly', currency)
  const annualPrice = getEmailPlanPrice('reach', 'annual', currency)
  const monthlyPriceNgn = getEmailPlanPriceInNgn('reach', 'monthly')
  const annualPriceNgn = getEmailPlanPriceInNgn('reach', 'annual')
  const annualMonthlyEquivalent = Math.round(annualPrice / 12)

  const scrollToPlans = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSelectPlan = async () => {
    if (!user?.uid) {
      toast.error('Session loading... please try again in a moment')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/create-email-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedOption.planId,
          billingPeriod: selectedOption.billingPeriod,
          userId: user.uid,
          email: user.email,
          name: user.displayName || 'User',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create email checkout session')
      if (data.redirect) {
        window.location.href = data.redirect
        return
      }
      if (data.link) {
        window.location.href = data.link
        return
      }
      router.refresh()
      toast.success('Email plan updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process email plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-2 pb-2 px-1">
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-2 ">
          <div className="space-y-3">
            <Badge variant="secondary" className="px-3 py-1 font-bold uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-none">
              Pasive Email
            </Badge>
            <h1 className="text-2xl font-bold tracking-tighter leading-tight">
              Launch AI email marketing campaigns in minutes
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Email marketing tool for building, customizing, sending, and tracking professional email campaigns to your customers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-col gap-4 pt-2">
            <Button className="w-fit font-bold uppercase tracking-widest text-xs" onClick={scrollToPlans}>
              Explore Plans
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md aspect-[3/2] rounded-2xl border border-primary/10 shadow-2xl overflow-hidden bg-background">
          <img
            src="/images/emails/emailhero.png"
            alt="Email campaign dashboard preview"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card rounded-3xl ">
        {[
          {
            title: 'Automate without work',
            desc: 'Welcome new subscribers, run drip campaigns, send abandoned cart emails and more.',
            image: '/images/emails/automation.png',
            alt: 'Email automation workflow',
            icon: Clock,
          },
          {
            title: 'Weekly campaign ideas',
            desc: 'AI studies your business to suggest ready-to-go campaign ideas every week.',
            image: '/images/emails/campaigns.png',
            alt: 'Email campaign ideas',
            icon: Sparkles,
          },
          {
            title: 'Subject lines written for you',
            desc: 'Proven subject lines matched to your content. Just pick your favorite.',
            image: '/images/emails/subjects.png',
            alt: 'AI subject line suggestions',
            icon: Target,
          },
        ].map((feature, i) => (
          <div key={i} className="space-y-3 p-3">
            <div className="h-40 w-full bg-muted/20 rounded-2xl border border-border/50 overflow-hidden relative">
              <img src={feature.image} alt={feature.alt} className="h-full w-full object-cover opacity-50" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <feature.icon className="h-10 w-10 text-muted-foreground/30" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section ref={pricingRef} className="space-y-5 bg-card rounded-3xl p-6 ">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-bold tracking-tight">Simple and effective AI-powered email marketing</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'free', billingPeriod: 'monthly' })}
              className={`w-full text-left flex items-center justify-between p-4 border rounded-2xl transition-colors ${selectedOption.planId === 'free' ? 'border-primary bg-primary/5' : 'bg-muted/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'free' ? 'border-primary bg-primary' : 'border-border'}`}>
                  {selectedOption.planId === 'free' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Free</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.free.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">₦0/mo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'reach', billingPeriod: 'monthly' })}
              className={`w-full text-left flex items-center justify-between p-4 border rounded-2xl transition-colors ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'bg-muted/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly'
                  ? 'border-primary bg-primary'
                  : 'border-border'
                  }`}>
                  {selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'monthly' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Monthly</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.reach.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(monthlyPrice, currency)}/mo</p>
                {currency !== 'NGN' ? (
                  <p className="text-[11px] text-muted-foreground">Billed as {formatCurrency(monthlyPriceNgn, 'NGN')}</p>
                ) : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption({ planId: 'reach', billingPeriod: 'annual' })}
              className={`w-full text-left flex items-center justify-between p-5 border-2 rounded-2xl relative transition-colors ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/10'
                }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual'
                  ? 'border-primary bg-primary'
                  : 'border-border'
                  }`}>
                  {selectedOption.planId === 'reach' && selectedOption.billingPeriod === 'annual' ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                </div>
                <div>
                  <p className="font-bold">Yearly</p>
                  <p className="text-xs text-muted-foreground">{emailPlans.reach.recipientsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(monthlyPrice, currency)}</p>
                <p className="text-2xl font-bold">{formatCurrency(annualMonthlyEquivalent, currency)}/mo</p>
                {currency !== 'NGN' ? (
                  <p className="text-[11px] text-muted-foreground">Billed as {formatCurrency(annualPriceNgn, 'NGN')}/yr</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Total {formatCurrency(annualPrice, currency)}/yr</p>
                )}
              </div>
            </button>

            <Button
              className="bg-foreground w-full h-14 font-bold uppercase tracking-widest text-xs"
              onClick={handleSelectPlan}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : selectedOption.planId === 'free'
                  ? 'Start Free 0-500 Tier'
                  : `Choose ${emailPlans.reach.name} ${selectedOption.billingPeriod === 'annual' ? 'Yearly' : 'Monthly'}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Card className="rounded-3xl border-border/50 bg-muted/10 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Send Newsletters</p>
                <div className="space-y-2.5">
                  {[
                    'Schedule campaigns — track every open and click per send',
                    'AI email templates — describe your goal to create a professional email, then customize',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                  {[
                    'Optimize opens — AI subject line writer and spam checker',
                    'Weekly campaign ideas — AI suggests what to send',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Automation & AI</p>
                <div className="space-y-2.5">
                  {[
                    'Welcome & sequence emails — greet new subscribers',
                    'Abandoned cart & post-purchase — recover lost sales',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-3xl mx-auto space-y-5 bg-card rounded-3xl p-6 ">
        <h2 className="text-3xl font-bold tracking-tight text-center">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: 'What is email marketing?', a: 'Email marketing is a powerful marketing channel...' },
            { q: 'What is the Pasive Email service?', a: "It's an AI-driven tool integrated into your dashboard..." },
            { q: 'How is Reach different?', a: 'Unlike third-party tools, Reach is built directly into your store...' },
            { q: 'How to send a campaign?', a: 'Simply pick a goal, let the AI generate content, and hit send.' },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b-border/50">
              <AccordionTrigger className="text-left font-bold hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
