"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Share2 } from "lucide-react";
import { getUserByUsername } from '@/services/userService';
import { getSocialProfileByUsername } from '@/lib/social-data';
import { getDicebearAvatar } from '@/lib/avatar';
import { getSocialIcon } from '@/lib/socialIcons';
import MiniPageModal from '@/app/common/dashboard/MiniPageModal';
import ShareModal from '@/app/common/dashboard/ShareModal';
import { useAuth } from '@/hooks/useAuth';

export default function StorefrontLayoutClient({ slug, children }: { slug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductPage = pathname.includes('/product/');
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [firebaseProfile, socialProfile] = await Promise.all([
          getUserByUsername(slug),
          getSocialProfileByUsername(slug),
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const p = profileData || { username: slug };
  const socialLinks = (p.socialLinks || []).filter((l: any) => l.active);
  const coverImage = p.bannerImage || `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(p.username || slug)}&size=1200&backgroundType=gradientLinear`;
  const isOwnUser = Boolean(user?.uid) && [p.userId, p.id].includes(user.uid);

  const tabs = [
    { label: 'Links', href: `/${slug}` },
    { label: 'Shop', href: `/${slug}/shop` },
    { label: 'Posts', href: `/${slug}/posts` },
    ...(isOwnUser ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ];

  // Active tab: exact match for Links, startsWith for others
  const activeTab = tabs.find(t =>
    t.href === `/${slug}` ? pathname === `/${slug}` : pathname.startsWith(t.href)
  );

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
            <img src={getDicebearAvatar(p.username || slug)} alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>

        <h1 className="mt-3 text-xl font-bold text-foreground">@{p.username?.replace(/^@/, '')}</h1>
        {p.bio && <p className="mt-1 text-sm text-muted-foreground max-w-md">{p.bio}</p>}

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-3">
            {socialLinks.map((social: any) => {
              const Icon = getSocialIcon(social.platform);
              return (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-muted-foreground">
                  <Icon size={20} />
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
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab?.href === tab.href
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
          <a href="/" className="font-bold text-foreground hover:text-primary transition-colors">Pasive</a>
        </div>
      </footer>

      <MiniPageModal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} profileData={{ username: p.username }} />
    </div>
  );
}
