/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'media.licdn.com'],
  },
}

module.exports = nextConfig