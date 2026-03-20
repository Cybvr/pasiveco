import Link from 'next/link'
import { ArrowRight, BookOpenText } from 'lucide-react'
import { getHelpDocs } from '@/lib/help-docs'

export default function HelpDocsPage() {
  const docs = getHelpDocs()
  const featuredDoc = docs.find((doc) => doc.id === 'paystack-integration-overview') ?? docs[0]

  return (
    <div className="mx-auto max-w-5xl space-y-16 py-4">

      {/* Header */}
      <section className="space-y-6 border-b pb-12">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Help Center</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Help center for creators using Pasive
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          Setup guides, monetization docs, analytics tips, and payment architecture notes.
        </p>

        {/* Featured doc — inline, not a card */}
        <div className="flex items-center gap-4 pt-2">
          <span className="text-xs text-muted-foreground">Featured</span>
          <span className="h-px w-6 bg-border" />
          <Link
            href={`/dashboard/help/${featuredDoc.id}`}
            className="group flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            {featuredDoc.title}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* All docs */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpenText className="h-4 w-4" />
          All docs
        </div>

        <div className="divide-y">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/help/${doc.id}`}
              className="group flex items-start justify-between gap-6 py-5 transition-colors hover:text-primary"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">{doc.readTime}</span>
                </div>
                <p className="font-medium leading-snug">{doc.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{doc.summary}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}