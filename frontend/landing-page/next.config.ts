import type { NextConfig } from "next";

const PRODUCTION_BACKEND_URL = "https://ecovision-intelligence-platform-backend.onrender.com";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  env: {
    VITE_API_URL:
      process.env.VITE_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      PRODUCTION_BACKEND_URL,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.VITE_API_URL ||
      PRODUCTION_BACKEND_URL,
    NEXT_PUBLIC_CITIZEN_URL: process.env.NEXT_PUBLIC_CITIZEN_URL || "/citizen",
    NEXT_PUBLIC_MUNICIPAL_URL: process.env.NEXT_PUBLIC_MUNICIPAL_URL || "/dashboard",
  },
  async rewrites() {
    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.VITE_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      PRODUCTION_BACKEND_URL
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/health",
        destination: `${backendUrl}/health`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendUrl}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendUrl}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
