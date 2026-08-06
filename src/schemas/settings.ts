import { z } from "zod";

export const settingsSchema = z.object({
  brand_name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500),
  logo_url: z.union([z.literal(""), z.string().url()]).transform((value) => value || null),
  instagram: z.union([z.literal(""), z.string().url()]),
  tiktok: z.union([z.literal(""), z.string().url()]),
  whatsapp: z.union([z.literal(""), z.string().url()]),
  indexing_enabled: z.coerce.boolean().default(false),
});
