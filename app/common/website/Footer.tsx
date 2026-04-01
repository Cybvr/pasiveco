import { Instagram, Twitter, Youtube, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { featuresService, Feature } from "@/services/featuresService"
import { solutionsService, Solution } from "@/services/solutionsService"

const Footer = () => {
  const [email, setEmail] = useState("")
  const [features, setFeatures] = useState<Feature[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuresData, solutionsData] = await Promise.all([
          featuresService.getAllFeatures(),
          solutionsService.getAllSolutions(),
        ])
        setFeatures(featuresData.slice(0, 6))
        setSolutions(solutionsData.slice(0, 6))
      } catch (error) {
        console.error("Error fetching footer navigation data:", error)
      }
    }

    void fetchData()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setEmail("")
  }

  return (
    <footer className="bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="space-y-6 lg:w-2/5">
            <div className="flex items-center space-x-2">
              <img src="/images/logo.svg" alt="Pasive Logo" className="h-8 w-8" />
              <span className="text-2xl font-chunko ml-2.5 translate-y-[1px]">PASIVE</span>
            </div>

            <p className="text-lg leading-relaxed text-foreground/80">
              The best way to sell digital products online.
            </p>

            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-foreground/20 bg-foreground/5 py-2.5 pl-10 pr-4 placeholder:text-foreground/60 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-lg bg-foreground px-6 py-2.5 font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Get Started
                </button>
              </form>

              <p className="text-sm text-foreground/60">Join thousands selling fast</p>
            </div>

            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
              <Twitter className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
              <Youtube className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12 lg:w-3/5">
            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Features</h4>
              <ul className="space-y-2 text-foreground/80">
                {features.map((feature) => (
                  <li key={feature.id}>
                    <a href={`/features/${feature.slug}`} className="transition-colors hover:text-foreground">
                      {feature.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Solutions</h4>
              <ul className="space-y-2 text-foreground/80">
                {solutions.map((solution) => (
                  <li key={solution.id}>
                    <a href={`/solutions/${solution.slug}`} className="transition-colors hover:text-foreground">
                      {solution.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Pricing</h4>
              <ul className="space-y-2 text-foreground/80">
                <li><a href="/pricing" className="transition-colors hover:text-foreground">Pricing</a></li>
              </ul>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Resources</h4>
              <ul className="space-y-2 text-foreground/80">
                <li><a href="/blog" className="transition-colors hover:text-foreground">Blog</a></li>
                <li><a href="/about" className="transition-colors hover:text-foreground">About</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-foreground/20 pt-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-6">
              <a href="/legal/terms" className="text-sm text-foreground/60 transition-colors hover:text-foreground">
                Terms of Service
              </a>
              <a href="/legal/privacy" className="text-sm text-foreground/60 transition-colors hover:text-foreground">
                Privacy Policy
              </a>
              <a href="/legal/cookies" className="text-sm text-foreground/60 transition-colors hover:text-foreground">
                Cookie Notice
              </a>
            </div>
            <p className="text-sm text-foreground/60">© 2025 Pasive. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
