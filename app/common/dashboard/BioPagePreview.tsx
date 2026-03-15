import React from "react"
import { User, Plus, Link, Package, Brain, ShoppingBag, Menu, Share2, MessageSquare, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProducts, Product } from '@/services/productsService'
import { getUserProfile } from '@/services/userProfilesService'
import { useAuth } from '@/hooks/useAuth'
import MiniPageModal from "./MiniPageModal"
import ShareModal from "./ShareModal"
import Watermark from "./Watermark"
import Image from "next/image"
import { Inter, Roboto, Poppins, Open_Sans, Lato, Montserrat, Nunito, Raleway, Ubuntu, Playfair_Display, Merriweather, Oswald, Source_Sans_3, Work_Sans, DM_Sans } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'] })
const poppins = Poppins({ weight: ['400', '500', '600'], subsets: ['latin'] })
const openSans = Open_Sans({ subsets: ['latin'] })
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'] })
const montserrat = Montserrat({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })
const nunito = Nunito({ weight: ['400', '600', '700'], subsets: ['latin'] })
const raleway = Raleway({ weight: ['400', '500', '600'], subsets: ['latin'] })
const ubuntu = Ubuntu({ weight: ['400', '500', '700'], subsets: ['latin'] })
const playfairDisplay = Playfair_Display({ weight: ['400', '500', '600'], subsets: ['latin'] })
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ['latin'] })
const oswald = Oswald({ weight: ['400', '500', '600'], subsets: ['latin'] })
const sourceSansPro = Source_Sans_3({ weight: ['400', '600'], subsets: ['latin'] })
const workSans = Work_Sans({ weight: ['400', '500', '600'], subsets: ['latin'] })
const dmSans = DM_Sans({ weight: ['400', '500', '700'], subsets: ['latin'] })

interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

interface AppearanceData {
  buttonShape?: 'rounded' | 'square' | 'pill'
  fontFamily?: 'inter' | 'roboto' | 'poppins' | 'open-sans' | 'lato' | 'montserrat' | 'nunito' | 'raleway' | 'ubuntu' | 'playfair-display' | 'merriweather' | 'oswald' | 'source-sans-pro' | 'work-sans' | 'dm-sans'
  fontSize?: 'small' | 'medium' | 'large'
  buttonSize?: 'small' | 'medium' | 'large'
  buttonColor?: string
  buttonTextColor?: string
  textColor?: string
}

interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  bannerImage?: string | null
  socialLinks?: SocialLink[]
  appearance?: AppearanceData
  backgroundType?: 'color' | 'image'
  backgroundColor?: string
  backgroundImage?: string | null
  pageBackgroundType?: 'color' | 'image'
  pageBackgroundColor?: string
  pageBackgroundImage?: string | null
}

interface CustomLink {
  id: string
  title: string
  description?: string
  url: string
  thumbnail: string
  active: boolean
  clicks: number
  ctr: number
}

interface BioPagePreviewProps {
  profileData: ProfileData
  links: CustomLink[]
  selectedTheme?: string
  profileOwnerId?: string
}

