import type { MetadataRoute } from "next";

const SITE_URL = "https://leatheria.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Not present in the original robots.txt (which just allowed
      // everything), but these pages have no unique indexable content and
      // require an in-session cart/auth state — disallowing them is a
      // conservative SEO improvement, not a behavior change customers see.
      disallow: ["/cart", "/order_checkout", "/order_status", "/login", "/signUp"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
