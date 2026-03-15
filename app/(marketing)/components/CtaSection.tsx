import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-12 md:py-24 lg:py-16 bg-primary rounded-2xl">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left side with heading */}
          <div className="lg:col-span-3 text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground">
              Ready to <span className="italic text-orange-500">connect</span> with your customers?
            </h1>
          </div>

          {/* Right side with paragraph */}
          <div className="lg:col-span-2 text-left self-center">
            <p className="text-lg text-primary-foreground">
              Join thousands of businesses using Pasive to create engaging QR code experiences.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register">Get started for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="mailto:admin@pasive.co">Contact sales</a>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground sm:ml-auto">
            No credit card required. Free plan includes 5 QR codes and basic analytics.
          </p>
        </div>
      </div>
    </section>
  )
}

export default CtaSection