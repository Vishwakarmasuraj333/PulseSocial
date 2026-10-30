/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/signup",
        permanent: true,
      },
      {
        source: "/webinars",
        destination: "/signup",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/auth/google",
        destination: "/google",
      },
    ];
  },
};

export default nextConfig;
