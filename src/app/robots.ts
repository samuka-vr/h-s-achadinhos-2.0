import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/server/queries/public";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const enabled = process.env.SITE_INDEXING_ENABLED === "true" && settings.indexing_enabled;
  return enabled ? { rules: { userAgent: "*", allow: "/", disallow: ["/studio/", "/api/"] }, sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` } : { rules: { userAgent: "*", disallow: "/" } };
}
