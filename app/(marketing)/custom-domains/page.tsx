import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  PlugZap,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Custom Domains for Creator Profiles | Pasive",
  description:
    "Connect a domain you already own to your Pasive profile page and share a branded link with your audience.",
}

const setupSteps = [
  {
    title: "Add your domain",
    copy: "Enter the domain you already own, like yourbrand.com or www.yourbrand.com.",
  },
  {
    title: "Update DNS",
    copy: "Pasive gives you the DNS records to add inside your domain provider.",
  },
  {
    title: "Go live",
    copy: "Once verified, your domain opens your existing Pasive profile page.",
  },
]

const benefits = [
  {
    icon: Globe2,
    title: "A link that feels owned",
    copy: "Share your own domain instead of a platform URL across social bios, packaging, email, and campaigns.",
  },
  {
    icon: LockKeyhole,
    title: "Secure by default",
    copy: "Connected domains are designed to run over HTTPS after verification and setup.",
  },
  {
    icon: PlugZap,
    title: "No website rebuild",
    copy: "Your current Pasive profile, products, links, bookings, and storefront stay in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Clear ownership check",
    copy: "DNS verification helps make sure only the real domain owner can connect it.",
  },
]

const dnsRows = [
  { type: "CNAME", name: "www", value: "connect.pasive.co" },
  { type: "TXT", name: "_pasive", value: "pasive_verify_abc123" },
]

export default function CustomDomainsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative isolate min-h-[82vh] overflow-hidden px-5 py-20 sm:px-8 lg:px-12">
        <img
          src="/images/website/profile.jpg"
          alt="Creator profile preview"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/80" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-background" />

        <div className="mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-end gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-foreground/20 bg-background/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              Custom domains for Pasive profiles
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-normal text-foreground sm:text-7xl lg:text-8xl">
              Put your creator page on your own domain.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-foreground/75 sm:text-xl">
              Connect a domain you already own to your Pasive profile, so your audience visits your brand first and Pasive powers everything behind it.
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6258]">Connected domain</p>
                  <p className="mt-2 text-2xl font-black">www.amaka.co</p>
                </div>
                <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              </div>
              <div className="mt-8 rounded-sm bg-white p-4 shadow-sm">
                <div className="h-28 rounded-sm bg-[url('/images/redesign/fitness.png')] bg-cover bg-center" />
                <div className="mt-4 h-3 w-32 rounded-full bg-[#171411]" />
                <div className="mt-3 h-2 w-full rounded-full bg-[#d8cfc3]" />
                <div className="mt-2 h-2 w-4/5 rounded-full bg-[#d8cfc3]" />
                <div className="mt-5 grid gap-2">
                  <div className="h-9 rounded-sm bg-[#171411]" />
                  <div className="h-9 rounded-sm border border-[#171411]/20" />
                  <div className="h-9 rounded-sm border border-[#171411]/20" />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-[#6f6258]">Same profile. Cleaner link. Stronger brand memory.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-foreground/10 bg-[#101010] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {setupSteps.map((step, index) => (
            <div key={step.title} className="border-l border-white/20 pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Step {index + 1}</p>
              <h2 className="mt-3 text-2xl font-black">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Built for brand trust</p>
            <h2 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">
              Keep Pasive running the business. Let your domain own the front door.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Custom domains are for creators who want the ease of Pasive with a link that feels permanent, professional, and portable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="border border-border bg-card p-6">
                <benefit.icon className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-5 text-xl font-bold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ed] px-5 py-20 text-[#171411] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#806447]">DNS preview</p>
            <h2 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">
              They buy the domain anywhere. Pasive tells them what to connect.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5f564d]">
              No registrar partnership is needed for this version. The creator keeps their domain provider, and Pasive verifies the records before turning the domain on.
            </p>
          </div>

          <div className="overflow-hidden border border-[#171411]/15 bg-white shadow-xl">
            <div className="grid grid-cols-3 border-b border-[#171411]/10 bg-[#171411] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
              <span>Type</span>
              <span>Name</span>
              <span>Value</span>
            </div>
            {dnsRows.map((row) => (
              <div key={row.type} className="grid grid-cols-3 gap-3 border-b border-[#171411]/10 px-4 py-4 text-sm last:border-b-0">
                <span className="font-bold">{row.type}</span>
                <span className="font-mono text-xs">{row.name}</span>
                <span className="min-w-0 break-words font-mono text-xs">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-y border-foreground/15 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black tracking-normal">Launch with the page they already use.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              One branded domain can point to a creator profile with links, products, bookings, spaces, and sales tools already inside Pasive.
            </p>
          </div>
          <Button size="lg" className="w-full rounded-none px-8 font-bold uppercase tracking-widest sm:w-auto" asChild>
            <Link href="/auth/register">
              Create your page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
