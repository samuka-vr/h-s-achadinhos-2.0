"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/studio/login?erro=${encodeURIComponent("E-mail ou senha inválidos.")}`);
  redirect("/studio");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/studio/login?erro=${encodeURIComponent(error.message)}`);
  redirect("/studio/bootstrap");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/studio/login");
}

export async function bootstrapOwnerAction() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");
  const { error } = await supabase.rpc("bootstrap_owner", { p_user_id: user.id });
  if (error) redirect(`/studio/bootstrap?erro=${encodeURIComponent(error.message)}`);
  redirect("/studio");
}