const BioPagePreview: React.FC<BioPagePreviewProps> = ({ profileData, links, selectedTheme = 'default', profileOwnerId }) => {
  const { user } = useAuth()
  const [isPageModalOpen, setIsPageModalOpen] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = React.useState(false)

  React.useEffect(() => {
    const loadProducts = async () => {
      // Use profileOwnerId if provided (for public profiles), otherwise use current user
      const userId = profileOwnerId || user?.uid
      if (!userId) return

      setLoadingProducts(true)
      try {
        const userProducts = await getUserProducts(userId)
        setProducts(userProducts)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    // Load products for public profiles (profileOwnerId) or authenticated users
    if (profileOwnerId || user?.uid) {
      loadProducts()
    }
  }, [user, profileOwnerId])

  const socialLinksToDisplay = profileData.socialLinks || []

  const getAppearanceStyles = () => {
    const appearance = profileData.appearance || {}

    const buttonShapeClass = {
      'rounded': 'rounded-lg',
      'square': 'rounded-none',
      'pill': 'rounded-full'
    }[appearance.buttonShape || 'rounded']

    const fontFamilyClass = {
      'inter': inter.className,
      'roboto': roboto.className,
      'poppins': poppins.className,
      'open-sans': openSans.className,
      'lato': lato.className,
      'montserrat': montserrat.className,
      'nunito': nunito.className,
      'raleway': raleway.className,
      'ubuntu': ubuntu.className,
      'playfair-display': playfairDisplay.className,
      'merriweather': merriweather.className,
      'oswald': oswald.className,
      'source-sans-pro': sourceSansPro.className,
      'work-sans': workSans.className,
      'dm-sans': dmSans.className
    }[appearance.fontFamily || 'inter']

    const fontSizeClass = {
      'small': 'text-sm',
      'medium': 'text-base',
      'large': 'text-lg'
    }[appearance.fontSize || 'medium']

    const buttonSizeClass = {
      'small': 'h-auto p-2',
      'medium': 'h-auto p-4',
      'large': 'h-auto p-6'
    }[appearance.buttonSize || 'medium']

    const tabSizeClass = {
      'small': 'py-1.5 px-3',
      'medium': 'py-2 px-4',
      'large': 'py-3 px-6'
    }[appearance.buttonSize || 'medium']

    const customButtonStyle = appearance.buttonColor ? {
      backgroundColor: appearance.buttonColor,
      borderColor: appearance.buttonColor
    } : {}

    const customTextStyle = appearance.textColor ? {
      color: appearance.textColor
    } : {}

    const customButtonTextStyle = appearance.buttonTextColor ? {
      color: appearance.buttonTextColor
    } : {}

    return {
      buttonShapeClass,
      fontFamilyClass,
      fontSizeClass,
      buttonSizeClass,
      tabSizeClass,
      customButtonStyle,
      customTextStyle,
      customButtonTextStyle
    }
  }

  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'blue':
        return {
          cardClass: 'bg-blue-50 border-blue-200',
          buttonClass: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700',
          textClass: 'text-blue-800',
          iconClass: 'text-blue-600',
          tabActiveClass: 'bg-blue-100 text-blue-700 border-blue-300',
          // Added for product card styling
          productCard: {
            backgroundColor: '#e0f2fe', // Light blue background
            borderColor: '#93c5fd' // Blue border
          },
          text: {
            primary: '#0e7490' // Dark blue text
          },
          accent: '#0369a1' // Strong blue accent
        }
      case 'green':
        return {
          cardClass: 'bg-green-50 border-green-200',
          buttonClass: 'border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700',
          textClass: 'text-green-800',
          iconClass: 'text-green-600',
          tabActiveClass: 'bg-green-100 text-green-700 border-green-300',
          // Added for product card styling
          productCard: {
            backgroundColor: '#d9f7dc', // Light green background
            borderColor: '#a7f3a9' // Green border
          },
          text: {
            primary: '#166534' // Dark green text
          },
          accent: '#15803d' // Strong green accent
        }
      case 'purple':
        return {
          cardClass: 'bg-purple-50 border-purple-200',
          buttonClass: 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-purple-700',
          textClass: 'text-purple-800',
          iconClass: 'text-purple-600',
          tabActiveClass: 'bg-purple-100 text-purple-700 border-purple-300',
          // Added for product card styling
          productCard: {
            backgroundColor: '#f3e8ff', // Light purple background
            borderColor: '#d8b4fe' // Purple border
          },
          text: {
            primary: '#7e22ce' // Dark purple text
          },
          accent: '#9d17d9' // Strong purple accent
        }
      default:
        return {
          cardClass: 'bg-background border-border',
          buttonClass: 'border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground',
          textClass: 'text-foreground',
          iconClass: 'text-muted-foreground',
          tabActiveClass: 'bg-muted text-foreground border-muted-foreground',
          // Added for product card styling
          productCard: {},
          text: {
            primary: 'text-foreground'
          },
          accent: 'text-foreground'
        }
    }
  }

  const theme = getThemeStyles()
  const appearance = getAppearanceStyles()
  const activeProducts = products.filter(product => product.status === 'active')

  const getBackgroundStyle = () => {
    if (profileData.backgroundType === 'image' && profileData.backgroundImage) {
      return {
        backgroundImage: `url(${profileData.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    } else if (profileData.backgroundColor) {
      return {
        backgroundColor: profileData.backgroundColor
      }
    }
    return {}
  }

  const getPageBackgroundStyle = () => {
    if (profileData.pageBackgroundType === 'image' && profileData.pageBackgroundImage) {
      return {
        backgroundImage: `url(${profileData.pageBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    } else if (profileData.pageBackgroundColor) {
      return {
        backgroundColor: profileData.pageBackgroundColor
      }
    }
    return {}
  }

  return (
    <div className={`rounded-lg overflow-hidden p-2 min-h-[500px] ${appearance.fontFamilyClass}`} style={getPageBackgroundStyle()}>
      <Card className={`shadow-lg ${theme.cardClass} relative overflow-hidden border-none`} style={getBackgroundStyle()}>
        {(profileData.backgroundType === 'image' && profileData.backgroundImage) && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
        )}
        <div className="absolute top-0 left-0 right-0 z-20 bg-transparent pointer-events-none">
          <div className="flex items-center justify-between p-3 pointer-events-auto">
            <button onClick={() => setIsPageModalOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Menu className={`w-4 h-4 ${profileData.bannerImage ? 'text-white drop-shadow-md' : 'text-muted-foreground'}`} />
            </button>
            <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Share2 className={`w-4 h-4 ${profileData.bannerImage ? 'text-white drop-shadow-md' : 'text-muted-foreground'}`} />
            </button>
          </div>
        </div>

        {profileData.bannerImage && (
          <div className="w-full h-32 relative z-10">
            <img src={profileData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          </div>
        )}

        <CardContent className={`p-2 relative z-10 ${profileData.bannerImage ? '-mt-12' : 'pt-14'}`}>
          <div className="text-center space-y-4 mb-6">
            <div className={`w-24 h-24 bg-muted rounded-full mx-auto overflow-hidden relative z-20 ${profileData.bannerImage ? 'border-4 border-background shadow-sm' : ''}`}>
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${theme.textClass}`}>@{profileData.username?.startsWith('@') ? profileData.username.substring(1) : profileData.username}</h2>
              <p className={`${theme.iconClass} text-sm mt-2`}>{profileData.bio}</p>
              {socialLinksToDisplay && socialLinksToDisplay.filter(link => link.active).length > 0 && (
                <div className="flex justify-center gap-3 mt-4">
                  {socialLinksToDisplay.filter(link => link.active).map((social) => {
                    const getSocialIcon = (platform: string) => {
                      const platformLower = platform.toLowerCase();
                      const iconMap: { [key: string]: string } = {
                        twitter: '/images/pages/twitter.svg',
                        facebook: '/images/pages/facebook.svg',
                        instagram: '/images/pages/instagram.svg',
                        linkedin: '/images/pages/linkedin.svg',
                        youtube: '/images/pages/youtube.svg',
                        tiktok: '/images/pages/tik-tok.svg',
                        github: '/images/pages/github.svg',
                        discord: '/images/pages/discord.svg',
                        telegram: '/images/pages/telegram.svg',
                        whatsapp: '/images/pages/whatsapp.svg',
                        spotify: '/images/pages/spotify.svg',
                        twitch: '/images/pages/twitch.svg'
                      };
                      return iconMap[platformLower] || social.thumbnail || '/images/pages/website.svg';
                    };

                    return (
                      <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted/50 transition-colors">
                        <img 
                          src={getSocialIcon(social.platform)} 
                          alt={social.platform} 
                          className="w-4 h-4 object-contain" 
                          onError={(e) => { e.currentTarget.src = "/images/pages/website.svg"; }} 
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <Tabs defaultValue="links" className="w-full max-w-md mx-auto">
              <TabsList className={`flex justify-center w-full gap-1 border-none ${appearance.buttonShapeClass}`}>
                <TabsTrigger value="links" className={`flex items-center gap-2  ${appearance.tabSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass} data-[state=active]:${theme.tabActiveClass}`} style={{...appearance.customButtonStyle, ...appearance.customButtonTextStyle}}>
                  <span style={appearance.customButtonTextStyle}>Links</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className={`flex items-center gap-2 ${appearance.tabSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass} data-[state=active]:${theme.tabActiveClass}`} style={{...appearance.customButtonStyle, ...appearance.customButtonTextStyle}}>
                  <span style={appearance.customButtonTextStyle}>Shop</span>
                </TabsTrigger>

              </TabsList>

              <TabsContent value="links" className="mt-4">
                <div className="space-y-3">
                  {links.filter((link) => link.active).map((link) => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-start gap-3 border transition-colors cursor-pointer ${appearance.buttonSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass}`} 
                      style={{...appearance.customButtonStyle, ...appearance.customButtonTextStyle}}
                    >
                      <img src={link.thumbnail} alt={link.title} className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.src = "/images/pages/website.svg" }} />
                      <span className={`font-medium ${selectedTheme === 'default' ? '' : theme.textClass}`} style={appearance.customButtonTextStyle}>
                        {link.title}
                      </span>
                    </a>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="shop" className="mt-4">
                <div className="space-y-3">
                  {loadingProducts ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : activeProducts.length > 0 ? (
                    activeProducts.map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className={`block border rounded-lg p-4 ${theme.buttonClass.replace('hover:border-muted-foreground hover:bg-muted/50', 'hover:shadow-md')} transition-all`}>
                          <a 
                            href={`/${profileData.username}/product/${product.id}`}
                            className="block"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.thumbnail ? (
                                  <img src={product.thumbnail} alt={product.name} className="w-8 h-8 object-cover rounded" />
                                ) : (
                                  <Package className={`w-6 h-6 ${theme.iconClass}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm ${theme.textClass} ${appearance.fontSizeClass}`} style={appearance.customTextStyle}>{product.name}</h4>
                                <p className={`text-xs ${theme.iconClass} mt-1 line-clamp-2`} style={appearance.customTextStyle}>{product.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                  <span className={`font-bold text-sm ${theme.textClass}`} style={appearance.customTextStyle}>
                                    {product.currency === 'USD' ? '$' : product.currency}{product.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                        {product.url && product.url !== '' && (
                          <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                            <Button 
                              size="sm" 
                              className={`w-full ${appearance.buttonShapeClass}`} 
                              style={{...appearance.customButtonStyle, ...appearance.customButtonTextStyle}}
                            >
                              <span style={appearance.customButtonTextStyle}>Buy Now</span>
                            </Button>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-4 text-muted-foreground text-sm ${appearance.fontSizeClass}`} style={appearance.customTextStyle}>
                      No products available
                    </div>
                  )}
                </div>
              </TabsContent>


            </Tabs>
          </div>

          <Watermark />
        </CardContent>
      </Card>
      <MiniPageModal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );

}

export default BioPagePreview