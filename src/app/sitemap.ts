import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITE.reviewed;
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "weekly") => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  return [
    page("", 1),
    page("/docs", 0.9),
    page("/earn", 0.8),
    page("/llms.txt", 0.6),
    page("/llms-full.txt", 0.6),
    page("/agent-guide.json", 0.5),
  ];
}
