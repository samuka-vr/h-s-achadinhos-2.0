import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Banner, Category, ImportJob, Product, SiteSettings, StudioUser, UserRole } from "@/types/domain";

export async function listStudioProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id,name,slug)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Product[];
}

export async function getStudioProduct(id: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return (data as Product | null) ?? null;
}

export async function listStudioCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
  if (error) throw error;
  return data as Category[];
}

export async function getStudioSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function listUsers(): Promise<StudioUser[]> {
  const [supabase, admin] = await Promise.all([createSupabaseServerClient(), Promise.resolve(createSupabaseAdminClient())]);
  const [{ data: roles, error }, authResult] = await Promise.all([
    supabase.from("user_roles").select("user_id,role,created_at").order("created_at"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (error) throw error;
  if (authResult.error) throw authResult.error;
  const roleMap = new Map((roles ?? []).map((item) => [item.user_id, item]));
  return authResult.data.users.map((user) => ({ user_id: user.id, email: user.email ?? "—", role: (roleMap.get(user.id)?.role as UserRole | undefined) ?? null, created_at: user.created_at }));
}

export async function getAnalytics(days = 30) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("analytics_summary", { p_days: days });
  if (error) throw error;
  return data as {
    sessions: number;
    page_views: number;
    outbound_clicks: number;
    top_products: Array<{ name: string; public_code: string; clicks: number }>;
    daily: Array<{ day: string; sessions: number; page_views: number; outbound_clicks: number }>;
  };
}

export async function listImportJobs(limit = 12): Promise<ImportJob[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("import_jobs")
    .select("id,source,status,item_count,error_message,created_at,finished_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ImportJob[];
}

export async function listStudioBanners(): Promise<Banner[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("banners").select("*").order("sort_order").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Banner[];
}
