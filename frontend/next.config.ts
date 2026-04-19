import type { NextConfig } from 'next'

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:5237'

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  allowedDevOrigins: ['192.168.68.71', '192.168.68.74'],
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
  /* config options here */
}

export default nextConfig
