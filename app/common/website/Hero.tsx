import { Twitter, Instagram, Youtube, Twitch, Globe } from "lucide-react"

const HeroSection = () => (
  <section className="text-foreground px-6 py-16 lg:py-24">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 uppercase tracking-tight">
          CREATORS 
          <br />
          TOOLS
        </h1>
        <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-xl">
          Elevate your brand. Ignite your passion. Create, share, and monetize your creative business with our robust tools. Track analytics in one place.
        </p>
        <p className="text-lg mb-8 opacity-80 max-w-xl">
          No matter where your customers, clients, or fans are, Pasive makes it easy to showcase and get paid.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20">
            Get started for free
          </button>
          <button className="border-2 border-primary/20 text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-accent transition-all">
            Learn more
          </button>
        </div>
        <p className="text-sm opacity-60">Free forever. No credit card required.</p>
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
