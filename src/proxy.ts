import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * Fast gate for /admin: no session cookie → straight to /admin/login.
 * This only checks that the cookie exists; the dashboard page and every admin
 * action verify the session against the database (see src/lib/admin.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLogin = pathname === '/admin/login'

  let res: NextResponse
  if (!isLogin && !getSessionCookie(request)) {
    const url = new URL('/admin/login', request.url)
    if (pathname !== '/admin') url.searchParams.set('next', pathname + search)
    res = NextResponse.redirect(url)
  } else {
    res = NextResponse.next()
  }

  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
