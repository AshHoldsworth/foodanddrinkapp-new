import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // In development mode, mock the Authentik header if not present
  if (process.env.NODE_ENV === 'development') {
    // Clone the request headers and add the dev username if missing
    const requestHeaders = new Headers(request.headers)

    if (!requestHeaders.has('x-authentik-username')) {
      const devUsername = process.env.NEXT_PUBLIC_DEV_USERNAME ?? 'admin'
      requestHeaders.set('x-authentik-username', devUsername)
    }

    // Create a response with the modified request headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

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
