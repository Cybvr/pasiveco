import React from "react"
import Link from 'next/link'
import { User, Package, Menu, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProducts, Product } from '@/services/productsService'
import { useAuth } from '@/hooks/useAuth'
import MiniPageModal from "./MiniPageModal"
import ShareModal from "./ShareModal"
import Watermark from "./Watermark"

interface SocialLink {
  id: string
  platform: string
  url: string
  thumbnail: string
  active: boolean
}

interface ProfileData {
  username: string
  displayName: string
  bio: string
  profilePicture: string | null
  bannerImage?: string | null
  socialLinks?: SocialLink[]
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

interface PublicPost {
  id: string
  message: string
  createdAt: string
  likeCount: number
  commentCount: number
}

interface BioPagePreviewProps {
  profileData: ProfileData
  links: CustomLink[]
  profileOwnerId?: string
  posts?: PublicPost[]
}

const BioPagePreview: React.FC<BioPagePreviewProps> = ({ profileData, links, profileOwnerId, posts = [] }) => {
  const { user } = useAuth()
  const [isPageModalOpen, setIsPageModalOpen] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = React.useState(false)

  React.useEffect(() => {
    const loadProducts = async () => {
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

    if (profileOwnerId || user?.uid) loadProducts()
  }, [user, profileOwnerId])

  const socialLinksToDisplay = profileData.socialLinks || []
  const activeProducts = products.filter(product => product.status === 'active')

  return (
    <div className="rounded-lg overflow-hidden p-2 min-h-[500px]">
      <Card className="shadow-lg bg-background border-border relative overflow-hidden border-none">
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
              <h2 className="text-xl font-semibold text-foreground">@{profileData.username?.startsWith('@') ? profileData.username.substring(1) : profileData.username}</h2>
              <p className="text-muted-foreground text-sm mt-2">{profileData.bio}</p>
              {socialLinksToDisplay.filter(link => link.active).length > 0 && (
                <div className="flex justify-center gap-3 mt-4">
                  {socialLinksToDisplay.filter(link => link.active).map((social) => (
                    <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted/50 transition-colors">
                      <img src={social.thumbnail || '/images/pages/website.svg'} alt={social.platform} className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.src = '/images/pages/website.svg' }} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Tabs defaultValue="links" className="w-full">
              <TabsList className="flex items-center justify-center w-full gap-1 border-none">
                <TabsTrigger value="links" className="flex items-center gap-2 py-2 px-4 rounded-lg text-base border border-border text-foreground">Links</TabsTrigger>
                <TabsTrigger value="shop" className="flex items-center gap-2 py-2 px-4 rounded-lg text-base border border-border text-foreground">Shop</TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2 py-2 px-4 rounded-lg text-base border border-border text-foreground">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="mt-4">
                <div className="space-y-3">
                  {links.filter((link) => link.active).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-start gap-3 border transition-colors cursor-pointer h-auto p-4 rounded-lg text-base border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground"
                    >
                      <img src={link.thumbnail} alt={link.title} className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.src = '/images/pages/website.svg' }} />
                      <span className="font-medium">{link.title}</span>
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
                        <div className="block border rounded-lg p-4 border-border hover:shadow-md transition-all">
                          <a href={`/${profileData.username}/product/${product.id}`} className="block">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.thumbnail ? (
                                  <img src={product.thumbnail} alt={product.name} className="w-8 h-8 object-cover rounded" />
                                ) : (
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-foreground">{product.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                  <span className="font-bold text-sm text-foreground">
                                    {product.currency === 'USD' ? '$' : product.currency}{product.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                        {product.url && product.url !== '' && (
                          <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                            <Button size="sm" className="w-full rounded-lg">Buy Now</Button>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">No products available</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="posts" className="mt-4">
                <div className="space-y-3">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/dashboard/posts/${post.id}`}
                        className="block rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-3">{post.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(post.createdAt))} · {post.likeCount} likes · {post.commentCount} comments
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No posts yet.
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
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} profileData={{ username: profileData.username }} />
    </div>
  )
}

export default BioPagePreview
