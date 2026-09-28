import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GENES } from "@/lib/genes";
import { PATHWAYS } from "@/lib/atlas";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(GENES).map((symbol) => ({
      url: `${SITE_URL}/gene/${symbol}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...Object.keys(PATHWAYS).map((id) => ({
      url: `${SITE_URL}/pathway/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
