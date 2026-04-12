import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "March 27, 2026"

export default function CookiePolicy() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      summary="This Cookie Policy explains how Pasive uses cookies and similar technologies to keep the site working, remember preferences, and understand how people use the platform."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. What cookies are",
          paragraphs: [
            "Cookies are small text files placed on your browser or device when you visit a website. Similar technologies such as local storage, pixels, or tags may be used for related purposes.",
          ],
        },
        {
          heading: "2. How Pasive uses cookies",
          paragraphs: [
            "Pasive uses cookies to support the landing site, creator storefronts, checkout flows, dashboard sessions, and settings across the platform.",
          ],
          bullets: [
            "Necessary cookies help with login sessions, security, fraud prevention, routing, and core site functionality.",
            "Preference cookies remember settings such as cookie choices and product experience preferences.",
            "Performance cookies help us measure reliability, loading behavior, and technical issues so we can improve the site.",
            "Analytics cookies help us understand page views, clicks, traffic sources, and feature usage across marketing pages and product surfaces.",
          ],
        },
        {
          heading: "3. Third-party technologies",
          paragraphs: [
            "Some cookies or similar technologies may be set by trusted third parties that help us provide payments, analytics, infrastructure, communications, or embedded experiences. Their handling of data is governed by their own terms and privacy practices.",
          ],
        },
        {
          heading: "4. Your choices",
          bullets: [
            "You can manage cookies through your browser settings, including blocking or deleting cookies.",
            "If Pasive presents a cookie preference tool, you can use it to adjust non-essential cookie settings.",
            "Disabling some cookies may affect login state, checkout behavior, saved preferences, analytics accuracy, or other parts of the service.",
          ],
        },
        {
          heading: "5. Changes to this policy",
          paragraphs: [
            "We may update this Cookie Policy from time to time to reflect changes in technology, law, or the way Pasive operates. When we do, we will update the last updated date above.",
          ],
        },
        {
          heading: "6. Contact",
          paragraphs: [
            "If you have questions about our use of cookies or similar technologies, contact admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
