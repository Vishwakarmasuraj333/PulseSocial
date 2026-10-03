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
      // Use memory caching in dev on Windows to prevent disk pack buffer errors while keeping recompilation fast
      config.cache = {
        type: "memory",
      };
      if (config.output) {
        config.output.chunkLoadTimeout = 300000;
      }
    }
    return config;
  },
};

export default nextConfig;
