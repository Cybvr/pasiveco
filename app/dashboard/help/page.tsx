import Link from 'next/link'
import { ArrowRight, BookOpenText, LifeBuoy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getHelpDocs } from '@/lib/help-docs'

export default function HelpDocsPage() {
  const docs = getHelpDocs()
  const featuredDoc = docs.find((doc) => doc.id === 'paystack-integration-overview') ?? docs[0]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="w-fit">Help Docs</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Help center for creators using Pasive</h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Browse setup guides, monetization docs, analytics tips, and payment architecture notes. Start with the essentials or jump directly into the Paystack integration overview.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-sm border-dashed bg-background/70">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LifeBuoy className="h-4 w-4" />
                Featured doc
              </div>
              <CardTitle className="text-xl">{featuredDoc.title}</CardTitle>
              <CardDescription>{featuredDoc.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full justify-between">
                <Link href={`/dashboard/help/${featuredDoc.id}`}>
                  Open article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">All help docs</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc) => (
            <Card key={doc.id} className="h-full transition-colors hover:bg-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">{doc.category}</Badge>
                  <span className="text-xs text-muted-foreground">{doc.readTime}</span>
                </div>
                <CardTitle className="text-xl leading-7">{doc.title}</CardTitle>
                <CardDescription className="leading-6">{doc.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full justify-between rounded-xl border">
                  <Link href={`/dashboard/help/${doc.id}`}>
                    Read doc
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
