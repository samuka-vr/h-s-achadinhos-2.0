"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categorySchema } from "@/schemas/category";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";
import { suggestProductCategory } from "@/lib/category-intelligence";

export async function saveCategoryAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    active: formData.get("active") === "on",
    sort_order: formData.get("sort_order"),
  });
  if (!parsed.success) redirect(`/studio/categorias?erro=${encodeURIComponent("Dados inválidos.")}`);
  const supabase = await createSupabaseServerClient();
  const { id, ...input } = parsed.data;
  const payload = { ...input, slug: slugify(input.name) };
  const query = id
    ? supabase.from("categories").update(payload).eq("id", id)
    : supabase.from("categories").insert(payload);
  const { error } = await query;
  if (error) redirect(`/studio/categorias?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/studio/categorias");
  redirect("/studio/categorias?sucesso=salva");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(["owner", "admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/studio/categorias?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/studio/categorias");
}

export async function organizeCatalogCategoriesAction() {
  await requireRole(["owner", "admin"]);
  const supabase = await createSupabaseServerClient();

  const [{ data: categoryRows, error: categoriesError }, { data: productRows, error: productsError }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,active,sort_order").order("sort_order").order("name"),
    supabase
      .from("products")
      .select("id,name,short_description,description,category_id,category:categories(name)")
      .is("deleted_at", null),
  ]);

  if (categoriesError || productsError) {
    redirect(`/studio/categorias?erro=${encodeURIComponent(categoriesError?.message ?? productsError?.message ?? "Não foi possível organizar as categorias.")}`);
  }

  const categories = (categoryRows ?? []).map((category) => ({ id: category.id, name: category.name, active: category.active }));
  const byCanonicalName = new Map(categories.map((category) => [category.name.toLocaleLowerCase("pt-BR"), category]));
  const usedSlugs = new Set((categoryRows ?? []).map((category) => category.slug));
  let created = 0;
  let updated = 0;
  let deactivated = 0;

  async function ensureCategory(name: string) {
    const key = name.toLocaleLowerCase("pt-BR");
    const existing = byCanonicalName.get(key);
    if (existing) {
      if (!existing.active) {
        const { error } = await supabase.from("categories").update({ active: true }).eq("id", existing.id);
        if (error) throw error;
        existing.active = true;
      }
      return existing;
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: `Categoria principal organizada automaticamente para produtos de ${name}.`,
        active: true,
        sort_order: categories.length + created,
      })
      .select("id,name,active")
      .single();
    if (error || !data) throw error ?? new Error("Não foi possível criar a categoria principal.");

    const item = { id: data.id, name: data.name, active: data.active };
    categories.push(item);
    byCanonicalName.set(key, item);
    usedSlugs.add(slug);
    created += 1;
    return item;
  }

  try {
    const targetByProduct = new Map<string, string>();
    const finalCategoryIds = new Set<string>();

    for (const product of productRows ?? []) {
      const relation = Array.isArray(product.category) ? product.category[0] : product.category;
      const suggestion = suggestProductCategory(
        {
          name: product.name,
          description: `${product.short_description ?? ""} ${product.description ?? ""}`,
          sourceCategory: relation?.name ?? "",
        },
        categories,
      );

      if (suggestion.canonicalName && suggestion.confidence !== "low") {
        const target = await ensureCategory(suggestion.canonicalName);
        targetByProduct.set(product.id, target.id);
        finalCategoryIds.add(target.id);
      } else if (product.category_id) {
        finalCategoryIds.add(product.category_id);
      }
    }

    const grouped = new Map<string, string[]>();
    for (const [productId, categoryId] of targetByProduct) {
      const currentProduct = (productRows ?? []).find((product) => product.id === productId);
      if (currentProduct?.category_id === categoryId) continue;
      const ids = grouped.get(categoryId) ?? [];
      ids.push(productId);
      grouped.set(categoryId, ids);
    }

    for (const [categoryId, productIds] of grouped) {
      const { error } = await supabase.from("products").update({ category_id: categoryId }).in("id", productIds);
      if (error) throw error;
      updated += productIds.length;
    }

    for (const category of categoryRows ?? []) {
      if (!finalCategoryIds.has(category.id) && category.active) {
        const { error } = await supabase.from("categories").update({ active: false }).eq("id", category.id);
        if (error) throw error;
        deactivated += 1;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível organizar o catálogo.";
    redirect(`/studio/categorias?erro=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/produtos");
  revalidatePath("/studio");
  revalidatePath("/studio/produtos");
  revalidatePath("/studio/categorias");
  redirect(`/studio/categorias?organizados=${updated}&criadas=${created}&desativadas=${deactivated}`);
}

function parseCategoryIds(formData: FormData) {
  const raw = String(formData.get("ids") ?? "");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return Array.from(new Set(raw.split(",").map((value) => value.trim()).filter((value) => uuidPattern.test(value)))).slice(0, 300);
}

export async function bulkCategoriesAction(formData: FormData) {
  const action = String(formData.get("bulk_action") ?? "");
  const ids = parseCategoryIds(formData);
  if (!ids.length) redirect(`/studio/categorias?erro=${encodeURIComponent("Selecione pelo menos uma categoria.")}`);

  if (action === "delete") await requireRole(["owner", "admin"]);
  else await requireRole(["owner", "admin", "editor"]);

  const supabase = await createSupabaseServerClient();
  let error: { message: string } | null = null;

  if (action === "activate" || action === "deactivate") {
    const result = await supabase.from("categories").update({ active: action === "activate" }).in("id", ids);
    error = result.error;
  } else if (action === "delete") {
    const result = await supabase.from("categories").delete().in("id", ids);
    error = result.error;
  } else {
    redirect(`/studio/categorias?erro=${encodeURIComponent("Escolha uma ação válida.")}`);
  }

  if (error) redirect(`/studio/categorias?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/produtos");
  revalidatePath("/studio/categorias");
  revalidatePath("/studio/produtos");
  redirect(`/studio/categorias?sucesso=lote&quantidade=${ids.length}`);
}
