import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
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
