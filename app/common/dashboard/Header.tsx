import React, { useState, useEffect } from 'react';
import UserMenu from '@/app/common/dashboard/user-menu';
import ShareModal from './ShareModal';
import Image from 'next/image';
import { Crown, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/services/userProfilesService';

const Header: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-2 py-2 border-b border-border backdrop-blur-sm bg-background/10">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image src="/images/monster.png" alt="Monster" width={32} height={32} />
          <h1 className="text-xl text-muted-foreground font-semibold hidden md:inline">pasive</h1>
        </Link>
        <div className="flex items-center justify-end space-x-1">
          {userProfile?.username && (
            <Link
              href={`/${userProfile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="View your public profile"
            >
              <ExternalLink className="text-muted-foreground w-4 h-4" />
            </Link>
          )}
          <Link
            href="/pricing"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Crown className="text-muted-foreground w-4 h-4" />
          </Link>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Share2 className="text-muted-foreground w-4 h-4" />
          </button>
          <UserMenu />
        </div>
      </header>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};

export default Header;
