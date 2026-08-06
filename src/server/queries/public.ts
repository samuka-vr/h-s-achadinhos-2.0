import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Product, SiteSettings } from "@/types/domain";

const defaultSettings: SiteSettings = {
  id: 1,
  brand_name: "H&S Achadinhos",
  tagline: "Descobertas que valem a pena.",
  description: "Curadoria de produtos encontrados nas redes sociais.",
  logo_url: null,
  social_links: {},
  homepage: {},
  theme: {},
  indexing_enabled: false,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return defaultSettings;
    return data as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name");
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

const productSelect = "*, category:categories(id,name,slug)";

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select(productSelect)
      .eq("status", "published")
      .is("deleted_at", null)
      .eq("featured", true)
      .order("sort_order")
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as Product[];
  } catch {
    return [];
  }
}

export async function getLatestProducts(limit = 24): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select(productSelect)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  return (data as unknown as Product | null) ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Category | null) ?? null;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(productSelect)
    .eq("category_id", categoryId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order")
    .order("published_at", { ascending: false });
  return (data ?? []) as unknown as Product[];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const term = query.trim();
  if (!term) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("search_products", { search_term: term, result_limit: 40 });
  if (error) return [];
  return (data ?? []) as Product[];
}
