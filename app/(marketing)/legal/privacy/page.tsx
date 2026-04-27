import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "April 27, 2026"

export default function PrivacyPolicy() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      summary="This Privacy Policy explains how Pasive collects, uses, stores, and shares information when creators, customers, affiliates, and visitors use the platform."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. Who operates Pasive",
          paragraphs: [
            "Pasive is a product of VisualCoreNineSystems (http://visualhq.space). References to Pasive, we, us, or our in this Privacy Policy mean the Pasive product and the team operating it through VisualCoreNineSystems.",
          ],
        },
        {
          heading: "2. Information we collect",
          paragraphs: [
            "Pasive is built to help creators publish storefronts, sell products, grow their audience, manage spaces, and receive payouts. To run those features, we collect information you choose to provide and information created through use of the platform.",
          ],
          bullets: [
            "Account and profile information such as your name, email address, username, bio, profile image, and login details.",
            "Contact information such as phone numbers collected through account setup, support handoff, WhatsApp conversations, job applications, or payment and payout workflows.",
            "Storefront and product information such as listings, pricing, product files, thumbnails, membership settings, space details, links, and customization choices.",
            "Transaction and payout information such as buyer name, buyer email, payment references, order details, banking or transfer details, and payout history.",
            "Audience and communication data such as customer lists, email preferences, campaign activity, message history, and space participation.",
            "Usage, device, and analytics information such as pages visited, clicks, traffic sources, browser data, IP address, approximate location, cookie preferences, and feature interactions.",
            "Support information such as support chat messages, WhatsApp messages, emails, questions, feedback, attachments, and troubleshooting details you send to our team.",
            "AI interaction data, including prompts, questions, chat history, page context, and generated responses when you use AI support or business assistant features.",
          ],
        },
        {
          heading: "3. How we use information and lawful bases",
          paragraphs: [
            "We process personal data only where we have a lawful basis. Depending on the feature, we rely on performance of a contract, legitimate interests, consent, and legal obligations.",
          ],
          bullets: [
            "Contract: to create accounts, operate storefronts, provide dashboards, process purchases, deliver products, run memberships, manage messages, and support payouts.",
            "Legitimate interests: to secure the platform, prevent fraud, troubleshoot issues, improve features, provide customer support, and understand product performance.",
            "Consent: to use optional analytics or marketing cookies, send certain marketing communications, or process optional integrations where consent is required.",
            "Legal obligations: to keep records required for tax, accounting, fraud prevention, payment compliance, dispute handling, and lawful requests.",
          ],
        },
        {
          heading: "4. AI, support, WhatsApp, and email processing",
          paragraphs: [
            "Pasive uses AI and support tools to answer questions, help users understand the product, and assist our team. Support chat content may be processed by AI providers such as OpenAI to generate responses. If a user asks for a human agent, the conversation may be routed to our support inbox and connected to WhatsApp business-line tools so our team can reply.",
          ],
          bullets: [
            "WhatsApp support and onboarding may process your phone number, WhatsApp profile name, message contents, media IDs, files you send, webhook metadata, and replies from our team.",
            "Email tools may process names, email addresses, templates, campaign activity, delivery events, and unsubscribe or preference data.",
            "AI tools may process the message you send, recent conversation context, and relevant Pasive help documentation. We do not use AI support chats to make solely automated decisions with legal or similarly significant effects.",
            "Human team members may review support, WhatsApp, email, payment, fraud, and account records when needed to resolve issues or operate the service.",
          ],
        },
        {
          heading: "5. When we share information",
          paragraphs: [
            "We do not sell personal information as a standalone product. We may share information only when it is necessary to run the service, complete a transaction, or comply with legal obligations.",
          ],
          bullets: [
            "With infrastructure and database providers such as Firebase/Google Cloud for authentication, storage, hosting, logs, and Firestore records.",
            "With AI providers such as OpenAI for support and assistant features.",
            "With messaging and social providers such as WhatsApp/Meta for WhatsApp onboarding, jobs, and support conversations.",
            "With payment and payout providers such as Stripe, Paystack, Flutterwave, or other transfer providers used to process transactions and payouts.",
            "With analytics and advertising providers such as Google and Meta when optional analytics or marketing cookies are accepted.",
            "With email, support, storage, security, and operational providers that help us run Pasive.",
            "With creators when a customer buys a product, joins a membership, or interacts with a creator experience that requires fulfillment or support.",
            "With customers or the public when creators choose to publish profile information, storefront content, reviews, space details, or other public-facing materials.",
            "With professional advisers, regulators, law enforcement, or courts when disclosure is required to protect rights, safety, or legal compliance.",
            "As part of a merger, acquisition, financing, restructuring, or sale of all or part of the business, subject to appropriate safeguards.",
          ],
        },
        {
          heading: "6. International transfers",
          paragraphs: [
            "Some providers we use may process or store data outside your country, including outside the UK, EEA, or Nigeria. Where required, we rely on appropriate safeguards such as contractual commitments, standard contractual clauses, data processing agreements, or other lawful transfer mechanisms.",
          ],
        },
        {
          heading: "7. Data retention",
          paragraphs: [
            "We keep information for as long as needed to provide the service, maintain business records, resolve disputes, enforce agreements, and comply with legal, tax, accounting, payment, and security obligations.",
          ],
          bullets: [
            "Account and creator profile records are kept while the account is active and for a reasonable period after closure where needed for disputes, security, or legal obligations.",
            "Transaction, payout, tax, fraud-prevention, and accounting records may be kept for the period required by law or payment providers.",
            "Support, WhatsApp, email, and AI chat records are kept while needed to provide support, preserve account history, prevent abuse, and improve service reliability.",
            "Cookie consent records are generally kept for up to 180 days unless you clear them earlier.",
          ],
        },
        {
          heading: "8. Your choices and rights",
          paragraphs: [
            "Depending on your location, including if GDPR or UK GDPR applies, you may have rights over your personal data.",
          ],
          bullets: [
            "You can update profile, storefront, product, and payment-related information from your account settings where those controls are available.",
            "You can manage cookie preferences and certain communication settings through your browser or in-product controls.",
            "You may request access to, correction of, deletion of, restriction of, or portability of certain personal information by contacting admin@pasive.co.",
            "You may object to processing based on legitimate interests and may object to direct marketing at any time.",
            "Where processing is based on consent, you may withdraw consent at any time without affecting processing that happened before withdrawal.",
            "You may lodge a complaint with your local data protection authority if you believe your rights have been violated.",
            "If you are a customer of a creator on Pasive, some purchase or fulfillment records may still be retained by the creator or payment providers for legal and operational reasons.",
          ],
        },
        {
          heading: "9. Automated decision-making",
          paragraphs: [
            "Pasive does not use AI support chat or help-doc responses to make solely automated decisions that produce legal or similarly significant effects. We may use automated checks to detect fraud, abuse, suspicious transactions, or security risks, but important account, payout, or enforcement decisions may be reviewed by our team where appropriate.",
          ],
        },
        {
          heading: "10. Security",
          paragraphs: [
            "We use reasonable administrative, technical, and organizational measures to protect personal information. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          heading: "11. Children's privacy",
          paragraphs: [
            "Pasive is not intended for children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, contact admin@pasive.co so we can review and address the issue.",
          ],
        },
        {
          heading: "12. Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time to reflect product changes, legal requirements, or operational updates. When we do, we will revise the last updated date on this page.",
          ],
        },
        {
          heading: "13. Contact",
          paragraphs: [
            "Questions about this Privacy Policy, privacy rights, or data requests can be sent to admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
