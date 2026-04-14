import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.68.71'],
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:5237/:path*',
      },
    ]
  },
  /* config options here */
}

export default nextConfig
