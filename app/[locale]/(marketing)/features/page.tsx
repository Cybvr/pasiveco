
"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { featuresService, Feature } from '@/services/featuresService'
import { iconMap } from '@/app/data/websiteData'
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const featuresData = await featuresService.getAllFeatures()
        setFeatures(featuresData)
      } catch (error) {
        console.error('Error loading features:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeatures()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Powerful Features for Your Business
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover all the tools and features that make Pasive the perfect platform for selling your products and services online.
          </p>
          <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon || 'Package']
            
            return (
              <Link
                key={feature.id}
                href={`/features/${feature.slug}`}
                className="group block"
              >
                <div className="bg-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col group-hover:shadow-xl group-hover:-translate-y-1">
                  {/* Feature Image */}
                  {(feature.featuredImage || feature.imageUrl) && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={feature.featuredImage || feature.imageUrl}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-grow p-8 flex flex-col">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 ${(feature.featuredImage || feature.imageUrl) ? '-mt-16 relative z-10 shadow-lg' : ''}`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                      {feature.description}
                    </p>
                    
                    {/* Learn More Link */}
                    <div className="text-primary font-semibold group-hover:underline">
                      Learn more →
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators and entrepreneurs who trust Pasive to power their online business.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-8 py-4 text-lg">
              Start Selling Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
