"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bannerSchema } from "@/schemas/banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";

function refreshBannerPaths() {
  revalidatePath("/");
  revalidatePath("/studio/banners");
}

export async function saveBannerAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    image_url: formData.get("image_url"),
    target_url: formData.get("target_url"),
    active: formData.get("active") === "on",
    sort_order: formData.get("sort_order"),
  });
  if (!parsed.success) redirect(`/studio/banners?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  const supabase = await createSupabaseServerClient();
  const query = id ? supabase.from("banners").update(parsed.data).eq("id", id) : supabase.from("banners").insert(parsed.data);
  const { error } = await query;
  if (error) redirect(`/studio/banners?erro=${encodeURIComponent(error.message)}`);
  refreshBannerPaths();
  redirect("/studio/banners?sucesso=salvo");
}

export async function deleteBannerAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) redirect(`/studio/banners?erro=${encodeURIComponent(error.message)}`);
  refreshBannerPaths();
}
