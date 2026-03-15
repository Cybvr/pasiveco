
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CookiePolicy() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="prose prose-sm">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. How We Use Cookies</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Essential cookies for site functionality</li>
            <li>Analytics cookies to improve our service</li>
            <li>Preference cookies to remember your settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Managing Cookies</h2>
          <p>You can control cookies through your browser settings.</p>
        </section>

        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
