import { Twitter, Instagram, Youtube, Twitch, Globe } from "lucide-react"

const HeroSection = () => (
  <section className="text-foreground px-6 py-16 lg:py-24">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
          Everything 
          <br />
          you create, in
          <br />
          one place.
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of creators using Pasive for their link in bio. One link to help you share everything you
          create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button className="bg-black text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-500 transition-colors">
            Get started for free
          </button>
          <button className="border-2 border-white text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-800 transition-colors">
            Learn more
          </button>
        </div>
        <p className="text-sm opacity-75">Free forever. No credit card required.</p>
      </div>
      <div className="flex justify-center">
        <img
          src="/images/website/background.jpg"
          alt="Background"
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    </div>
  </section>
)

export default HeroSection
