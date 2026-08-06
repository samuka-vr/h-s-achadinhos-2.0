"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categorySchema } from "@/schemas/category";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";

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
