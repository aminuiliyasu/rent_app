/** @type {import('next').NextConfig} */
const backendProxy =
  process.env.BACKEND_PROXY_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8080'

const nextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_API_URL is optional (.env.local). If unset, the client uses /api/v1 + rewrites (no CORS issues).
  images: {
    domains: ['localhost', '127.0.0.1', 'rentify-uploads.s3.amazonaws.com'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'rentify-uploads.s3.amazonaws.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    const backend = backendProxy.replace(/\/$/, '')
    return [
      {
        source: '/uploads/:path*',
        destination: `${backend}/uploads/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
