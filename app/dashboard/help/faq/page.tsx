import Link from 'next/link'
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getHelpFaqs } from '@/lib/help-docs'

const CATEGORY_ORDER = ['General', 'Products', 'Affiliates', 'Payments', 'Growth']

export default function HelpFaqPage() {
  const faqs = getHelpFaqs()
  const groupedFaqs = CATEGORY_ORDER
    .map((category) => ({
      category,
      items: faqs.filter((faq) => faq.category === category),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-16">
      <section className="space-y-5 border-b pb-8">
        <Link
          href="/dashboard/help"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Help docs
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently asked questions
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Quick answers for common Pasive questions</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Short, direct answers pulled from our help docs so people can get clarity fast.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        {groupedFaqs.map((group) => (
          <div key={group.category} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{group.category}</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {group.items.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card"
                >
                  <AccordionTrigger className="px-5 py-4 text-left text-sm font-medium leading-6 md:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-5 pb-5 pt-0 text-sm leading-7 text-muted-foreground md:text-base">
                    <p>{faq.answer}</p>
                    {faq.docId ? (
                      <Link
                        href={`/dashboard/help/${faq.docId}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Read the full guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </div>
  )
}
