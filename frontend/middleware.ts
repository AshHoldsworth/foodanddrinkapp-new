import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, JWTPayload } from 'jose'

const AUTH_COOKIE = 'fd_auth_token'
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me-32chars!'

const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const payload = token ? await verifyToken(token) : null
  const isAuthenticated = Boolean(payload)
  const isAdmin = payload?.role === 'admin'
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/meal', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/meal', request.url))
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/meal/:path*', '/drinks/:path*', '/ingredients/:path*', '/account/:path*', '/admin/:path*'],
}
