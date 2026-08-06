"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildProductSlug, generatePublicCode } from "@/lib/public-code";
import { normalizeCategoryKey, parseStructuredProducts } from "@/lib/import-products";
import { slugify } from "@/lib/slug";
import type { ProductStatus } from "@/types/domain";

async function generateUniqueCode(existingCodes: Set<string>) {
  const supabase = await createSupabaseServerClient();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generatePublicCode();
    if (existingCodes.has(code)) continue;
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("public_code", code);
    if (!count) {
      existingCodes.add(code);
      return code;
    }
  }
  throw new Error("Não foi possível gerar um código único para o produto.");
}

export async function importProductsAction(formData: FormData) {
  const viewer = await requireRole(["owner", "admin", "editor"]);
  const raw = String(formData.get("raw") ?? "");
  const status: ProductStatus = formData.get("status") === "draft" ? "draft" : "published";
  const createCategories = formData.get("create_categories") === "on";
  const skipDuplicates = formData.get("skip_duplicates") === "on";
  const parsed = parseStructuredProducts(raw);

  if (!parsed.items.length) {
    const message = parsed.errors[0]?.message ?? "Nenhum produto válido foi reconhecido.";
    redirect(`/studio/importacao?erro=${encodeURIComponent(message)}`);
  }
  if (parsed.items.length > 200) {
    redirect(`/studio/importacao?erro=${encodeURIComponent("Importe no máximo 200 produtos por vez.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({
      created_by: viewer.user.id,
      source: "texto_estruturado",
      item_count: parsed.items.length,
      status: "running",
    })
    .select("id")
    .single();

  if (jobError || !job) redirect(`/studio/importacao?erro=${encodeURIComponent(jobError?.message ?? "Não foi possível iniciar a importação.")}`);

  let successUrl = "/studio/importacao";

  try {
    const { data: categoryRows, error: categoryError } = await supabase
      .from("categories")
      .select("id,name,slug")
      .order("name");
    if (categoryError) throw categoryError;

    const categories = new Map<string, { id: string; name: string; slug: string }>();
    const usedSlugs = new Set<string>();
    for (const category of categoryRows ?? []) {
      categories.set(normalizeCategoryKey(category.name), category);
      usedSlugs.add(category.slug);
    }

    const requestedCategoryNames = Array.from(
      new Map(
        parsed.items
          .filter((item) => item.categoryName)
          .map((item) => [normalizeCategoryKey(item.categoryName), item.categoryName]),
      ).entries(),
    );

    let createdCategories = 0;
    if (createCategories) {
      for (const [key, name] of requestedCategoryNames) {
        if (categories.has(key)) continue;
        const baseSlug = slugify(name);
        let slug = baseSlug;
        let suffix = 2;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        const { data: created, error } = await supabase
          .from("categories")
          .insert({ name, slug, description: `Produtos importados da categoria ${name}.`, active: true, sort_order: categories.size })
          .select("id,name,slug")
          .single();
        if (error || !created) throw error ?? new Error("Não foi possível criar a categoria.");
        categories.set(key, created);
        usedSlugs.add(created.slug);
        createdCategories += 1;
      }
    }

    const urls = Array.from(new Set(parsed.items.map((item) => item.externalUrl)));
    const { data: duplicateRows, error: duplicateError } = await supabase
      .from("products")
      .select("external_url")
      .in("external_url", urls);
    if (duplicateError) throw duplicateError;
    const duplicateUrls = new Set((duplicateRows ?? []).map((row) => row.external_url));

    const seenInBatch = new Set<string>();
    const existingCodes = new Set<string>();
    const payload = [];
    let skippedDuplicates = 0;
    let skippedMissingCategory = 0;

    for (const item of parsed.items) {
      if (skipDuplicates && (duplicateUrls.has(item.externalUrl) || seenInBatch.has(item.externalUrl))) {
        skippedDuplicates += 1;
        continue;
      }
      seenInBatch.add(item.externalUrl);

      const category = item.categoryName ? categories.get(normalizeCategoryKey(item.categoryName)) : undefined;
      if (item.categoryName && !category && !createCategories) skippedMissingCategory += 1;

      const code = await generateUniqueCode(existingCodes);
      payload.push({
        public_code: code,
        slug: buildProductSlug(item.name, code),
        name: item.name,
        short_description: item.description.slice(0, 280),
        description: item.description,
        price_text: item.priceText,
        external_url: item.externalUrl,
        affiliate_network: item.affiliateNetwork,
        category_id: category?.id ?? null,
        status,
        featured: false,
        sort_order: 0,
        cover_url: null,
        video_url: null,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
    }

    if (payload.length) {
      const { error: insertError } = await supabase.from("products").insert(payload);
      if (insertError) throw insertError;
    }

    await supabase
      .from("import_jobs")
      .update({ status: "completed", finished_at: new Date().toISOString() })
      .eq("id", job.id);

    revalidatePath("/");
    revalidatePath("/produtos");
    revalidatePath("/studio");
    revalidatePath("/studio/produtos");
    revalidatePath("/studio/categorias");
    revalidatePath("/studio/importacao");

    const query = new URLSearchParams({
      importados: String(payload.length),
      duplicados: String(skippedDuplicates),
      categorias: String(createdCategories),
      invalidos: String(parsed.errors.length),
      semCategoria: String(skippedMissingCategory),
    });
    successUrl = `/studio/importacao?${query.toString()}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada durante a importação.";
    await supabase
      .from("import_jobs")
      .update({ status: "failed", error_message: message, finished_at: new Date().toISOString() })
      .eq("id", job.id);
    redirect(`/studio/importacao?erro=${encodeURIComponent(message)}`);
  }

  redirect(successUrl);
}
