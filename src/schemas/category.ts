import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
  image_url: z.union([z.literal(""), z.string().url()]).transform((value) => value || null),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});
