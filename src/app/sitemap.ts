import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = "2026-10-02";

  return [
    {
      url: "https://payhumans.ai",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://payhumans.ai/earn",
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://payhumans.ai/docs",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
