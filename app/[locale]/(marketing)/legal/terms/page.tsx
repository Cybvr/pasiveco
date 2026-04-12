import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "March 27, 2026"

export default function Terms() {
  return (
    <LegalPageShell
      title="Terms of Service"
      summary="These Terms of Service govern your access to and use of Pasive, including creator storefronts, digital product sales, memberships, spaces, messaging, analytics, affiliate tools, and payout features."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. Acceptance of these terms",
          paragraphs: [
            "By accessing or using Pasive, you agree to these Terms of Service. If you use Pasive on behalf of a business, team, or other entity, you represent that you have authority to bind that entity to these terms.",
          ],
        },
        {
          heading: "2. Eligibility and accounts",
          bullets: [
            "You must provide accurate information when creating or using an account.",
            "You are responsible for maintaining the confidentiality of your login credentials and for activity that occurs under your account.",
            "You must promptly notify us if you suspect unauthorized access to your account.",
            "We may suspend or restrict accounts that are inactive, incomplete, misleading, or used in violation of these terms.",
          ],
        },
        {
          heading: "3. Using Pasive",
          paragraphs: [
            "Pasive gives creators tools to publish profile pages, sell products, run memberships, build spaces, track performance, communicate with customers, and manage payouts from a central dashboard. Your use of these tools must comply with applicable law and these terms.",
          ],
        },
        {
          heading: "4. Creator responsibilities",
          bullets: [
            "Creators are responsible for the accuracy of listings, pricing, descriptions, delivery promises, and space or membership offers they publish.",
            "Creators must have all rights, licenses, consents, and permissions needed to upload, sell, distribute, or promote their content and products.",
            "Creators are responsible for customer support obligations related to their own products, offers, and claims unless Pasive expressly states otherwise.",
            "Creators are responsible for their own taxes, reporting obligations, and compliance with laws that apply to their business, content, and customers.",
          ],
        },
        {
          heading: "5. Payments, payouts, and fees",
          bullets: [
            "Pasive may facilitate checkout, payment collection, transaction records, and payout workflows through internal systems and third-party payment providers.",
            "You authorize Pasive and its providers to process payments, transfers, refunds, and related records needed to operate the service.",
            "Platform fees, processing charges, taxes, currency conversion, holds, reversals, or payout delays may apply depending on the transaction type and payment flow.",
            "We may pause payouts or transactions where we suspect fraud, abuse, chargeback risk, policy violations, or legal non-compliance.",
          ],
        },
        {
          heading: "6. Customer purchases and refunds",
          paragraphs: [
            "Customers are responsible for reviewing a creator's offer before purchase. Unless otherwise required by law or stated in a creator's policy, digital purchases, memberships, and creator services may be non-refundable once access or delivery has been provided.",
          ],
        },
        {
          heading: "7. Acceptable use",
          bullets: [
            "Do not use Pasive to violate any law, regulation, or third-party right.",
            "Do not upload or distribute content that is fraudulent, infringing, deceptive, abusive, hateful, exploitative, or malicious.",
            "Do not interfere with the security, integrity, availability, or performance of Pasive, including through scraping, reverse engineering, spam, or unauthorized automation.",
            "Do not use Pasive to misrepresent your identity, manipulate analytics, or process transactions for prohibited goods or services.",
          ],
        },
        {
          heading: "8. Content and licenses",
          paragraphs: [
            "You retain ownership of the content you submit to Pasive. By submitting content, you grant Pasive a non-exclusive, worldwide, royalty-free license to host, reproduce, modify for formatting, display, distribute, and otherwise use that content as needed to operate, promote, and improve the service.",
            "This license ends when your content is removed from the service, except to the extent we need to retain copies for backups, legal compliance, dispute resolution, or records connected to completed transactions.",
          ],
        },
        {
          heading: "9. Service availability and changes",
          paragraphs: [
            "We may add, remove, or modify features at any time. We do not guarantee that Pasive or any specific feature will always be available, uninterrupted, or error-free.",
          ],
        },
        {
          heading: "10. Suspension and termination",
          paragraphs: [
            "We may suspend, limit, or terminate access to Pasive if we believe you have violated these terms, created risk for users or the platform, or exposed Pasive to legal or financial harm. You may stop using the service at any time.",
          ],
        },
        {
          heading: "11. Disclaimers and limitation of liability",
          paragraphs: [
            "Pasive is provided on an as-is and as-available basis to the fullest extent permitted by law. We disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted availability.",
            "To the fullest extent permitted by law, Pasive will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of revenue, profits, goodwill, data, or business opportunities arising from or related to the use of the service.",
          ],
        },
        {
          heading: "12. Changes to these terms and contact",
          paragraphs: [
            "We may update these terms from time to time. Continued use of Pasive after changes become effective means you accept the revised terms.",
            "Questions about these terms can be sent to admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
