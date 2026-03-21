"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Menu, Share2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserByUsername } from '@/services/userService';
import { getSocialProfileByUsername, getSocialPosts } from '@/lib/social-data';
import { getUserProducts, Product } from '@/services/productsService';
import { getProductTypeLabel } from '@/lib/productTypes';
import { getDicebearAvatar } from '@/lib/avatar';
import { getSocialIcon } from '@/lib/socialIcons';
import MiniPageModal from '@/app/common/dashboard/MiniPageModal';
import ShareModal from '@/app/common/dashboard/ShareModal';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency, EXCHANGE_RATE } from "@/utils/currency";

export default function StorefrontLayoutClient({ slug, children, isProductPage = false }: { slug: string, children: React.ReactNode, isProductPage?: boolean }) {
  const { user } = useAuth();
  const { currency: userCurrency } = useCurrency();

  const [profileData, setProfileData] = useState<any>(null);
  const [profileOwnerId, setProfileOwnerId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [firebaseProfile, socialProfile, socialPosts] = await Promise.all([
          getUserByUsername(slug),
          getSocialProfileByUsername(slug),
          getSocialPosts(),
        ]);

        if (firebaseProfile) {
          setProfileData({ ...firebaseProfile });
          setProfileOwnerId(firebaseProfile.userId || firebaseProfile.id || null);
          setLinks(firebaseProfile.links || []);
          setPosts(socialProfile ? socialPosts.filter((p: any) => p.authorId === socialProfile.id) : []);
        } else if (socialProfile) {
          setProfileData({ ...socialProfile, displayName: socialProfile.name, profilePicture: socialProfile.image });
          setProfileOwnerId(socialProfile.id);
          setLinks(socialProfile.links || []);
          setPosts(socialPosts.filter((p: any) => p.authorId === socialProfile.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  useEffect(() => {
    const loadProducts = async () => {
      const userId = profileOwnerId || user?.uid;
      if (!userId) return;
      setLoadingProducts(true);
      try {
        const userProducts = await getUserProducts(userId);
        setProducts(userProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (profileOwnerId || user?.uid) loadProducts();
  }, [user, profileOwnerId]);

  const formatProductPrice = (price: number, productCurrency: string) => {
    let displayPrice = price;
    let displayCurrency = productCurrency as any;
    if (productCurrency === 'NGN' && userCurrency === 'USD') { displayPrice = price / EXCHANGE_RATE; displayCurrency = 'USD'; }
    else if (productCurrency === 'USD' && userCurrency === 'NGN') { displayPrice = price * EXCHANGE_RATE; displayCurrency = 'NGN'; }
    return formatCurrency(displayPrice, displayCurrency);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const p = profileData || { username: slug };
  const socialLinks = (p.socialLinks || []).filter((l: any) => l.active);
  const activeProducts = products.filter(prod => prod.status === 'active');
  const activeLinks = links.filter((l: any) => l.active);

  // DiceBear glass cover if no banner
  const coverImage = p.bannerImage || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(p.username || slug)}&size=1200&backgroundType=gradientLinear`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 pointer-events-none">
        <button onClick={() => setIsPageModalOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors pointer-events-auto">
          <Menu className="w-4 h-4 text-white drop-shadow-md" />
        </button>
        <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors pointer-events-auto">
          <Share2 className="w-4 h-4 text-white drop-shadow-md" />
        </button>
      </div>

      {/* Cover image (banner or DiceBear glass) */}
      <div className="w-full h-48 md:h-64 relative overflow-hidden">
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hero: avatar, name, bio, socials */}
      <div className="flex flex-col items-center text-center px-4 -mt-14 relative z-10">
        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-muted overflow-hidden border-4 border-background shadow-lg`}>
          {p.profilePicture ? (
            <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img src={getDicebearAvatar(p.username || slug)} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>

        <h1 className="mt-3 text-xl font-bold text-foreground">@{p.username?.replace(/^@/, '')}</h1>

        {p.bio && <p className="mt-1 text-sm text-muted-foreground max-w-md">{p.bio}</p>}

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-3">
            {socialLinks.map((social: any) => {
              const Icon = getSocialIcon(social.platform)
              return (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-muted-foreground">
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="mx-auto w-full max-w-5xl px-4 mt-8 pb-12">
        {isProductPage ? (
          // Product page: just render children (product detail layout)
          children
        ) : (
          // Storefront: tabs with links/shop/posts
          <Tabs defaultValue="links" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="shop">Shop</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="links">
              <div className="space-y-3 max-w-2xl mx-auto">
                {activeLinks.map((link: any) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-start gap-3 border transition-colors cursor-pointer h-auto p-4 rounded-lg text-base border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground">
                    <img src={link.thumbnail} alt={link.title} className="w-5 h-5 object-contain"
                      onError={(e) => { e.currentTarget.src = '/images/pages/website.svg' }} />
                    <span className="font-medium">{link.title}</span>
                  </a>
                ))}
                {activeLinks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No links yet.</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shop">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingProducts ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : activeProducts.length > 0 ? (
                  activeProducts.map((product) => (
                    <Link key={product.id} href={`/${p.username}/product/${product.slug || product.id}`}
                      className="group block border rounded-xl p-4 border-border hover:shadow-md hover:border-primary/30 transition-all">
                      <div className="w-full aspect-square overflow-hidden rounded-lg bg-muted mb-3">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">{getProductTypeLabel(product.category)}</Badge>
                        <span className="font-bold text-sm text-foreground">{formatProductPrice(product.price, product.currency || 'NGN')}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No products yet.</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="space-y-3 max-w-2xl mx-auto">
                {posts.length > 0 ? (
                  posts.map((post: any) => (
                    <Link key={post.id} href={`/dashboard/posts/${post.id}`}
                      className="block rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50">
                      <p className="text-sm font-medium text-foreground line-clamp-3">{post.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(post.createdAt))} · {post.likeCount} likes · {post.commentCount} comments
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No posts yet.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Pasive. All rights reserved.</p>
        <div className="mt-1 flex items-center justify-center gap-1 opacity-60">
          <span>Made with</span>
          <a href="/" className="font-bold text-foreground hover:text-primary transition-colors">Pasive</a>
        </div>
      </footer>

      <MiniPageModal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} profileData={{ username: p.username }} />
    </div>
  );
}
