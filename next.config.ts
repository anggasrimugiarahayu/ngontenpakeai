import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/ruang-growing",
        destination: "/ruang-automation",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/kebijakan-privasi",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/kebijakan-privasi",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/syarat-ketentuan",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/syarat-ketentuan",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
