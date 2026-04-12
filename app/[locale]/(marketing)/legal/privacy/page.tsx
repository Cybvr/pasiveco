import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "March 27, 2026"

export default function PrivacyPolicy() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      summary="This Privacy Policy explains how Pasive collects, uses, stores, and shares information when creators, customers, affiliates, and visitors use the platform."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "Pasive is built to help creators publish storefronts, sell products, grow their audience, manage spaces, and receive payouts. To run those features, we collect information you choose to provide and information created through use of the platform.",
          ],
          bullets: [
            "Account and profile information such as your name, email address, username, bio, profile image, and login details.",
            "Storefront and product information such as listings, pricing, product files, thumbnails, membership settings, space details, links, and customization choices.",
            "Transaction and payout information such as buyer name, buyer email, payment references, order details, banking or transfer details, and payout history.",
            "Audience and communication data such as customer lists, email preferences, campaign activity, message history, and space participation.",
            "Usage, device, and analytics information such as pages visited, clicks, traffic sources, browser data, cookie preferences, and feature interactions.",
            "Support information such as emails, questions, feedback, and troubleshooting details you send to our team.",
          ],
        },
        {
          heading: "2. How we use information",
          bullets: [
            "Provide and operate creator storefronts, checkouts, memberships, spaces, affiliate tools, analytics, and dashboard features.",
            "Process purchases, record transactions, confirm orders, deliver digital products, and support creator payouts.",
            "Personalize the product experience, remember settings, and improve performance across web and mobile sessions.",
            "Communicate with you about account activity, purchases, receipts, platform updates, support issues, and security notices.",
            "Monitor fraud, abuse, suspicious transactions, policy violations, and other activity that could harm Pasive, creators, or customers.",
            "Analyze product usage so we can improve conversion flows, creator tools, growth features, and site reliability.",
          ],
        },
        {
          heading: "3. When we share information",
          paragraphs: [
            "We do not sell personal information as a standalone product. We may share information only when it is necessary to run the service, complete a transaction, or comply with legal obligations.",
          ],
          bullets: [
            "With payment, transfer, infrastructure, analytics, email, storage, and support providers that help us operate Pasive.",
            "With creators when a customer buys a product, joins a membership, or interacts with a creator experience that requires fulfillment or support.",
            "With customers or the public when creators choose to publish profile information, storefront content, reviews, space details, or other public-facing materials.",
            "With professional advisers, regulators, law enforcement, or courts when disclosure is required to protect rights, safety, or legal compliance.",
            "As part of a merger, acquisition, financing, restructuring, or sale of all or part of the business, subject to appropriate safeguards.",
          ],
        },
        {
          heading: "4. Data retention",
          paragraphs: [
            "We keep information for as long as needed to provide the service, maintain business records, resolve disputes, enforce agreements, and comply with legal, tax, accounting, and security obligations. Retention periods may differ depending on the type of information involved.",
          ],
        },
        {
          heading: "5. Your choices and controls",
          bullets: [
            "You can update profile, storefront, product, and payment-related information from your account settings where those controls are available.",
            "You can manage cookie preferences and certain communication settings through your browser or in-product controls.",
            "You may request access to, correction of, or deletion of certain personal information by contacting admin@pasive.co.",
            "If you are a customer of a creator on Pasive, some purchase or fulfillment records may still be retained by the creator or payment providers for legal and operational reasons.",
          ],
        },
        {
          heading: "6. Security",
          paragraphs: [
            "We use reasonable administrative, technical, and organizational measures to protect personal information. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "7. Children's privacy",
          paragraphs: [
            "Pasive is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, contact admin@pasive.co so we can review and address the issue.",
          ],
        },
        {
          heading: "8. Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect product changes, legal requirements, or operational updates. When we do, we will revise the last updated date on this page.",
          ],
        },
        {
          heading: "9. Contact",
          paragraphs: [
            "Questions about this Privacy Policy can be sent to admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
