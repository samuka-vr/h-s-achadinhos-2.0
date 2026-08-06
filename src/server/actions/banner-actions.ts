"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bannerSchema } from "@/schemas/banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";

export async function saveBannerAction(formData: FormData) {
  await requireRole(["owner", "admin", "editor"]);
  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    image_url: formData.get("image_url"),
    target_url: formData.get("target_url"),
    active: formData.get("active") === "on",
    sort_order: formData.get("sort_order"),
  });
  if (!parsed.success) redirect(`/studio/banners?erro=${encodeURIComponent("Dados inválidos.")}`);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("banners").insert(parsed.data);
  if (error) redirect(`/studio/banners?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/studio/banners");
  redirect("/studio/banners?sucesso=salvo");
}
