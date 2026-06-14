import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  FileText,
  Receipt,
  Repeat,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Create & Send Invoices Online | Pasive",
  description:
    "Send professional invoices, get paid online, and track every payment. Pasive lets creators and freelancers bill clients and collect money in one place.",
}

const setupSteps = [
  {
    title: "Build the invoice",
    copy: "Add your client, line items, and amount. Your logo and details fill in automatically.",
  },
  {
    title: "Send the link",
    copy: "Email the invoice or share a payment link your client can open anywhere.",
  },
  {
    title: "Get paid & track",
    copy: "Clients pay online and you see paid, pending, and overdue invoices at a glance.",
  },
]

const benefits = [
  {
    icon: FileText,
    title: "Professional invoices",
    copy: "Branded invoices with your logo, itemized charges, taxes, and due dates that look the part.",
  },
  {
    icon: Wallet,
    title: "Online payments",
    copy: "Clients pay by card or transfer through a secure link and money settles to your account.",
  },
  {
    icon: Repeat,
    title: "Recurring billing",
    copy: "Set invoices to repeat weekly or monthly for retainers and subscription work.",
  },
  {
    icon: Bell,
    title: "Automatic reminders",
    copy: "Pasive nudges clients about due and overdue invoices so you don't have to chase them.",
  },
]

const invoiceRows = [
  { label: "Brand strategy session", amount: "₦120,000" },
  { label: "Logo design — 2 concepts", amount: "₦85,000" },
  { label: "Social templates pack", amount: "₦40,000" },
]

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative isolate min-h-[82vh] overflow-hidden px-5 py-20 sm:px-8 lg:px-12">
        <img
          src="/images/redesign/podcast.png"
          alt="Creator working"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/80" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-background" />

        <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-foreground/20 bg-background/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Invoices on Pasive
            </div>
            <h1 className="max-w-5xl text-4xl font-black leading-[1.05] tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Bill your clients. Get paid faster.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/75 sm:text-lg">
              Send clean, professional invoices and let clients pay you online. Track what's paid, pending, and overdue without spreadsheets or back-and-forth.
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6258]">Invoice #0042</p>
                  <p className="mt-2 text-2xl font-black">₦245,000</p>
                </div>
                <Receipt className="h-7 w-7 text-emerald-700" />
              </div>
              <div className="mt-6 rounded-sm bg-white p-4 shadow-sm">
                {invoiceRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-[#171411]/10 py-2 text-sm last:border-b-0">
                    <span className="text-[#5f564d]">{row.label}</span>
                    <span className="font-bold">{row.amount}</span>
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Paid online
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-[#6f6258]">Sent, paid, and tracked in one place.</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Built for getting paid</p>
            <h2 className="mt-4 text-2xl font-black tracking-normal sm:text-3xl">
              Look professional and get paid on time, every time.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Whether you freelance, consult, or sell services, Pasive turns billing into a single link your client can pay in seconds.
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#806447]">All in one place</p>
            <h2 className="mt-4 text-2xl font-black tracking-normal sm:text-3xl">
              Invoices live next to your products, bookings, and payouts.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#5f564d]">
              No separate accounting tool to juggle. Bill clients, sell products, and collect every payment from the same Pasive account.
            </p>
          </div>

          <div className="grid gap-4 border border-[#171411]/15 bg-white p-8 shadow-xl sm:grid-cols-3">
            {[
              { icon: FileText, label: "Invoices", value: "Branded" },
              { icon: Wallet, label: "Payments", value: "Card & transfer" },
              { icon: Bell, label: "Reminders", value: "Automatic" },
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
            <h2 className="text-2xl font-black tracking-normal sm:text-3xl">Send your first invoice today.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Create an account for free, bill your first client, and get paid online in minutes.
            </p>
          </div>
          <Button size="lg" className="w-full rounded-none px-8 font-bold uppercase tracking-widest sm:w-auto" asChild>
            <Link href="/auth/register">
              Create an invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
