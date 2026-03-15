
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Check if the request is for dashboard or admin routes
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('session')?.value
    
    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
