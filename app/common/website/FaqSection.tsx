"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"
import { FAQ_DATA } from "@/lib/faqdata"

export function FaqSection() {
  return (
    <section
      id="faq"
      className="w-full py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--muted))_0%,transparent_50%)] opacity-30"></div>

      <div className="container px-6 md:px-8 lg:px-12 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left content - asymmetric layout */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Support & Help
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Frequently Asked
              <span className="block text-foreground">Questions</span>
            </h2>

            <p className="text-xl text-foreground leading-relaxed max-w-md">
              Everything you need to know about our QR code platform. Can't find what you're looking for?
            </p>

            <button className="group inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300">
              Contact our support team
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right FAQ accordion - takes more space */}
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="space-y-4">
              {FAQ_DATA.map((item, index) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="bg-card rounded-2xl px-6 py-2"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground py-6 hover:no-underline">
                    <span className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold text-foreground mt-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{item.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground pb-6 pl-12 pr-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FaqSection