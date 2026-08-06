import { z } from "zod";

const uuidSchema = z.string().uuid();

export function validAnonymousId(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = uuidSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
