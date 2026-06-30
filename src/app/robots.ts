import type { MetadataRoute } from "next";

/**
 * Dynamic robots.txt — allows all crawlers to index the site.
 * The API routes (/api/*) are disallowed since they're not for crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: "https://avystra.co.in/sitemap.xml",
  };
}
