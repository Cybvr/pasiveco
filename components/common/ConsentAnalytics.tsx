"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

const CONSENT_KEY = "pasive_cookie_consent"

function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    return stored ? JSON.parse(stored)?.analytics === true : false
  } catch {
    return false
  }
}

export default function ConsentAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasAnalyticsConsent())

    const onConsentChange = () => setEnabled(hasAnalyticsConsent())
    window.addEventListener("pasive-cookie-consent", onConsentChange)
    return () => window.removeEventListener("pasive-cookie-consent", onConsentChange)
  }, [])

  if (!enabled) return null

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-16978252898" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-16978252898');
        `}
      </Script>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1138878812634716');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  )
}
