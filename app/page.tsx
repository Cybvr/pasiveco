"use client"
import { useState, useEffect, useRef } from "react"
import Link from 'next/link'
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
  Send,
  User,
  Bot,
  ChevronDown,
  Package,
  Youtube,
  Twitch,
  Globe,
  Download,
  BookOpen,
  GraduationCap,
  Calendar,
  Headphones
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { featuresService, Feature } from "@/services/featuresService"

// Data Constants
const FAQ_DATA = [
  {
    id: "q1",
    question: "What can I add to my bio page?",
    answer: "You can create a comprehensive bio page with your profile information, custom links, social media links, products for sale, and even an AI chat avatar. All content is fully customizable with themes, fonts, and appearance settings to match your brand.",
  },
  {
    id: "q2",
    question: "How do I customize the appearance of my bio page?",
    answer: "Use our appearance settings to customize button shapes (rounded, square, pill), font families, font sizes, colors, and themes. You can also set custom backgrounds with colors or images for both your bio card and page background.",
  },
  {
    id: "q3",
    question: "Can I sell products directly from my bio page?",
    answer: "Yes! You can add products to your shop tab, including product images, descriptions, prices, and direct purchase links. Your products will be displayed beautifully alongside your other content.",
  },
  {
    id: "q4",
    question: "What is the AI Avatar feature?",
    answer: "The AI Avatar creates a digital twin that can answer questions about you based on your profile information and uploaded context files. Visitors can chat with your AI representative to learn more about your services, background, and expertise.",
  },
  {
    id: "q5",
    question: "How do QR codes work with my bio page?",
    answer: "Generate custom QR codes that link directly to your bio page. You can customize the QR code design, colors, and add your logo. Print them on business cards, flyers, or display them anywhere to drive traffic to your bio page.",
  },
];

const websiteData = {
  hero: {
    title: "CREATORS TOOLS",
    subtitle: "Elevate your brand. Ignite your passion. Create, share, and monetize your creative business with our robust tools. Track analytics in one place.",
    ctaText: "Get started for free",
  },
  products: [
    {
      id: "digital-products",
      title: "Digital Products",
      description: "Sell any and every kind of digital product, from content packs to designs to bundles and more without stress.",
      icon: "Download",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "ebooks",
      title: "Ebooks",
      description: "Pasive is the best platform to sell your ebooks both downloadable and non-downloadable in any format.",
      icon: "BookOpen",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center",
    },
    {
      id: "courses-memberships",
      title: "Courses",
      description: "You can host your courses & membership sites with unlimited videos & files, unlimited storage, and have unlimited students.",
      icon: "GraduationCap",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    },
  ]
};

const iconMap: any = {
  'Download': Download,
  'BookOpen': BookOpen,
  'GraduationCap': GraduationCap,
  'Calendar': Calendar,
  'Headphones': Headphones,
  'Package': Package
};

// Inline Components
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
          className="max-w-full h-auto rounded-lg shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
        />
      </div>
    </div>
  </section>
);

