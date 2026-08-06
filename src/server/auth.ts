import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function getViewer() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: null as UserRole | null,
    };
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    role: (data?.role as UserRole | undefined) ?? null,
  };
}

export async function requireUser() {
  const viewer = await getViewer();

  if (!viewer.user) {
    redirect("/studio/login");
  }

  return {
    user: viewer.user,
    role: viewer.role,
  };
}

export async function requireRole(allowed: UserRole[]) {
  const viewer = await requireUser();
  const role = viewer.role;

  if (!role) {
    redirect("/studio/bootstrap");
  }

  if (!allowed.includes(role)) {
    redirect("/studio?erro=sem-permissao");
  }

  return {
    user: viewer.user,
    role,
  };
}
