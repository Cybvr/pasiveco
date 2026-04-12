import Link from "next/link"
import { Button } from "@/components/ui/button"

type LegalSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

interface LegalPageShellProps {
  title: string
  summary: string
  lastUpdated: string
  sections: LegalSection[]
}

export default function LegalPageShell({
  title,
  summary,
  lastUpdated,
  sections,
}: LegalPageShellProps) {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Legal
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
          {summary}
        </p>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3 rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
