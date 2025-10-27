/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
   eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {},
  },
};

export default nextConfig;

