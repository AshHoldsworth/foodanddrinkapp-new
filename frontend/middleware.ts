import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // In development mode, mock the Authentik header if not present
  if (process.env.NODE_ENV === 'development') {
    const response = NextResponse.next()

    if (!request.headers.has('x-authentik-username')) {
      const devUsername = process.env.NEXT_PUBLIC_DEV_USERNAME ?? 'admin'
      response.headers.set('x-authentik-username', devUsername)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
