import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "April 27, 2026"

export default function CookiePolicy() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      summary="This Cookie Policy explains how Pasive uses cookies and similar technologies to keep the site working, remember preferences, and understand how people use the platform."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. Who operates Pasive",
          paragraphs: [
            "Pasive is a product of VisualCoreNineSystems (http://visualhq.space). References to Pasive, we, us, or our in this Cookie Policy mean the Pasive product and the team operating it through VisualCoreNineSystems.",
          ],
        },
        {
          heading: "2. What cookies are",
          paragraphs: [
            "Cookies are small text files placed on your browser or device when you visit a website. Similar technologies such as local storage, pixels, or tags may be used for related purposes.",
          ],
        },
        {
          heading: "3. How Pasive uses cookies",
          paragraphs: [
            "Pasive uses cookies and local storage to support the landing site, creator storefronts, checkout flows, dashboard sessions, settings, analytics, and optional marketing measurement across the platform.",
          ],
          bullets: [
            "Necessary cookies help with login sessions, security, fraud prevention, routing, and core site functionality.",
            "Preference cookies and local storage remember settings such as cookie choices, currency preferences, onboarding state, and product experience preferences.",
            "Performance cookies help us measure reliability, loading behavior, and technical issues so we can improve the site.",
            "Analytics cookies help us understand page views, clicks, traffic sources, conversion activity, and feature usage across marketing pages and product surfaces.",
            "Marketing cookies help us measure campaigns, understand whether ads are working, and improve how we reach people who may be interested in Pasive.",
          ],
        },
        {
          heading: "4. Third-party technologies",
          paragraphs: [
            "Some cookies or similar technologies may be set by trusted third parties that help us provide payments, analytics, infrastructure, communications, or embedded experiences. Their handling of data is governed by their own terms and privacy practices.",
          ],
          bullets: [
            "Google tags may be used for analytics, conversion measurement, and advertising performance after optional cookies are accepted.",
            "Meta Pixel may be used for page view and campaign measurement after optional cookies are accepted.",
            "Creators may add their own Meta, TikTok, or Google tracking integrations to their storefronts. Those integrations may set cookies or similar technologies controlled by the creator or the third-party provider.",
            "Firebase, authentication, payment, and security tools may use necessary cookies or similar storage needed to keep Pasive working.",
          ],
        },
        {
          heading: "5. Your choices",
          bullets: [
            "When the cookie banner is shown, you can accept all optional cookies or reject optional cookies.",
            "You can manage cookies through your browser settings, including blocking or deleting cookies.",
            "If you clear your browser storage or use a different device, Pasive may ask for your cookie choice again.",
            "Disabling some cookies may affect login state, checkout behavior, saved preferences, analytics accuracy, or other parts of the service.",
          ],
        },
        {
          heading: "6. Changes to this policy",
          paragraphs: [
            "We may update this Cookie Policy from time to time to reflect changes in technology, law, or the way Pasive operates. When we do, we will update the last updated date above.",
          ],
        },
        {
          heading: "7. Contact",
          paragraphs: [
            "If you have questions about our use of cookies or similar technologies, contact admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
