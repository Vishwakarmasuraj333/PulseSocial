/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable disk pack file caching in dev to prevent Webpack RangeError: Array buffer allocation failed on Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
