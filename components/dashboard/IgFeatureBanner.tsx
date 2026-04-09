'use client'

import { useState } from 'react'
import { Instagram, X, Camera, UserPlus, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const IG_HANDLE = '@visualafrica__'
const IG_URL = 'https://instagram.com/visualafrica__'

const steps = [
  {
    icon: UserPlus,
    title: 'Follow us on Instagram',
    description: `Give us a follow at ${IG_HANDLE} so we know where to tag you when we shout you out.`,
    cta: { label: `Follow ${IG_HANDLE}`, href: IG_URL },
  },
  {
    icon: Camera,
    title: 'Share a reel or post about your work',
    description:
      'Create a short reel, story, or post showing off your product, Pasive store, or creator journey.',
    cta: null,
  },
  {
    icon: Send,
    title: 'Tag us & drop it in your bio',
    description: `Tag ${IG_HANDLE} in your post and mention Pasive in your content so our team can find it easily.`,
    cta: null,
  },
  {
    icon: Sparkles,
    title: "We'll feature you!",
    description:
      "We regularly spotlight creators on our feed and stories. More eyes on your work, more sales for you.",
    cta: null,
  },
]

export default function IgFeatureBanner() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Banner ────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full text-left rounded-2xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col justify-between transition-colors hover:bg-muted/30"
        aria-haspopup="dialog"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80 mb-1.5">
            Creator Spotlight
          </p>
          <p className="text-2xl sm:text-2xl font-bold text-foreground">Get featured</p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Share your work, tag {IG_HANDLE}, and we may spotlight you on Instagram.
          </p>
        </div>

        <div className="mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-primary whitespace-nowrap">

            Learn how
          </span>
        </div>
      </button>

      {/* ── Modal ────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-3xl rounded-2xl bg-background border border-border shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden text-left flex flex-col sm:flex-row max-h-[90vh]">
            {/* Left Side: Image Area */}
            <div className="relative w-full sm:w-[320px] shrink-0 bg-muted/40 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border/50">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 sm:hidden flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="w-full max-w-[200px] sm:max-w-full aspect-square relative rounded-xl overflow-hidden shadow-sm">
                <img
                  src="/images/spotligh.png"
                  alt="Instagram promotion spotlight"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Side: Content Area (Scrollable) */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 hidden sm:flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                      <img src="/images/pages/instagram.svg" alt="Instagram" className="w-4 h-4 object-contain opacity-90" />
                    </span>
                    <h2 className="text-lg font-bold text-foreground leading-tight">
                      Get featured on Instagram
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    4 simple steps — takes less than 5 minutes
                  </p>
                </div>

                {/* Steps */}
                <ol className="p-6 pb-2 flex flex-col m-0">
                  {steps.map((step, i) => {
                    const Icon = step.icon
                    return (
                      <li key={i} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          {i < steps.length - 1 && (
                            <span className="w-[1.5px] flex-1 min-h-[24px] my-1 bg-border/80" aria-hidden />
                          )}
                        </div>
                        <div className="flex gap-3 pb-6 flex-1 min-w-0">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground mt-[-4px]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                            {step.cta && (
                              <a
                                href={step.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <Instagram className="h-3.5 w-3.5" />
                                {step.cta.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>

                {/* Footer CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-t border-border/50 bg-muted/10 mt-auto">
                  <p className="text-xs text-muted-foreground flex-1 min-w-0">
                    We feature creators weekly — the more authentic, the better 🎯
                  </p>
                  <Button asChild size="sm" className="rounded-full font-bold gap-1.5 w-full sm:w-auto shrink-0">
                    <a
                      href={IG_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-4 w-4" />
                      Follow {IG_HANDLE}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
