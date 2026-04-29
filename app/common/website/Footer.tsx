"use client"

import { Instagram, Twitter, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { featuresService, Feature } from "@/services/featuresService"
import { solutionsService, Solution } from "@/services/solutionsService"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.52 2 2.05 6.46 2.05 11.96c0 1.76.46 3.49 1.33 5.01L2 22l5.19-1.36a9.94 9.94 0 0 0 4.85 1.24h.01c5.51 0 9.98-4.46 9.98-9.96A9.95 9.95 0 0 0 12.04 2Zm0 18.23h-.01a8.26 8.26 0 0 1-4.21-1.15l-.3-.18-3.08.81.82-3-.2-.31a8.27 8.27 0 0 1-1.27-4.42 8.3 8.3 0 0 1 8.31-8.29 8.3 8.3 0 0 1 8.29 8.3 8.3 8.3 0 0 1-8.35 8.24Zm4.55-6.18c-.25-.12-1.5-.74-1.73-.83-.23-.08-.4-.12-.57.12-.17.25-.65.83-.8 1-.15.17-.3.19-.56.07-.25-.12-1.07-.39-2.04-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.1-.51.11-.11.25-.3.37-.45.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.11s.91 2.46 1.03 2.63c.12.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.43.54.6.19 1.14.16 1.57.1.48-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.15-.48-.27Z" />
    </svg>
  )
}

const Footer = () => {
  const { theme } = useTheme()
  const [features, setFeatures] = useState<Feature[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()

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

  useEffect(() => {
    setMounted(true)
  }, [])

  const footerLogo = mounted && theme === "light"
    ? "/images/pasivelogoblack.png"
    : "/images/pasivelogowhite.png"

  return (
    <footer className="bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="-mx-4 border-b border-foreground/15 px-4 pb-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <img
            src={footerLogo}
            alt="Pasive Logo"
            className="block h-auto w-full"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="pt-10 flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="space-y-6 lg:w-2/5">

            <p className="text-xs leading-relaxed text-foreground/80">
              The best way to sell digital products online.
            </p>

            <div className="flex space-x-4">
              <a href="http://visualafrica__" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
              </a>
              <a href="http://x.com/pasivehq" target="_blank" rel="noreferrer" aria-label="X">
                <Twitter className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
              </a>
              <Youtube className="h-5 w-5 cursor-pointer text-foreground/60 transition-colors hover:text-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12 lg:w-3/5">
            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Features</h4>
              <ul className="space-y-2 text-xs text-foreground/70">
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
              <ul className="space-y-2 text-xs text-foreground/70">
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
              <h4 className="mb-4 font-semibold">About</h4>
              <ul className="space-y-2 text-xs text-foreground/70">
                <li><a href="/about" className="transition-colors hover:text-foreground">About</a></li>
                <li><a href="/legal/terms" className="transition-colors hover:text-foreground">Terms of Service</a></li>
                <li><a href="/legal/privacy" className="transition-colors hover:text-foreground">Privacy Policy</a></li>
                <li><a href="/legal/cookies" className="transition-colors hover:text-foreground">Cookie Notice</a></li>
              </ul>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 font-semibold">Resources</h4>
              <ul className="space-y-2 text-xs text-foreground/70">
                <li><a href="/blog" className="transition-colors hover:text-foreground">Blog</a></li>
                <li><a href="/jobs" className="transition-colors hover:text-foreground">Jobs</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-foreground/20 pt-8">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center text-xs text-foreground/60">
                <p>
                  © {currentYear} Pasive. All rights reserved. Pasive is a product of{" "}
                  <a
                    href="http://visualhq.space"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground/80 transition-colors hover:text-foreground"
                  >
                    VisualCoreNineSystems
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="mailto:hello@pasive.co"
                  className="text-sm text-foreground/60 transition-colors hover:text-foreground"
                >
                  hello@pasive.co
                </a>
                <a
                  href="https://wa.me/message/FTFCG66XC4J2O1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
