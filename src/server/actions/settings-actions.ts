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
    hero_title: formData.get("hero_title"),
    hero_subtitle: formData.get("hero_subtitle"),
    hero_cta: formData.get("hero_cta"),
    footer_notice: formData.get("footer_notice"),
    primary_color: formData.get("primary_color"),
    primary_dark: formData.get("primary_dark"),
    accent_color: formData.get("accent_color"),
    show_categories: formData.get("show_categories") === "on",
    show_featured: formData.get("show_featured") === "on",
    show_latest: formData.get("show_latest") === "on",
    indexing_enabled: formData.get("indexing_enabled") === "on",
  });
  if (!parsed.success) redirect(`/studio/configuracoes?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);

  const {
    instagram,
    tiktok,
    whatsapp,
    hero_title,
    hero_subtitle,
    hero_cta,
    footer_notice,
    primary_color,
    primary_dark,
    accent_color,
    show_categories,
    show_featured,
    show_latest,
    ...rest
  } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").update({
    ...rest,
    social_links: { instagram, tiktok, whatsapp },
    homepage: { hero_title, hero_subtitle, hero_cta, footer_notice, show_categories, show_featured, show_latest },
    theme: { primary_color, primary_dark, accent_color },
  }).eq("id", 1);

  if (error) redirect(`/studio/configuracoes?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/studio/configuracoes");
  redirect("/studio/configuracoes?sucesso=salvo");
}
