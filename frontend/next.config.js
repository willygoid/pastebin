/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  poweredByHeader: false,
  compress: true,
  
  // Allow images from any domain for paste content
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // Prevent bundling Node's `fs` module into the client bundle for syntax highlighter
  turbopack: {
    resolveAlias: {
      fs: {
        browser: './empty.ts',
      },
    },
  },
}

module.exports = nextConfig
