import type { MetadataRoute } from "next";
import { fetchAllProducts } from "@/lib/firebase/products";
import { CATEGORIES } from "@/models/types";

const SITE_URL = "https://leatheria.web.app";

// Dynamic — regenerated from the live OurProducts collection on every
// crawl, unlike the original static web/sitemap.xml, which listed only the
// homepage/category pages and had no product URLs at all. See
// MIGRATION_PLAN.md Phase 9.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllProducts();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/productsList/${encodeURIComponent(c.id)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/about_us`, changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries];
}
