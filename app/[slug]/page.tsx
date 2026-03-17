"use client";
import React, { useState, useEffect } from 'react';
import BioPagePreview from '@/app/common/dashboard/BioPagePreview';
import { getUserProfileByUsername } from '@/services/userProfilesService';

export default function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileOwnerId, setProfileOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const slug = resolvedParams.slug;
      
      console.log('Slug:', slug);
      
      setSlug(slug);

      // Check if the slug indicates a product route
      if (slug?.startsWith('product/')) {
        const productId = slug.split('/')[1];
        // Render the ProductPage component directly if it's a product route
        // This assumes ProductPage is designed to handle a productId prop or fetch data internally
        // For simplicity, we'll just redirect here, but a more integrated solution would involve conditional rendering
        window.location.href = `/product/${productId}`;
        return;
      }

      try {
        console.log('Searching for username:', slug);
        const firebaseProfile = await getUserProfileByUsername(slug);

        if (firebaseProfile) {
          console.log('Found profile:', firebaseProfile);
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
          setError(null);
        } else {
          console.log('No profile found for username:', slug);
          setProfileData(null);
          setProfileOwnerId(null);
          setError('Profile not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData(null);
        setProfileOwnerId(null);
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
        <BioPagePreview profileData={profileData} links={links} profileOwnerId={profileOwnerId ?? undefined} />
      </div>
    </div>
  );
}
