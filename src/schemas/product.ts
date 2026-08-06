import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url()]).transform((value) => value || null);

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(160),
  short_description: z.string().trim().max(280).optional().default(""),
  description: z.string().trim().max(8000).optional().default(""),
  price_text: z.string().trim().max(80).optional().default(""),
  external_url: z.string().url().refine((value) => /^https?:\/\//.test(value), "Use uma URL HTTP ou HTTPS."),
  affiliate_network: z.string().trim().max(80).optional().default(""),
  category_id: z.union([z.literal(""), z.string().uuid()]).transform((value) => value || null),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  cover_url: optionalUrl,
  video_url: optionalUrl,
});

export type ProductInput = z.infer<typeof productSchema>;
