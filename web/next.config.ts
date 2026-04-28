import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edencom/character-slug'],
  images: {
    remotePatterns: [{ hostname: 'images.evetech.net' }],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'edencom.link' }],
        destination: 'https://edencom.social/:path*',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default nextConfig
