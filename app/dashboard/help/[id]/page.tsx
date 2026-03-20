import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookText } from 'lucide-react'
import { getHelpDocById, getHelpDocs, getRelatedHelpDocs } from '@/lib/help-docs'

export function generateStaticParams() {
  return getHelpDocs().map((doc) => ({ id: doc.id }))
}

export default async function HelpDocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = getHelpDocById(id)

  if (!doc) notFound()

  const relatedDocs = getRelatedHelpDocs(doc.id)

  return (
    <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[180px_minmax(0,1fr)_220px]">

      {/* Left nav */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">On this page</p>
          <nav className="space-y-1">
            {doc.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <article className="min-w-0 space-y-10 py-1">

        {/* Header */}
        <div className="space-y-5 border-b pb-8">
          <Link
            href="/dashboard/help"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Help docs
          </Link>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{doc.category}</span>
              <span className="text-[11px] text-muted-foreground/60">{doc.readTime}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{doc.title}</h1>
            <p className="max-w-2xl text-muted-foreground leading-relaxed">{doc.summary}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground md:text-base">
                  {paragraph}
                </p>
              ))}

              {section.bullets?.length ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}

              {section.table ? (
                <div className="overflow-hidden rounded-lg border">
                  <table className="min-w-full divide-y divide-border text-left text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        {section.table.headers.map((header) => (
                          <th key={header} className="px-4 py-2.5 font-medium text-foreground">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {section.table.rows.map((row) => (
                        <tr key={row.join('-')}>
                          {row.map((cell) => (
                            <td key={cell} className="px-4 py-2.5 align-top text-muted-foreground">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section.note ? (
                <div className="border-l-2 border-primary/40 pl-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.note}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {/* Right rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <BookText className="h-3.5 w-3.5" />
            Related
          </div>
          <div className="space-y-px">
            {relatedDocs.map((relatedDoc) => (
              <Link
                key={relatedDoc.id}
                href={`/dashboard/help/${relatedDoc.id}`}
                className="group flex items-start justify-between gap-2 py-3 text-sm transition-colors hover:text-primary"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium leading-snug">{relatedDoc.title}</p>
                  <p className="text-xs text-muted-foreground">{relatedDoc.readTime}</p>
                </div>
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </aside>

    </div>
  )
}