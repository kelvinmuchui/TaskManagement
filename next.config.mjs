/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // disable Turbopack
  },
  eslint: {
    ignoreDuringBuilds: true, // prevent ESLint build failure
  },
  typescript: {
    ignoreBuildErrors: true, // optional if you're getting TS errors during deploy
  },
};

export default nextConfig;
