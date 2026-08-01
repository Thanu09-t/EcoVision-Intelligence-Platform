/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_CITIZEN_URL: process.env.NEXT_PUBLIC_CITIZEN_URL || 'http://localhost:3001',
    NEXT_PUBLIC_MUNICIPAL_URL: process.env.NEXT_PUBLIC_MUNICIPAL_URL || 'http://localhost:3002',
  },
}

module.exports = nextConfig
