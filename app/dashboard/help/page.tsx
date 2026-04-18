import Link from 'next/link'
import { ArrowRight, HelpCircle, Search } from 'lucide-react'
import { getHelpDocs } from '@/lib/help-docs'

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  General: { icon: '○', description: 'Getting started and account basics' },
  Products: { icon: '□', description: 'Managing your digital products' },
  Affiliates: { icon: '◇', description: 'Referrals and partner programs' },
  Payments: { icon: '△', description: 'Payouts, billing, and transfers' },
  Growth: { icon: '◎', description: 'Analytics, traffic, and scaling' },
}

const CATEGORY_ORDER = ['General', 'Products', 'Affiliates', 'Payments', 'Growth']

export default function HelpDocsPage() {
  const docs = getHelpDocs()
  const groupedDocs = CATEGORY_ORDER
    .map((category) => ({
      category,
      meta: CATEGORY_META[category],
      docs: docs.filter((doc) => doc.category === category),
    }))
    .filter((group) => group.docs.length > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-16">
      <section className="text-center space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight">How can we help?</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Guides and docs for creators on Pasive.
        </p>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles…"
            className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </section>

      <section>
        <Link
          href="/dashboard/help/faq"
          className="group flex items-start justify-between gap-6 rounded-2xl border border-border/70 bg-card p-5 transition-opacity hover:opacity-80"
        >
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </div>
            <div>
              <p className="text-base font-medium">Quick answers to common questions</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Browse short answers pulled from our help docs, including product, booking, payout, and affiliate questions.
              </p>
            </div>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

    <section className="space-y-14">
      {groupedDocs.map((group) => (
        <div key={group.category} id={group.category.toLowerCase()}>
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-base text-muted-foreground">{group.meta?.icon}</span>
              <h2 className="text-sm font-semibold">{group.category}</h2>
            </div>
            {group.meta?.description && (
              <p className="text-xs text-muted-foreground">{group.meta.description}</p>
            )}
          </div>
          <div className="space-y-3">
            {group.docs.map((doc) => (
              <Link
                key={doc.id}
                href={'/dashboard/help/' + doc.id}
                className="group flex items-start justify-between gap-6 rounded-xl border border-border bg-card p-5 transition-opacity hover:opacity-70"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium mb-1.5">{doc.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {doc.summary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">{doc.readTime}</p>
                </div>
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
    </div>
  )
}
