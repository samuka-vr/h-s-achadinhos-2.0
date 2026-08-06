import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fixed: MetadataRoute.Sitemap = ["", "/produtos", "/categorias", "/sobre", "/privacidade", "/termos"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" }));
  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("slug,updated_at").eq("status", "published").is("deleted_at", null),
      supabase.from("categories").select("slug,updated_at").eq("active", true),
    ]);
    return [...fixed, ...(products ?? []).map((p) => ({ url: `${base}/produtos/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "daily" as const })), ...(categories ?? []).map((c) => ({ url: `${base}/categorias/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const }))];
  } catch { return fixed; }
}
