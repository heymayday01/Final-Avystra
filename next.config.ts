import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],
  async rewrites() {
    return [
      {
        source: "/ogi-submissions.xlsx",
        destination: "/api/ogi/export",
      },
    ];
  },
};

export default nextConfig;
