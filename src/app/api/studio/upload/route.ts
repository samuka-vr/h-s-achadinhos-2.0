import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role || !["owner", "admin", "editor"].includes(role.role)) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Arquivo inválido ou maior que 20 MB." }, { status: 400 });
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data } = supabase.storage.from("product-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
