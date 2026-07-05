/** @type {import('next').NextConfig} */
const backendProxy =
  process.env.BACKEND_PROXY_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8080'

const s3Host = process.env.NEXT_PUBLIC_S3_HOST || 'rentify-uploads.s3.amazonaws.com'
const s3Hostname = s3Host.replace(/^https?:\/\//, '').split('/')[0]

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/uploads/**' },
      { protocol: 'https', hostname: s3Hostname, pathname: '/**' },
      { protocol: 'https', hostname: 'rentify-uploads.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.s3.us-east-1.amazonaws.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'rhentify-prod-uploads-267796055482.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
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
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/logo/rhentify-icon.png',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
