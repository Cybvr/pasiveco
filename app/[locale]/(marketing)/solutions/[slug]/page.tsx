"use client"

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CtaSection } from '@/app/(marketing)/components/CtaSection'
import { FaqSection } from '@/app/common/website/FaqSection'
import { ArrowLeft } from 'lucide-react'
import PricingPlans from '@/app/common/website/PricingPlans'
import Link from 'next/link'
import { solutionsService, Solution } from '@/services/solutionsService'
import { Button } from "@/components/ui/button"

export default function SolutionPage() {
  const params = useParams()
  const [solution, setSolution] = useState<Solution | null>(null)
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const allSolutions = await solutionsService.getAllSolutions()
      const solutionData = allSolutions.find(s => s.slug === params.slug)
      setSolution(solutionData)
      setSolutions(allSolutions)
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (!solution && !loading) {
    notFound()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col p-8 lg:20">
      <Link href="/solutions" className="mb-4">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Solutions
        </Button>
      </Link>
      <div className="bg-chart-1/10 py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-6 text-foreground">{solution.title}</h1>
              <p className="text-xl text-muted-foreground mb-8">{solution.description}</p>
              <Link href="/auth/login">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded">Get Started</button>
              </Link>
            </div>
            {solution.imageUrl && (
              <div className="flex-1 rounded-2xl overflow-hidden shadow-xl">
                <img src={solution.imageUrl} alt={solution.title} className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none" 
          dangerouslySetInnerHTML={{ __html: solution.content }} 
        />
      </div>

      <div className="container py-20 bg-muted/10">
        <h1 className="text-3xl font-bold text-center mb-12">Learn what industries we serve</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.slice(0, 4).map((solution) => (
            <Link key={solution.id} href={`/solutions/${solution.slug}`} className="flex flex-col items-center gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
              {solution.imageUrl && (
                <img src={solution.imageUrl} alt={solution.title} className="w-72 h-72 object-cover rounded-lg" />
              )}
              <div className="text-center">
                <h3 className="font-medium text-lg">{solution.title}</h3>
                <p className="text-muted-foreground text-sm">{solution.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-chart-2/5 py-20">
        <PricingPlans />
      </div>

      <div className="bg-chart-3/5">
        <FaqSection />
      </div>

      <div className="bg-chart-4/5">
        <CtaSection />
      </div>
    </div>
  )
}