const ProductsShowcase = ({ features = [] }: { features?: any[] }) => (
  <div className="bg-background py-16 px-4">
    <div className="mx-auto max-w-5xl">
      <div className="text-left mb-16">
        <h2 className="text-5xl font-bold text-foreground mb-6">
          Everything you need to grow
        </h2>
        <p className="text-left text-xl text-muted-foreground mb-8">
          Pasive provides the best tools for creators to monetize their audience and scale their impact.
        </p>
        <div className="w-24 h-1 text-left bg-primary rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(features.length > 0 ? features : websiteData.products).map((item, index) => {
          const isFeature = 'slug' in item;
          const IconComponent = iconMap[item.icon] || Package;
          const imageUrl = isFeature ? (item.featuredImage || item.imageUrl) : item.image;
          const linkHref = isFeature ? `/features/${item.slug}` : '#';
          
          return (
            <Link
              key={isFeature ? item.id : index}
              href={linkHref}
              className="relative group cursor-pointer transform transition-all duration-500"
            >
              <div className="relative bg-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden h-[450px] flex flex-col group-hover:shadow-xl">
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="flex-grow p-8 flex flex-col">
                  <div className={`w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 -mt-16 relative z-10 shadow-lg flex-shrink-0 group-hover:scale-110`}>
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 transition-colors duration-300 flex-shrink-0 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed transition-colors duration-300 mb-6 flex-grow">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className={`absolute inset-0 rounded-2xl bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`}></div>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

const AskInBio = () => {
  const [messages, setMessages] = useState<any[]>([
    { id: "1", content: `Hi! I'm your Pasive AI. Ask me anything about how we help creators grow!`, isUser: false, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg = { id: Date.now().toString(), content: inputMessage, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setTimeout(() => {
      const aiMsg = { id: (Date.now()+1).toString(), content: "Pasive is designed to help you monetize your creative work instantly. We handle the technical stuff while you focus on creating!", isUser: false, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-background px-6 py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Introducing Ask in Bio</h2>
          <p className="text-xl text-muted-foreground">Let your audience connect with you on a deeper level through AI-powered conversations</p>
        </div>
        <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-3 max-w-xs ${m.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  <p className="text-sm">{m.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border p-6 flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-muted text-foreground px-4 py-3 rounded-2xl focus:outline-none ring-primary/20 transition-all"
            />
            <button onClick={handleSendMessage} className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FaqSection = () => (
    <section id="faq" className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="container px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground mb-4">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Support & Help
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Frequently Asked
              <span className="block">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md">Everything you need to know about our creator tools platform.</p>
          </div>
          <div className="lg:col-span-7">
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                {FAQ_DATA.map((item, index) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <div className="bg-card rounded-2xl px-6 border border-border mb-4">
                      <AccordionTrigger>
                        <div className="text-left text-lg font-semibold text-foreground py-6">
                            <span className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold text-foreground mt-1">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="flex-1">{item.question}</span>
                            </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-muted-foreground pb-6 pl-12 pr-4">
                            {item.answer}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [features, setFeatures] = useState<Feature[]>([])

  useEffect(() => {
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
      
      <div className="mx-auto max-w-6xl">
        <HeroSection />
      </div>

      <div className="px-6 py-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <img
            src="images/website/screenshot.jpg"
            alt="Pasive Dashboard"
            className="w-full h-full object-cover rounded-2xl shadow-2xl border border-border"
          />
        </div>
      </div>

      <ProductsShowcase features={features} />

      <div className="mx-auto max-w-6xl">
        <AskInBio />
      </div>

      <section className="bg-muted/30 px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Build your creator hub</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-foreground">Match your brand aesthetic</span>
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-foreground">Monetize your audience</span>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
              <img src="images/website/potter.jpg" alt="potter" className="mt-6 rounded-2xl shadow-lg w-full object-cover" />
            </div>
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Build your
                <br />
                creator brand
                <br />
                in minutes
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Create a professional creator hub that converts followers into fans and revenue. Showcase everything in one beautiful link.
              </p>
              <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg shadow-lg">
                Start creating for free
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Drive traffic
                <br />
                from every
                <br />
                platform
              </h2>
              <p className="text-xl mb-8 text-muted-foreground">
                Drop your Pasive link in your Instagram bio, TikTok profile, and YouTube description. Turn every interaction into an opportunity.
              </p>
              <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg">
                Start creating for free
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-500/10 rounded-2xl p-6 border border-pink-500/20">
                <Instagram className="w-8 h-8 mb-4 text-pink-500" />
                <h3 className="font-bold">Instagram</h3>
              </div>
              <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
                <Twitter className="w-8 h-8 mb-4 text-blue-500" />
                <h3 className="font-bold">Twitter</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection />
      <Footer />
    </div>
  )
}

export default App