"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { settingsSchema } from "@/schemas/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/auth";

export async function saveSettingsAction(formData: FormData) {
  await requireRole(["owner", "admin"]);
  const parsed = settingsSchema.safeParse({
    brand_name: formData.get("brand_name"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    logo_url: formData.get("logo_url"),
    instagram: formData.get("instagram"),
    tiktok: formData.get("tiktok"),
    whatsapp: formData.get("whatsapp"),
    indexing_enabled: formData.get("indexing_enabled") === "on",
  });
  if (!parsed.success) redirect(`/studio/configuracoes?erro=${encodeURIComponent("Dados inválidos.")}`);
  const { instagram, tiktok, whatsapp, ...rest } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").update({
    ...rest,
    social_links: { instagram, tiktok, whatsapp },
  }).eq("id", 1);
  if (error) redirect(`/studio/configuracoes?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/studio/configuracoes");
  redirect("/studio/configuracoes?sucesso=salvo");
}
