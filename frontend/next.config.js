/** @type {import('next').NextConfig} */
const backendProxy =
  process.env.BACKEND_PROXY_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8080'

const s3Host = process.env.NEXT_PUBLIC_S3_HOST || 'rentify-uploads.s3.amazonaws.com'

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/uploads/**' },
      { protocol: 'https', hostname: s3Host.replace(/^https?:\/\//, '').split('/')[0], pathname: '/**' },
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
