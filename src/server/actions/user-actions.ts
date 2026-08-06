"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/server/auth";

const roleSchema = z.object({ user_id: z.string().uuid(), role: z.enum(["owner", "admin", "editor", "analyst"]) });

export async function setUserRoleAction(formData: FormData) {
  await requireRole(["owner"]);
  const parsed = roleSchema.safeParse({ user_id: formData.get("user_id"), role: formData.get("role") });
  if (!parsed.success) redirect(`/studio/usuarios?erro=${encodeURIComponent("Dados inválidos.")}`);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("user_roles").upsert(parsed.data, { onConflict: "user_id" });
  if (error) redirect(`/studio/usuarios?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/studio/usuarios");
}

export async function inviteUserAction(formData: FormData) {
  await requireRole(["owner"]);
  const email = z.string().email().parse(formData.get("email"));
  const role = z.enum(["admin", "editor", "analyst"]).parse(formData.get("role"));
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error || !data.user) redirect(`/studio/usuarios?erro=${encodeURIComponent(error?.message ?? "Falha ao convidar.")}`);
  const supabase = await createSupabaseServerClient();
  const { error: roleError } = await supabase.from("user_roles").upsert({ user_id: data.user.id, role }, { onConflict: "user_id" });
  if (roleError) redirect(`/studio/usuarios?erro=${encodeURIComponent(roleError.message)}`);
  revalidatePath("/studio/usuarios");
}

function parseUserIds(formData: FormData) {
  const raw = String(formData.get("ids") ?? "");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return Array.from(new Set(raw.split(",").map((value) => value.trim()).filter((value) => uuidPattern.test(value)))).slice(0, 300);
}

export async function bulkUserRolesAction(formData: FormData) {
  const viewer = await requireRole(["owner"]);
  const ids = parseUserIds(formData).filter((id) => id !== viewer.user.id);
  const role = z.enum(["owner", "admin", "editor", "analyst"]).safeParse(formData.get("role"));

  if (!ids.length) redirect(`/studio/usuarios?erro=${encodeURIComponent("Selecione pelo menos outro integrante.")}`);
  if (!role.success) redirect(`/studio/usuarios?erro=${encodeURIComponent("Escolha um nível de acesso válido.")}`);

  const supabase = await createSupabaseServerClient();
  const payload = ids.map((user_id) => ({ user_id, role: role.data }));
  const { error } = await supabase.from("user_roles").upsert(payload, { onConflict: "user_id" });
  if (error) redirect(`/studio/usuarios?erro=${encodeURIComponent(error.message)}`);

  revalidatePath("/studio/usuarios");
  redirect(`/studio/usuarios?sucesso=lote&quantidade=${ids.length}`);
}
