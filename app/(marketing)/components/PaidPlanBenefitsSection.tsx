"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Check,
  BarChart3,
  Edit3,
  Shield,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Play,
  ExternalLink,
  Users,
  Zap,
} from "lucide-react"
import { benefitsData, globalStats, pricingHighlight } from "@/services/potentialData" // Restored original imports

const QRBenefitsSection = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const getIcon = (iconName: string) => {
    const icons = {
      BarChart3,
      Edit3,
      Shield,
    }
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background Elements - All absolute to scroll with content */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Pro Features</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-[0.85] tracking-tight">
              Unlock Your
              <span className="block text-primary mt-2">QR Potential</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
              Transform simple QR codes into powerful business tools with advanced analytics, custom branding, and
              enterprise-grade features that drive real results.
            </p>
            {/* Global Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{globalStats.totalScans}</div>
                <div className="text-sm text-muted-foreground">Total Scans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{globalStats.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{globalStats.countriesServed}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{globalStats.uptimePercent}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Now with sticky images */}
      {benefitsData.map((benefit, index) => {
        return (
          <div key={benefit.id} className="relative py-24 px-6">
            <div className="max-w-[1400px] mx-auto relative z-20">
              <div className={`grid lg:grid-cols-2 gap-16 items-start ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                {/* Content Side */}
                <div className={`${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">{benefit.title}</h2>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{benefit.description}</p>
                  {/* Features List */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {benefit.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {/* Stats Card */}
                  <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-muted/10 border border-primary/20 mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-primary mb-1">{benefit.stats.value}</div>
                        <div className="text-sm text-muted-foreground">{benefit.stats.label}</div>
                        {benefit.stats.trend && (
                          <div className="text-xs text-primary mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {benefit.stats.trend}
                          </div>
                        )}
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                        {getIcon(benefit.icon)}
                      </div>
                    </div>
                  </Card>
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {benefit.id === "branding" && (
                      <Button
                        size="lg"
                        className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <a href="https://pasive.co/dashboard">
                          Customize Your Brand
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </a>
                      </Button>
                    )}
                    {benefit.id !== "analytics" && benefit.id !== "branding" && (
                      <Button
                        size="lg"
                        className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <a href="https://pasive.co/dashboard/templates">
                          Browse Templates
                          <ExternalLink className="ml-2 w-5 h-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {/* Testimonial */}
                  {benefit.testimonial && (
                    <Card className="p-6 bg-muted/20 border border-muted/40">
                      <blockquote className="text-muted-foreground italic mb-4 leading-relaxed">
                        "{benefit.testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{benefit.testimonial.author}</div>
                          <div className="text-xs text-muted-foreground">
                            {benefit.testimonial.role} at {benefit.testimonial.company}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
                {/* Image Side - Added sticky classes */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : "lg:order-2"} lg:sticky lg:top-20 self-start`}>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={benefit.image || "/placeholder.svg"}
                        alt={benefit.title}
                        className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      {/* Demo Overlay */}
                      {activeDemo === benefit.id && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Play className="w-8 h-8" />
                            </div>
                            <div className="text-lg font-semibold mb-2">Demo Loading...</div>
                            <div className="text-sm opacity-80">Interactive preview coming soon</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Final CTA Section */}
      <div className="relative z-10 py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center bg-gradient-to-br from-primary/5 via-background to-muted/10 rounded-3xl p-16 border border-primary/20">
            <div className="inline-flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Start Growing Today</span>
            </div>
            <h3 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {pricingHighlight.trialDays} Days
              <span className="block text-primary">Completely Free</span>
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Then from ${pricingHighlight.startingPrice}/{pricingHighlight.billingPeriod} • Cancel anytime • No credit
              card required
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="lg" className="text-lg px-12 py-6 h-auto bg-primary hover:bg-primary/90">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-primary/30 rounded-full border-2 border-background"></div>
                  <div className="w-8 h-8 bg-primary/40 rounded-full border-2 border-background"></div>
                </div>
                <span>Join {globalStats.activeUsers}+ happy customers</span>
              </div>
            </div>
            {/* Feature Highlights */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {pricingHighlight.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 justify-center sm:justify-start">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QRBenefitsSection
