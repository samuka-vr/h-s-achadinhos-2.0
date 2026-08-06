"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";
import { productSchema } from "@/schemas/product";
import { buildProductSlug, generatePublicCode } from "@/lib/public-code";
import type { ProductStatus } from "@/types/domain";

function formObject(formData: FormData) {
  return {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    price_text: formData.get("price_text"),
    external_url: formData.get("external_url"),
    affiliate_network: formData.get("affiliate_network"),
    category_id: formData.get("category_id"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    sort_order: formData.get("sort_order"),
    cover_url: formData.get("cover_url"),
    video_url: formData.get("video_url"),
  };
}

async function uniqueCode() {
  const supabase = await createSupabaseServerClient();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generatePublicCode();
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("public_code", code);
    if (!count) return code;
  }
  throw new Error("Não foi possível gerar um código único.");
}

function refreshProductPaths() {
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/studio");
  revalidatePath("/studio/produtos");
}

export async function saveProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const parsed = productSchema.safeParse(formObject(formData));
  const id = String(formData.get("id") ?? "");
  if (!parsed.success) {
    const path = id ? `/studio/produtos/${id}/editar` : "/studio/produtos/novo";
    redirect(`${path}?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { id: parsedId, ...input } = parsed.data;
  const nowPublished = input.status === "published" ? new Date().toISOString() : null;

  if (parsedId) {
    const { data: existing } = await supabase.from("products").select("public_code,published_at").eq("id", parsedId).single();
    const code = existing?.public_code as string;
    const { error } = await supabase.from("products").update({
      ...input,
      slug: buildProductSlug(input.name, code),
      published_at: input.status === "published" ? existing?.published_at ?? nowPublished : existing?.published_at,
      deleted_at: null,
    }).eq("id", parsedId);
    if (error) redirect(`/studio/produtos/${parsedId}/editar?erro=${encodeURIComponent(error.message)}`);
  } else {
    const code = await uniqueCode();
    const { error } = await supabase.from("products").insert({
      ...input,
      public_code: code,
      slug: buildProductSlug(input.name, code),
      published_at: nowPublished,
      deleted_at: null,
    });
    if (error) redirect(`/studio/produtos/novo?erro=${encodeURIComponent(error.message)}`);
  }

  refreshProductPaths();
  redirect("/studio/produtos?sucesso=salvo");
}

export async function setProductStatusAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "draft") as ProductStatus;
  if (!id || !["draft", "published", "archived"].includes(status)) return;
  const supabase = await createSupabaseServerClient();
  const payload: Record<string, unknown> = { status, deleted_at: null };
  if (status === "published") payload.published_at = new Date().toISOString();
  await supabase.from("products").update(payload).eq("id", id);
  refreshProductPaths();
}

export async function toggleProductFeaturedAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update({ featured: !featured }).eq("id", id);
  refreshProductPaths();
}

export async function duplicateProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: source, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !source) return;
  const code = await uniqueCode();
  const { data: created } = await supabase.from("products").insert({
    name: `${source.name} (cópia)`,
    public_code: code,
    slug: buildProductSlug(`${source.name} cópia`, code),
    short_description: source.short_description,
    description: source.description,
    price_text: source.price_text,
    external_url: source.external_url,
    affiliate_network: source.affiliate_network,
    category_id: source.category_id,
    status: "draft",
    featured: false,
    sort_order: source.sort_order,
    cover_url: source.cover_url,
    video_url: source.video_url,
    published_at: null,
  }).select("id").single();
  refreshProductPaths();
  if (created?.id) redirect(`/studio/produtos/${created.id}/editar?duplicado=1`);
}

export async function archiveProductAction(formData: FormData) {
  formData.set("status", "archived");
  await setProductStatusAction(formData);
}

function parseSelectedProductIds(formData: FormData) {
  const raw = String(formData.get("ids") ?? "");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return Array.from(new Set(raw.split(",").map((value) => value.trim()).filter((value) => uuidPattern.test(value)))).slice(0, 500);
}

export async function updateProductCoverAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const coverUrl = String(formData.get("cover_url") ?? "").trim();
  if (!id) return;
  if (coverUrl && !/^https?:\/\//i.test(coverUrl)) {
    redirect(`/studio/produtos?erro=${encodeURIComponent("A imagem precisa ter uma URL válida.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update({ cover_url: coverUrl || null }).eq("id", id);
  if (error) redirect(`/studio/produtos?erro=${encodeURIComponent(error.message)}`);

  refreshProductPaths();
  redirect("/studio/produtos?sucesso=imagem");
}

export async function bulkProductsAction(formData: FormData) {
  const action = String(formData.get("bulk_action") ?? "");
  const ids = parseSelectedProductIds(formData);
  if (!ids.length) redirect(`/studio/produtos?erro=${encodeURIComponent("Selecione pelo menos um produto.")}`);

  if (action === "delete") await requireRole(["owner", "admin"]);
  else await requireRole(["owner", "admin", "editor"]);

  const supabase = await createSupabaseServerClient();
  let error: { message: string } | null = null;

  if (["published", "draft", "archived"].includes(action)) {
    const payload: Record<string, unknown> = { status: action, deleted_at: null };
    if (action === "published") payload.published_at = new Date().toISOString();
    const result = await supabase.from("products").update(payload).in("id", ids);
    error = result.error;
  } else if (action === "feature" || action === "unfeature") {
    const result = await supabase.from("products").update({ featured: action === "feature" }).in("id", ids);
    error = result.error;
  } else if (action === "category") {
    const categoryId = String(formData.get("category_id") ?? "").trim();
    if (categoryId) {
      const { count } = await supabase.from("categories").select("id", { count: "exact", head: true }).eq("id", categoryId);
      if (!count) redirect(`/studio/produtos?erro=${encodeURIComponent("A categoria escolhida não existe.")}`);
    }
    const result = await supabase.from("products").update({ category_id: categoryId || null }).in("id", ids);
    error = result.error;
  } else if (action === "delete") {
    const result = await supabase.from("products").delete().in("id", ids);
    error = result.error;
  } else {
    redirect(`/studio/produtos?erro=${encodeURIComponent("Escolha uma ação em massa válida.")}`);
  }

  if (error) redirect(`/studio/produtos?erro=${encodeURIComponent(error.message)}`);
  refreshProductPaths();
  revalidatePath("/studio/categorias");
  redirect(`/studio/produtos?sucesso=lote&quantidade=${ids.length}`);
}
