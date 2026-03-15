import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, CheckCircle, Heart, Palette, RefreshCw, Smartphone, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold sm:text-5xl xl:text-6xl">
                  Build your creator brand in minutes, not hours
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Create a professional creator hub that showcases all your content, drives engagement, and converts followers into revenue.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">Start creating for free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See how it works</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square">
                <Image
                  src="/images/website/potter.jpg"
                  alt="Creator Dashboard"
                  fill
                  className="object-cover rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="w-full py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Trusted by hundreds of creators worldwide</h2>
            </div>
            <div className="flex -space-x-4">
              <img
                src="/images/website/t1.jpg"
                alt="Creator 1"
                className="w-16 h-16 rounded-full border-4 border-background object-cover"
              />
              <img
                src="/images/website/t2.jpg"
                alt="Creator 2"
                className="w-16 h-16 rounded-full border-4 border-background object-cover"
              />
              <img
                src="/images/website/t3.jpg"
                alt="Creator 3"
                className="w-16 h-16 rounded-full border-4 border-background object-cover"
              />
              <img
                src="/images/website/t4.jpg"
                alt="Creator 4"
                className="w-16 h-16 rounded-full border-4 border-background object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to grow your creator business</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Pasive provides all the tools creators need to showcase content, engage audiences, and monetize their brand.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                <CardTitle>Brand Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create a stunning creator hub that matches your brand aesthetic with custom colors, fonts, and layouts.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle>Creator Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track clicks, engagement, and audience behavior with analytics designed specifically for creators.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <CardTitle>Content Monetization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sell merch, promote partnerships, offer exclusive content, and collect payments all in one place.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                <CardTitle>Multi-Platform Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Showcase content from TikTok, Instagram, YouTube, Twitch, podcasts, and more in one unified hub.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Quick Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your creator hub live in minutes with our intuitive drag-and-drop builder and templates.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <CardTitle>Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your creator hub looks perfect on all devices, ensuring your fans have a great experience anywhere.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold sm:text-4xl">How Pasive works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Launch your creator hub in three simple steps and start converting followers into fans.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                1
              </div>
              <h3 className="text-xl font-bold">Build</h3>
              <p className="mt-2 text-muted-foreground">
                Create your custom creator hub with our easy builder. Add your content, links, and branding in minutes.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                2
              </div>
              <h3 className="text-xl font-bold">Share</h3>
              <p className="mt-2 text-muted-foreground">
                Add your Pasive link to Instagram bio, TikTok profile, YouTube description, and everywhere your audience finds you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                3
              </div>
              <h3 className="text-xl font-bold">Grow</h3>
              <p className="mt-2 text-muted-foreground">
                Track performance, engage your audience, and monetize your content with powerful creator-focused tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold sm:text-4xl">Perfect for every type of creator</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                See how creators across different niches use Pasive to grow their brand and revenue.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 mt-12">
            <div className="group relative overflow-hidden rounded-lg border bg-background">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-background/80"></div>
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/images/website/podcaster.jpg"
                  alt="Content Creator Hub"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="relative z-20 p-6 pt-0 -mt-12">
                <h3 className="text-2xl font-bold">Content Creators</h3>
                <p className="mt-2 text-muted-foreground">
                  Showcase your TikTok, Instagram, YouTube content and drive traffic to your latest videos and posts.
                </p>
                <Button variant="link" className="mt-4 p-0 h-auto" asChild>
                  <Link href="#" className="group flex items-center gap-1">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-lg border bg-background">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-background/80"></div>
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src="/images/website/trainer.jpg"
                  alt="Fitness Creator"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="relative z-20 p-6 pt-0 -mt-12">
                <h3 className="text-2xl font-bold">Fitness & Lifestyle</h3>
                <p className="mt-2 text-muted-foreground">
                  Promote your programs, sell merchandise, and connect with your fitness community all in one place.
                </p>
                <Button variant="link" className="mt-4 p-0 h-auto" asChild>
                  <Link href="#" className="group flex items-center gap-1">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold sm:text-4xl">What creators are saying</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Hear from creators who have transformed their online presence and revenue with Pasive.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4">
                <img
                  src="/images/website/t4.jpg"
                  alt="Adaeze O."
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div>
                  <h3 className="font-medium">Adaeze O.</h3>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Pasive helped me turn my followers into paying customers. My engagement increased by 40% and I'm finally monetizing my content effectively."
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4">
                <img
                  src="/images/website/t2.jpg"
                  alt="Marcus T."
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div>
                  <h3 className="font-medium">Marcus T.</h3>
                  <p className="text-sm text-muted-foreground">Fitness Influencer</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The analytics are incredible. I can see exactly which content drives the most engagement and optimize my strategy accordingly. Game changer!"
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4">
                <img
                  src="/images/website/t3.jpg"
                  alt="Sophia R."
                  className="rounded-full h-10 w-10 object-cover"
                />
                <div>
                  <h3 className="font-medium">Sophia R.</h3>
                  <p className="text-sm text-muted-foreground">Lifestyle Creator</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Setting up my creator hub was so easy! I had everything running in under 10 minutes. My audience loves having all my content in one place."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold sm:text-4xl">Ready to build your creator empire?</h1>
              <p className="max-w-[900px] text-muted-foreground text-lg">
                Join hundreds of creators using Pasive to showcase their content, engage their audience, and grow their revenue.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="default" asChild>
                <Link href="/signup">Start creating for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact sales</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required. Start building your creator hub in minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}