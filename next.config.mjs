/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevents the client-side Router Cache from briefly showing a
  // previously-cached (possibly different user's) page when navigating to
  // a dynamic route — e.g. logging in as a new user right after someone
  // else was signed in. Without this, Next.js can show stale RSC content
  // for a moment before revalidating.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
  ],
}

export default nextConfig
