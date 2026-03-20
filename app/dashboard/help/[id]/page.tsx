import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getHelpDocById, getHelpDocs, getRelatedHelpDocs } from '@/lib/help-docs'

export function generateStaticParams() {
  return getHelpDocs().map((doc) => ({ id: doc.id }))
}

export default async function HelpDocDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = getHelpDocById(id)

  if (!doc) {
    notFound()
  }

  const relatedDocs = getRelatedHelpDocs(doc.id)

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4 rounded-2xl border bg-card p-4">
          <div>
            <p className="text-sm font-semibold">On this page</p>
            <p className="mt-1 text-xs text-muted-foreground">Jump to a section in this article.</p>
          </div>
          <nav className="space-y-1.5">
            {doc.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <article className="min-w-0 space-y-6">
        <div className="space-y-4 rounded-3xl border bg-card p-6 md:p-8">
          <Button asChild variant="ghost" className="-ml-3 w-fit rounded-full px-3">
            <Link href="/dashboard/help">
              <ArrowLeft className="h-4 w-4" />
              Back to help docs
            </Link>
          </Button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{doc.category}</Badge>
              <span className="text-sm text-muted-foreground">{doc.readTime}</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{doc.title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{doc.summary}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border bg-card p-6 md:p-8">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4 border-b border-border/60 pb-6 last:border-b-0 last:pb-0">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-muted-foreground md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.bullets?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}

              {section.table ? (
                <div className="overflow-hidden rounded-2xl border">
                  <table className="min-w-full divide-y divide-border text-left text-sm md:text-base">
                    <thead className="bg-muted/50">
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header} className="px-4 py-3 font-medium text-foreground">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {section.table.rows.map((row) => (
                        <tr key={row.join('-')}>
                          {row.map((cell) => (
                            <td key={cell} className="px-4 py-3 align-top text-muted-foreground">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section.note ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-7 text-foreground md:text-base">
                  {section.note}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      <aside className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookText className="h-4 w-4" />
              Related docs
            </div>
            <CardTitle className="text-xl">Keep reading</CardTitle>
            <CardDescription>More docs that support setup, monetization, and analytics workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedDocs.map((relatedDoc) => (
              <Link
                key={relatedDoc.id}
                href={`/dashboard/help/${relatedDoc.id}`}
                className="flex items-start justify-between gap-3 rounded-2xl border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-6">{relatedDoc.title}</p>
                  <p className="text-sm text-muted-foreground">{relatedDoc.readTime}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
