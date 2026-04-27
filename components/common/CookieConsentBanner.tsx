"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const CONSENT_KEY = "pasive_cookie_consent"

type ConsentValue = {
  necessary: true
  analytics: boolean
  marketing: boolean
  savedAt: string
}

function saveConsent(consent: ConsentValue) {
  const value = JSON.stringify(consent)
  window.localStorage.setItem(CONSENT_KEY, value)
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)};max-age=${60 * 60 * 24 * 180};path=/;SameSite=Lax`
  window.dispatchEvent(new Event("pasive-cookie-consent"))
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!window.localStorage.getItem(CONSENT_KEY))
  }, [])

  if (!visible) return null

  const closeWith = (analytics: boolean, marketing: boolean) => {
    saveConsent({
      necessary: true,
      analytics,
      marketing,
      savedAt: new Date().toISOString(),
    })
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] border-t border-border bg-background/95 px-4 py-4 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl space-y-1">
          <p className="text-sm font-semibold text-foreground">Cookies on Pasive</p>
          <p className="text-sm leading-6 text-muted-foreground">
            We use necessary cookies to run the site. With your permission, we also use analytics and marketing cookies to understand traffic and improve Pasive.
            Read our{" "}
            <Link href="/legal/cookies" className="font-medium text-foreground underline underline-offset-4">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => closeWith(false, false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => closeWith(true, true)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
