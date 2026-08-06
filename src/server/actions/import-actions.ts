"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product";
import { buildProductSlug, generatePublicCode } from "@/lib/public-code";

export async function importProductsAction(formData: FormData) {
  const viewer = await requireRole(["owner", "admin", "editor"]);
  const raw = String(formData.get("json") ?? "");
  let input: unknown;
  try { input = JSON.parse(raw); } catch { redirect(`/studio/importacao?erro=${encodeURIComponent("JSON inválido.")}`); }
  if (!Array.isArray(input) || input.length > 100) redirect(`/studio/importacao?erro=${encodeURIComponent("Envie um array com até 100 itens.")}`);
  const items = input as unknown[];

  const rows = items.map((item) => productSchema.omit({ id: true }).safeParse(item));
  const invalid = rows.find((row) => !row.success);
  if (invalid && !invalid.success) redirect(`/studio/importacao?erro=${encodeURIComponent(invalid.error.issues[0]?.message ?? "Item inválido")}`);

  const payload = rows.map((row) => {
    if (!row.success) throw new Error("Validação inconsistente.");
    const code = generatePublicCode();
    return { ...row.data, public_code: code, slug: buildProductSlug(row.data.name, code), published_at: row.data.status === "published" ? new Date().toISOString() : null };
  });

  const supabase = await createSupabaseServerClient();
  const { data: job } = await supabase.from("import_jobs").insert({ created_by: viewer.user.id, source: "json", item_count: payload.length, status: "running" }).select("id").single();
  const { error } = await supabase.from("products").insert(payload);
  await supabase.from("import_jobs").update({ status: error ? "failed" : "completed", error_message: error?.message ?? null, finished_at: new Date().toISOString() }).eq("id", job?.id);
  if (error) redirect(`/studio/importacao?erro=${encodeURIComponent(error.message)}`);
  redirect(`/studio/importacao?sucesso=${payload.length}`);
}
