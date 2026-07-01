import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "*.z.ai"],
  // Redirect /ogi-submissions.xlsx to the API endpoint which generates
  // the file on-demand. This ensures the download always works even if
  // the static file hasn't been generated yet (e.g. fresh server start
  // with no submissions).
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
