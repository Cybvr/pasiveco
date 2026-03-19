
import { Metadata } from 'next'
import Watermark from '@/app/common/dashboard/Watermark'
import { getUserByUsername } from '@/services/userService'

interface SlugLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const slug = resolvedParams.slug
    
    // Try to get the user profile
    const profile = await getUserByUsername(slug)
    
    if (profile) {
      const title = `${profile.displayName} (@${profile.username}) | Pasive`
      const description = profile.bio ? profile.bio.substring(0, 160) : `View ${profile.displayName}'s profile on Pasive`
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://pasive.co/${slug}`,
          siteName: 'Pasive',
          images: profile.profilePicture ? [
            {
              url: profile.profilePicture,
              width: 400,
              height: 400,
              alt: `${profile.displayName}'s profile picture`,
            }
          ] : [],
          type: 'profile',
        },
        twitter: {
          card: 'summary',
          title,
          description,
          images: profile.profilePicture ? [profile.profilePicture] : [],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Profile | Pasive',
    description: 'View profile on Pasive'
  }
}

export default function SlugLayout({ children }: SlugLayoutProps) {
  return (
    <>
      {children}
      <Watermark />
    </>
  )
}
