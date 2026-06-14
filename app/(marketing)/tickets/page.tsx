import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  QrCode,
  Ticket,
  Users,
  Wallet,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Sell Event Tickets Online | Pasive",
  description:
    "Sell tickets for events, masterclasses, workshops, and webinars on Pasive. Get paid instantly, scan tickets at the door, and manage attendees in one place.",
}

const setupSteps = [
  {
    title: "Create your event",
    copy: "Add the date, venue, ticket tiers, and capacity in a couple of minutes.",
  },
  {
    title: "Share the link",
    copy: "Drop your ticket link in your bio, posts, and emails. No third-party tools needed.",
  },
  {
    title: "Scan & get paid",
    copy: "Check guests in with a QR scan and watch payouts land in your account.",
  },
]

const benefits = [
  {
    icon: Ticket,
    title: "Multiple ticket tiers",
    copy: "Sell early-bird, regular, VIP, and group tickets with their own prices and limits.",
  },
  {
    icon: QrCode,
    title: "QR check-in",
    copy: "Every ticket gets a unique QR code your team can scan at the door to stop duplicates.",
  },
  {
    icon: Wallet,
    title: "Instant payouts",
    copy: "Collect payments in your local currency and get settled without long holds.",
  },
  {
    icon: Users,
    title: "Attendee management",
    copy: "See who's coming, export your guest list, and message attendees before the event.",
  },
]

const ticketTiers = [
  { name: "Early Bird", price: "₦5,000", note: "Limited" },
  { name: "Regular", price: "₦8,000", note: "Available" },
  { name: "VIP", price: "₦20,000", note: "Front row + perks" },
]

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative isolate min-h-[82vh] overflow-hidden px-5 py-20 sm:px-8 lg:px-12">
        <img
          src="/images/redesign/hero.png"
          alt="Live event audience"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/80" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-background" />

        <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-foreground/20 bg-background/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Event tickets on Pasive
            </div>
            <h1 className="max-w-5xl text-4xl font-black leading-[1.05] tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Sell out your next event.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/75 sm:text-lg">
              Sell tickets for events, masterclasses, workshops, and webinars. Get paid up front, scan guests in at the door, and keep your whole audience in one place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="rounded-none px-7 font-bold uppercase tracking-widest" asChild>
                <Link href="/auth/register">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none px-7 font-bold uppercase tracking-widest" asChild>
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-md border border-foreground/15 bg-background/90 p-4 shadow-2xl backdrop-blur">
            <div className="border border-foreground/10 bg-[#f7f3ed] p-5 text-[#171411]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6258]">Creator Masterclass</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-black">
                    <CalendarDays className="h-5 w-5" /> Sat, Jul 12
                  </p>
                </div>
                <Ticket className="h-7 w-7 text-emerald-700" />
              </div>
              <div className="mt-6 grid gap-2">
                {ticketTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between rounded-sm bg-white px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-sm font-bold">{tier.name}</p>
                      <p className="text-xs text-[#6f6258]">{tier.note}</p>
                    </div>
                    <p className="text-base font-black">{tier.price}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-[#6f6258]">One link. Every tier. Paid instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-foreground/10 bg-[#101010] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {setupSteps.map((step, index) => (
            <div key={step.title} className="border-l border-white/20 pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Step {index + 1}</p>
              <h2 className="mt-3 text-xl font-black">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Built for live events</p>
            <h2 className="mt-4 text-2xl font-black tracking-normal sm:text-3xl">
              Everything you need to run the door, all from your phone.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              From a small workshop to a sold-out show, Pasive handles ticketing, payments, and check-in so you can focus on the experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="border border-border bg-card p-6">
                <benefit.icon className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-5 text-lg font-bold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ed] px-5 py-20 text-[#171411] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#806447]">No extra apps</p>
            <h2 className="mt-4 text-2xl font-black tracking-normal sm:text-3xl">
              Your audience already follows you. Sell to them where they are.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5f564d]">
              Skip the clunky ticketing platforms and the fees that come with them. Your event link lives right next to your products, bookings, and profile.
            </p>
          </div>

          <div className="grid gap-4 border border-[#171411]/15 bg-white p-8 shadow-xl sm:grid-cols-3">
            {[
              { icon: Zap, label: "Setup", value: "Minutes" },
              { icon: Wallet, label: "Payouts", value: "Local currency" },
              { icon: QrCode, label: "Check-in", value: "QR scan" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-7 w-7 text-emerald-700" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#806447]">{stat.label}</p>
                <p className="mt-1 text-lg font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-y border-foreground/15 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black tracking-normal sm:text-3xl">Ready to put your event on sale?</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Create your first event for free and start selling tickets to your audience today.
            </p>
          </div>
          <Button size="lg" className="w-full rounded-none px-8 font-bold uppercase tracking-widest sm:w-auto" asChild>
            <Link href="/auth/register">
              Create an event
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
