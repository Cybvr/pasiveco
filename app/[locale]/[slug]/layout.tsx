import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getUserByUsername } from '@/services/userService'
import StorefrontLayoutClient from './StorefrontLayoutClient'

interface SlugLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const slug = resolvedParams.slug
    const profile = await getUserByUsername(slug)

    if (profile) {
      const title = `${profile.displayName} (@${profile.username}) | Pasive`
      const description = profile.bio ? profile.bio.substring(0, 160) : `View ${profile.displayName}'s profile on Pasive`
      return {
        title,
        description,
        openGraph: {
          title, description,
          url: `https://pasive.co/${slug}`,
          siteName: 'Pasive',
          images: profile.profilePicture ? [{ url: profile.profilePicture, width: 400, height: 400, alt: `${profile.displayName}'s profile picture` }] : [],
          type: 'profile',
        },
        twitter: { card: 'summary', title, description, images: profile.profilePicture ? [profile.profilePicture] : [] },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  return { title: 'Profile | Pasive', description: 'View profile on Pasive' }
}

export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const isProductPage = pathname.includes('/product/')

  return (
    <StorefrontLayoutClient slug={slug} isProductPage={isProductPage}>
      {children}
    </StorefrontLayoutClient>
  )
}
