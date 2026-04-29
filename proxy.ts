import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPlatformHostname, normalizeCustomDomain } from '@/lib/custom-domains'

const firestoreProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
const firestoreApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

function getFirestoreValue(field: any): string | null {
  if (!field) return null
  if (typeof field.stringValue === 'string') return field.stringValue
  return null
}

async function resolveCustomDomain(hostname: string) {
  if (!firestoreProjectId || !firestoreApiKey) return null

  try {
    const domain = normalizeCustomDomain(hostname)
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${firestoreProjectId}/databases/(default)/documents/customDomains/${encodeURIComponent(domain)}`
    )
    url.searchParams.set('key', firestoreApiKey)

    const response = await fetch(
      url,
      { cache: 'no-store' }
    )

    if (!response.ok) return null

    const data = await response.json()
    const fields = data?.fields || {}
    const status = getFirestoreValue(fields.status)
    const username = getFirestoreValue(fields.username)

    if (status !== 'active' || !username) return null
    return username
  } catch (error) {
    console.error('Unable to resolve custom domain:', error)
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host')?.split(':')[0] || ''
  const isAssetRequest =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/font') ||
    pathname.startsWith('/videos') ||
    pathname === '/favicon.ico'

  if (isAssetRequest) {
    return NextResponse.next()
  }

  if (hostname && !isPlatformHostname(hostname)) {
    const username = await resolveCustomDomain(hostname)

    if (username) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = pathname === '/' ? `/${username}` : `/${username}${pathname}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  const localeMatch = pathname.match(/^\/(en|fr)(\/.*)?$/)
  if (localeMatch) {
    const nextPath = localeMatch[2] || '/'
    return NextResponse.redirect(new URL(nextPath, request.url))
  }

  if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
    const sessionToken = request.cookies.get('session')?.value

    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|font|videos|favicon.ico).*)'
  ]
}
