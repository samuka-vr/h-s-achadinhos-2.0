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

function parseBannerIds(formData: FormData) {
  const raw = String(formData.get("ids") ?? "");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return Array.from(new Set(raw.split(",").map((value) => value.trim()).filter((value) => uuidPattern.test(value)))).slice(0, 300);
}

export async function bulkBannersAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const action = String(formData.get("bulk_action") ?? "");
  const ids = parseBannerIds(formData);
  if (!ids.length) redirect(`/studio/banners?erro=${encodeURIComponent("Selecione pelo menos um banner.")}`);

  const supabase = await createSupabaseServerClient();
  let error: { message: string } | null = null;

  if (action === "activate" || action === "deactivate") {
    const result = await supabase.from("banners").update({ active: action === "activate" }).in("id", ids);
    error = result.error;
  } else if (action === "delete") {
    const result = await supabase.from("banners").delete().in("id", ids);
    error = result.error;
  } else {
    redirect(`/studio/banners?erro=${encodeURIComponent("Escolha uma ação válida.")}`);
  }

  if (error) redirect(`/studio/banners?erro=${encodeURIComponent(error.message)}`);
  refreshBannerPaths();
  redirect(`/studio/banners?sucesso=lote&quantidade=${ids.length}`);
}
