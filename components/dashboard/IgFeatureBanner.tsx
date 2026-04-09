'use client'

import { useState } from 'react'
import { Instagram, X } from 'lucide-react'

const IG_HANDLE = '@visualafrica__'
const IG_URL = 'https://instagram.com/visualafrica__'

const steps = [
  { label: 'Follow us', sub: 'So we can find you back' },
  { label: 'Post your best shot', sub: 'Any format — photo, reel, or story' },
  { label: 'Tag ' + IG_HANDLE, sub: "That's how we discover you" },
  { label: 'We reach out', sub: 'Featured creators get a DM from us' },
]

export default function IgFeatureBanner() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-full w-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 text-left transition-colors hover:bg-muted/30 sm:p-6"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">Creator Spotlight</p>
          <p className="mt-1 text-2xl font-bold">Your work deserves an audience</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            We spotlight African creators weekly. Tag us and you could be next.
          </p>
        </div>
        <span className="mt-6 text-xs font-semibold text-primary">See how it works →</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex max-h-[min(32rem,calc(100dvh-2.5rem))] w-full max-w-sm flex-col overflow-hidden rounded-[1.25rem] border border-border/60 bg-background shadow-xl">
            <div className="flex items-center justify-between px-3.5 py-3 sm:px-4">
              <h2 className="text-sm font-semibold">Get featured this week</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3.5 pb-3.5 sm:px-4 sm:pb-4">
              <img
                src="/images/spotligh.png"
                alt="Instagram spotlight"
                className="mb-3 h-20 w-full rounded-xl object-cover"
              />

              <p className="text-xs leading-relaxed text-muted-foreground">
                Every week we hand-pick creators doing standout work across the continent — and put them in front of our community.
              </p>

              <ol className="mt-3 space-y-2.5">
                {steps.map((step, i) => (
                  <li key={step.label} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium leading-snug">{step.label}</p>
                      <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => window.open(IG_URL, '_blank', 'noopener,noreferrer')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2 text-[11px] font-semibold text-primary-foreground"
              >
                <Instagram className="h-3.5 w-3.5" />
                Follow {IG_HANDLE} to get started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}