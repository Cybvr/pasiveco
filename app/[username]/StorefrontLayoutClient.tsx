"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu, Share2, MessageSquare } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getUserByUsername } from '@/services/userService';
import { getSocialProfileByUsername } from '@/lib/social-data';
import { getDicebearAvatar } from '@/lib/avatar';
import { getSocialIcon } from '@/lib/socialIcons';
import MiniPageModal from '@/app/common/dashboard/MiniPageModal';
import ShareModal from '@/app/common/dashboard/ShareModal';
import GiftCreatorModal from '@/components/common/GiftCreatorModal';
import { useAuth } from '@/hooks/useAuth';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PixelTracker from '@/components/common/PixelTracker';
import { CartProvider, useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ShoppingCart } from 'lucide-react';

export default function StorefrontLayoutClient({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isProductPage = pathname.includes('/product/');
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'gift_success') {
      toast.success("Gift sent successfully! You're awesome! 🎁");
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (status === 'gift_error') {
      toast.error("There was an error sending your gift. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [firebaseProfile, socialProfile] = await Promise.all([
          getUserByUsername(username),
          getSocialProfileByUsername(username),
        ]);
        if (firebaseProfile) {
          setProfileData(firebaseProfile);
        } else if (socialProfile) {
          setProfileData({ ...socialProfile, displayName: socialProfile.name, profilePicture: socialProfile.image });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const p = profileData || { username: username };
  const socialLinks = [...(p.socialLinks || [])].filter((l: any) => l.active);

  // Add contact methods if available to social links for UI
  if (p.email && !socialLinks.some((l: any) => l.platform === 'email')) {
    socialLinks.push({ id: 'contact-email', platform: 'email', url: `mailto:${p.email}`, active: true });
  }
  if (p.phoneNumber && !socialLinks.some((l: any) => l.platform === 'whatsapp')) {
    socialLinks.push({ id: 'contact-whatsapp', platform: 'whatsapp', url: `https://wa.me/${p.phoneNumber.replace(/\D/g, '')}`, active: true });
  }

  const coverImage = p.bannerImage || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(p.username || username)}&size=1200&backgroundType=gradientLinear`;
  const isOwnUser = Boolean(user?.uid) && [p.userId, p.id].includes(user?.uid || '');

  const tabs = [
    { label: 'Links', href: `/${username}` },
    { label: 'Shop', href: `/${username}/shop` },
    { label: 'Posts', href: `/${username}/posts` },
    { label: 'Bookings', href: `/${username}/bookings` },
    ...(isOwnUser ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ];

  const activeTab = tabs.find(t =>
    t.href === `/${username}` ? pathname === `/${username}` : pathname.startsWith(t.href)
  );

  const handleMessageClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    router.push(`/dashboard/messages?user=${p.userId || p.id}`);
  };

  return (
    <CartProvider>
      <StorefrontContent 
        username={username} 
        p={p} 
        socialLinks={socialLinks} 
        tabs={tabs} 
        activeTab={activeTab}
        isOwnUser={isOwnUser}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isPageModalOpen={isPageModalOpen}
        setIsPageModalOpen={setIsPageModalOpen}
        isShareModalOpen={isShareModalOpen}
        setIsShareModalOpen={setIsShareModalOpen}
        isGiftModalOpen={isGiftModalOpen}
        setIsGiftModalOpen={setIsGiftModalOpen}
        handleMessageClick={handleMessageClick}
        pathname={pathname}
        coverImage={coverImage}
      >
        {children}
      </StorefrontContent>
    </CartProvider>
  );
}

function StorefrontContent({ 
  username, p, socialLinks, tabs, activeTab, isOwnUser, 
  isCartOpen, setIsCartOpen, isPageModalOpen, setIsPageModalOpen,
  isShareModalOpen, setIsShareModalOpen, isGiftModalOpen, setIsGiftModalOpen,
  handleMessageClick, pathname, coverImage, children 
}: any) {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <PixelTracker integrations={p?.integrations} />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 pointer-events-none">
        <button onClick={() => setIsPageModalOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors pointer-events-auto">
          <Menu className="w-4 h-4 text-white drop-shadow-md" />
        </button>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2 rounded-lg bg-background/20 backdrop-blur-md hover:bg-background/40 transition-colors pointer-events-auto"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-lg bg-background/20 backdrop-blur-md hover:bg-background/40 transition-colors pointer-events-auto">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="w-full h-32 sm:h-36 md:h-44 relative overflow-hidden">
        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
      </div>

      {/* Avatar + name + bio + social icons */}
      <div className="flex flex-col items-center text-center px-4 -mt-10 md:-mt-12 relative z-10">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted overflow-hidden border-4 border-background shadow-lg">
          {p.profilePicture ? (
            <img src={p.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img src={getDicebearAvatar(p.username || username)} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-1">
            @{p.username?.replace(/^@/, '')}
            {p.isVerified && <VerifiedBadge size="md" title="Verified Creator" />}
          </h1>
          {!isOwnUser && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent flex items-center gap-1.5"
                onClick={() => setIsGiftModalOpen(true)}
              >
                <span aria-hidden="true" className="inline-flex items-center justify-center text-sm leading-none">❤️</span>
                <span className="text-xs font-medium">Gift</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={handleMessageClick}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {p.bio && <p className="mt-1 text-sm text-muted-foreground max-w-md">{p.bio}</p>}

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-4">
            {socialLinks.map((social: any) => {
              const Icon = getSocialIcon(social.platform);
              return (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted hover:text-primary transition-all text-muted-foreground flex items-center justify-center"
                  title={social.platform}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex justify-center mt-6">
        <nav className="flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab?.href === tab.href
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Page content */}
      <div className="mx-auto w-full max-w-5xl px-4 mt-8 pb-12">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 Pasive. All rights reserved.</p>
        <div className="mt-1 flex items-center justify-center gap-1 opacity-60">
          <span>Made with</span>
          <a href="/" className="font-chunko text-foreground hover:text-primary transition-colors text-sm translate-y-[1px]">PASIVE</a>
        </div>
      </footer>

      <MiniPageModal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} profileData={{ username: p.username }} />
      <GiftCreatorModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        creatorId={p.userId || p.id}
        creatorName={p.username}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} username={username} />
    </div>
  );
}
