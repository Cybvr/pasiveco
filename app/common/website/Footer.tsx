import { Instagram, Twitter, Youtube, Mail } from "lucide-react"
import { useState } from "react"
import { footerData } from "@/app/data/footerData"

const Footer = () => {
  const [email, setEmail] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    // Handle signup logic here
    setEmail("")
  }

  return (
    <footer className="bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main content in asymmetrical layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left side - Brand, signup, and social */}
          <div className="lg:w-2/5 space-y-6">
            <div className="flex items-center space-x-2">
              <img src="/images/logo.svg" alt={footerData.brand.logoAlt} className="w-8 h-8" />
              <span className="text-xl font-bold">{footerData.brand.name}</span>
            </div>
            <p className="text-foreground/80 text-lg leading-relaxed">
              {footerData.brand.tagline}
            </p>
            {/* Signup form */}
            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={footerData.form.placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all placeholder:text-foreground/60"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium whitespace-nowrap"
                >
                  {footerData.form.buttonText}
                </button>
              </form>
              <p className="text-foreground/60 text-sm">
                {footerData.form.description}
              </p>
            </div>
            <div className="flex space-x-4">
              {footerData.socialMedia.map((social, index) => {
                const IconComponent = { Instagram, Twitter, Youtube }[social.iconName]
                return (
                  <IconComponent
                    key={index}
                    className="w-5 h-5 text-foreground/60 hover:text-foreground cursor-pointer transition-colors"
                  />
                )
              })}
            </div>
          </div>
          {/* Right side - Navigation in horizontal layout */}
          <div className="lg:w-3/5 flex flex-col sm:flex-row gap-8 sm:gap-12">
            {footerData.navigation.map((category, index) => (
              <div className="flex-1" key={index}>
                <h4 className="font-semibold mb-4">{category.category}</h4>
                <ul className="space-y-2 text-foreground/80">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.url} className="hover:text-foreground transition-colors">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom section - centered with stacked layout on mobile */}
        <div className="mt-16 pt-8 border-t border-foreground/20">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-6">
              {footerData.footerLinks.map((link, index) => (
                <a key={index} href={link.url} className="text-foreground/60 hover:text-foreground text-sm transition-colors">
                  {link.text}
                </a>
              ))}
            </div>
            <p className="text-foreground/60 text-sm">{footerData.copyright.text}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
