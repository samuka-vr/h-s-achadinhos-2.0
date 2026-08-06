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
