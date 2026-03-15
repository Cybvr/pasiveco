
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Terms() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-sm">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Pasive, you agree to these terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Acceptable Use</h2>
          <p>Users must not:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any laws</li>
            <li>Infringe on intellectual property rights</li>
            <li>Distribute malicious content</li>
          </ul>
        </section>

        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
