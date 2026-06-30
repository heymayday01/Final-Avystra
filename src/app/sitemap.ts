import type { MetadataRoute } from "next";

/**
 * Sitemap — tells search engines which pages to index.
 * Since this is a single-page site, we only have one URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://avystra.co.in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
