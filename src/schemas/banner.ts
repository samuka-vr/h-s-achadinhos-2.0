import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240).optional().default(""),
  image_url: z.string().url(),
  target_url: z.union([z.literal(""), z.string().url()]).transform((value) => value || null),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});
