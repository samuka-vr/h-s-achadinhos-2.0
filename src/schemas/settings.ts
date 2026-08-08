import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url()]);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal, como #4f46e5.");

export const settingsSchema = z.object({
  brand_name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500),
  logo_url: optionalUrl.transform((value) => value || null),
  instagram: optionalUrl,
  tiktok: optionalUrl,
  whatsapp: optionalUrl,
  hero_title: z.string().trim().min(2).max(140),
  hero_subtitle: z.string().trim().max(320),
  hero_cta: z.string().trim().min(2).max(50),
  footer_notice: z.string().trim().max(500),
  primary_color: color,
  primary_dark: color,
  accent_color: color,
  background_color: color,
  surface_color: color,
  text_color: color,
  show_categories: z.coerce.boolean().default(false),
  show_featured: z.coerce.boolean().default(false),
  show_latest: z.coerce.boolean().default(false),
  indexing_enabled: z.coerce.boolean().default(false),
});
