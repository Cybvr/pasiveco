"use client";
import React, { useState, useEffect } from 'react';
import BioPagePreview from '@/app/common/dashboard/BioPagePreview';
import { getSocialPosts, getSocialProfileByUsername } from '@/lib/social-data';
import { getUserProfileByUsername } from '@/services/userProfilesService';

export default function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileOwnerId, setProfileOwnerId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const slug = resolvedParams.slug;
      
      setSlug(slug);

      if (slug?.startsWith('product/')) {
        const productId = slug.split('/')[1];
        window.location.href = `/product/${productId}`;
        return;
      }

      try {
        const [firebaseProfile, socialProfile, socialPosts] = await Promise.all([
          getUserProfileByUsername(slug),
          getSocialProfileByUsername(slug),
          getSocialPosts(),
        ]);

        if (firebaseProfile) {
          setProfileData({
            username: firebaseProfile.username,
            displayName: firebaseProfile.displayName,
            bio: firebaseProfile.bio,
            profilePicture: firebaseProfile.profilePicture,
            bannerImage: firebaseProfile.bannerImage,
            links: firebaseProfile.links || [],
            socialLinks: firebaseProfile.socialLinks || [],
            appearance: firebaseProfile.appearance
          });
          setProfileOwnerId(firebaseProfile.userId);
          setPosts(socialProfile ? socialPosts.filter((post) => post.authorId === socialProfile.id) : []);
          setError(null);
          return;
        }

        if (socialProfile) {
          setProfileData({
            username: socialProfile.username,
            displayName: socialProfile.name,
            bio: socialProfile.bio,
            profilePicture: socialProfile.image,
            bannerImage: null,
            links: socialProfile.links || [],
            socialLinks: [],
            appearance: undefined,
          });
          setProfileOwnerId(socialProfile.id);
          setPosts(socialPosts.filter((post) => post.authorId === socialProfile.id));
          setError(null);
          return;
        }

        setProfileData(null);
        setProfileOwnerId(null);
        setPosts([]);
        setError('Profile not found');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData(null);
        setProfileOwnerId(null);
        setPosts([]);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  const links = profileData?.links || [];

  if (loading) {
    return (
      <div className="min-h-screen p-2 bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-2 bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen p-2 bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 bg-background">
      <div className="max-w-md mx-auto">
        <BioPagePreview profileData={profileData} links={links} profileOwnerId={profileOwnerId ?? undefined} posts={posts} />
      </div>
    </div>
  );
}
