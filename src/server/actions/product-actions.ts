"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";
import { productSchema } from "@/schemas/product";
import { buildProductSlug, generatePublicCode } from "@/lib/public-code";

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
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generatePublicCode();
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("public_code", code);
    if (!count) return code;
  }
  throw new Error("Não foi possível gerar um código único.");
}

export async function saveProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const parsed = productSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    redirect(`/studio/produtos/novo?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { id, ...input } = parsed.data;
  const nowPublished = input.status === "published" ? new Date().toISOString() : null;

  if (id) {
    const { data: existing } = await supabase.from("products").select("public_code,published_at").eq("id", id).single();
    const code = existing?.public_code as string;
    const { error } = await supabase.from("products").update({
      ...input,
      slug: buildProductSlug(input.name, code),
      published_at: existing?.published_at ?? nowPublished,
    }).eq("id", id);
    if (error) redirect(`/studio/produtos/${id}/editar?erro=${encodeURIComponent(error.message)}`);
  } else {
    const code = await uniqueCode();
    const { error } = await supabase.from("products").insert({
      ...input,
      public_code: code,
      slug: buildProductSlug(input.name, code),
      published_at: nowPublished,
    });
    if (error) redirect(`/studio/produtos/novo?erro=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/studio/produtos");
  redirect("/studio/produtos?sucesso=salvo");
}

export async function archiveProductAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  await supabase.from("products").update({ status: "archived", deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/studio/produtos");
}
