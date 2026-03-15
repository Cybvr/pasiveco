"use client"
import { useState, useEffect } from "react"
import Header from "@/app/common/website/Header"
import Footer from "@/app/common/website/Footer"
import {
  Check,
  Smartphone,
  Palette,
  BarChart,
  Instagram,
  Twitter,
  Heart,
  Play,
  MessageCircle,
  Plus,
} from "lucide-react"
import HeroSection from "@/app/common/website/Hero"
import FaqSection from "@/app/common/website/FaqSection"
import AskInBio from "@/app/common/website/AskInBio"
 
import ProductsShowcase from "@/app/common/website/ProductsShowcase"
import { featuresService, Feature } from "@/services/featuresService"

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState("")
  const [features, setFeatures] = useState<Feature[]>([])

  useEffect(() => {
    console.log("App loaded - checking Firebase config:", {
      domain: window.location.hostname,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

    // Load features from Firebase
    const loadFeatures = async () => {
      try {
        const featuresData = await featuresService.getAllFeatures()
        setFeatures(featuresData)
      } catch (error) {
        console.error("Error loading features:", error)
      }
    }

    loadFeatures()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {/* Hero Section - Orange */}
      <div className="mx-auto max-w-6xl">
        <HeroSection />
      </div>

      {/* Image Placeholder Section */}
      <div className="px-6 py-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <img
            src="images/website/screenshot.jpg"
            alt="Pasive Dashboard"
            className="w-full h-full object-cover rounded-2xl shadow-lg border-border"
          />
        </div>
      </div>

      {/* Products Showcase Section */}
      <ProductsShowcase features={features} />
      {/* AskInBio Section - Orange */}
      <div className="mx-auto max-w-6xl">
        <AskInBio />
      </div>

      {/* Create Section - Orange */}
      <section className="bg-accent px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-card rounded-3xl p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Build your creator hub</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-foreground">Match your brand aesthetic</span>
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-foreground">Add all your content</span>
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-foreground">Monetize your audience</span>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
              <img
                src="images/website/potter.jpg"
                alt="potter"
                className="mt-6 rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Build your
                <br />
                creator brand
                <br />
                in minutes,
                <br />
                not hours
              </h2>
              <p className="text-xl text-foreground mb-8">
                Showcase your TikTok, Instagram, YouTube, Twitch, podcast, merch store, brand partnerships, and
                exclusive content. Create a professional creator hub that converts followers into fans and revenue.
              </p>
              <button className="bg-primary text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary transition-colors">
                Start creating for free
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Share Section - Red */}
      <section className="bg-accent px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Drive traffic from
                <br />
                every platform
                <br />
                where your
                <br />
                audience lives
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Drop your Pasive link in your Instagram bio, TikTok profile, YouTube description, and everywhere else
                your fans find you. Turn every interaction into an opportunity to grow your creator business.
              </p>
              <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start creating for free
              </button>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Social media cards */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white">
                  <Instagram className="w-8 h-8 mb-4" />
                  <h3 className="font-bold">Instagram</h3>
                  <p className="text-sm opacity-90">Stories & Bio</p>
                </div>
                <div className="bg-cyan-400 rounded-2xl p-6 text-white">
                  <div className="w-8 h-8 mb-4 flex items-center justify-center bg-white rounded">
                    <span className="text-black font-bold text-lg">T</span>
                  </div>
                  <h3 className="font-bold">TikTok</h3>
                  <p className="text-sm opacity-90">Profile Bio</p>
                </div>
                <div className="bg-blue-500 rounded-2xl p-6 text-white">
                  <Twitter className="w-8 h-8 mb-4" />
                  <h3 className="font-bold">Twitter</h3>
                  <p className="text-sm opacity-90">Profile & Tweets</p>
                </div>
                <div className="bg-red-500 rounded-2xl p-6 text-white">
                  <Play className="w-8 h-8 mb-4" />
                  <h3 className="font-bold">YouTube</h3>
                  <p className="text-sm opacity-90">Channel & Videos</p>
                </div>
              </div>
              <img
                src="images/website/trainer.jpg"
                alt="Social media interface"
                className="mt-6 rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Analytics Section - Beige */}
      <section className="bg-background px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="images/website/podcaster.jpg"
                alt="Analytics dashboard screenshot"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Track what
                <br />
                content drives
                <br />
                the most
                <br />
                engagement
              </h2>
              <p className="text-xl text-foreground mb-8">
                See which content resonates most with your audience and optimize your creator strategy. Get insights on
                click-through rates, top-performing links, and audience behavior to maximize your creator revenue.
              </p>
              <button className="bg-primary text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary transition-colors">
                Start creating for free
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Trust Section */}
      <section className="bg-card px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by hundreds of creators worldwide
          </h2>
          <div className="flex justify-center items-center space-x-8 mt-12">
            <div className="flex -space-x-4">
              <img
                src="images/website/t1.jpg"
                alt="Creator 1"
                className="w-16 h-16 rounded-full border-4 border-card object-cover"
              />
              <img
                src="images/website/t2.jpg"
                alt="Creator 2"
                className="w-16 h-16 rounded-full border-4 border-card object-cover"
              />
              <img
                src="images/website/t3.jpg"
                alt="Creator 3"
                className="w-16 h-16 rounded-full border-4 border-card object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="bg-background px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-accent rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mr-4">
                  <Smartphone className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Monetize your content like a pro</h3>
              </div>
              <p className="text-foreground mb-6">
                Sell merch, promote brand partnerships, offer exclusive content, and collect payments - all from one
                creator hub that converts.
              </p>
              <div className="bg-card rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-red-400 to-pink-400 rounded-lg aspect-square flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg aspect-square flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg aspect-square flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <img
                src="images/website/monetize.jpg"
                alt="Content creation tools"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
            {/* Feature 2 */}
            <div className="bg-accent rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mr-4">
                  <BarChart className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Scale your creator business</h3>
              </div>
              <p className="text-foreground mb-6">
                Get creator-focused analytics that show you exactly what's working and help you optimize your content
                strategy for maximum growth and revenue.
              </p>
              <div className="bg-card rounded-2xl p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Monthly clicks</span>
                    <span className="text-2xl font-bold text-blue-600">12.5K</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              <img
                src="images/website/hiker.jpg"
                alt="Audience engagement metrics"
                className="rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* The fast, friendly section */}
      <section className="bg-card px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-8">
            The creator-first link in bio
            <br />
            that actually converts.
          </h2>
          <button className="bg-primary text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary transition-colors">
            Start creating for free
          </button>
        </div>
      </section>
      {/* Testimonial section */}
      <section className="bg-accent px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-3xl p-8 lg:p-12 text-foreground text-center">
            <div className="w-20 h-20 bg-card rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
              <img
                src="images/website/t4.jpg"
                alt="Content Creator Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <blockquote className="text-2xl lg:text-3xl font-bold mb-6 leading-relaxed">
              "Pasive helped me turn my followers
              <br />
              into paying customers. Game changer!"
            </blockquote>
            <cite className="text-lg opacity-90">— Adaeze O., Content Creator</cite>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <FaqSection />
      <Footer />
    </div>
  )
}

export default App