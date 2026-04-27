import LegalPageShell from "../LegalPageShell"

const LAST_UPDATED = "April 26, 2026"

export default function DataDeletionInstructions() {
  return (
    <LegalPageShell
      title="Data Deletion Instructions"
      summary="This page explains how Pasive users can request deletion of personal data connected to their account, purchases, creator profile, or WhatsApp interactions."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          heading: "1. Who operates Pasive",
          paragraphs: [
            "Pasive is a product of VisualCoreNineSystems (http://visualhq.space). References to Pasive, we, us, or our on this page mean the Pasive product and the team operating it through VisualCoreNineSystems.",
          ],
        },
        {
          heading: "2. How to request deletion",
          paragraphs: [
            "To request deletion of your personal data, email admin@pasive.co from the email address connected to your Pasive account or include enough information for us to identify your account.",
          ],
          bullets: [
            "Use the subject line: Data Deletion Request.",
            "Include your name, account email, Pasive username if you have one, and the data you want deleted.",
            "If your request relates to WhatsApp, include the phone number you used to message Pasive.",
          ],
        },
        {
          heading: "3. What we delete",
          paragraphs: [
            "After verifying your request, we will delete or anonymize personal information that Pasive no longer needs to provide the service, meet legal obligations, prevent fraud, resolve disputes, or maintain required business records.",
          ],
        },
        {
          heading: "4. Data we may retain",
          paragraphs: [
            "Some transaction, payout, tax, security, fraud-prevention, support, and legal records may be retained where required by law or necessary for legitimate business purposes. Where possible, retained records are limited to the information needed for those purposes.",
          ],
        },
        {
          heading: "5. Timing",
          paragraphs: [
            "We aim to review deletion requests within 30 days. If we need more information to verify your identity or locate your data, we may contact you before completing the request.",
          ],
        },
        {
          heading: "6. Contact",
          paragraphs: [
            "Questions about data deletion can be sent to admin@pasive.co.",
          ],
        },
      ]}
    />
  )
}
