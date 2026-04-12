'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { solutionsService, Solution } from '@/services/solutionsService'
import { Skeleton } from '@/components/ui/skeleton'

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSolutions = async () => {
      const data = await solutionsService.getAllSolutions()
      setSolutions(data)
      setLoading(false)
    }
    fetchSolutions()
  }, [])

  if (loading) {
    return (
      <div className="container py-20">
        <Head>
          <title>Our Solutions</title>
        </Head>
        <h1 className="text-4xl font-bold text-center mb-12">Our Solutions</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Our Solutions</title>
      </Head>
      <div className="container py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Our Solutions</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <Link key={solution.id} href={`/solutions/${solution.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.imageUrl && (
                    <img 
                      src={solution.imageUrl} 
                      alt={solution.title} 
                      className="w-full h-40 object-cover rounded-lg mb-4" 
                    />
                  )}
                  <CardDescription>{solution.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
