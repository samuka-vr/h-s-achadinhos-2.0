"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginError(message: string) {
  redirect(`/studio/login?erro=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) loginError("Informe um e-mail válido e uma senha com pelo menos 8 caracteres.");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) loginError("E-mail ou senha inválidos. Confirme também se o e-mail já foi verificado.");
  redirect("/studio");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) loginError("Use um e-mail válido e uma senha com pelo menos 8 caracteres.");

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/studio/bootstrap` },
  });
  if (error) loginError(error.message);
  if (data.session) redirect("/studio/bootstrap");
  redirect(`/studio/login?mensagem=${encodeURIComponent("Conta criada. Confirme o e-mail recebido e depois entre com sua senha.")}`);
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
