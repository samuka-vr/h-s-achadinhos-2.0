import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isPublicCode } from "@/lib/public-code";
import { parseSafeHttpUrl } from "@/lib/safe-url";
import { validAnonymousId } from "@/lib/anonymous-id";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isPublicCode(code.toUpperCase())) return NextResponse.redirect(new URL("/produtos", request.url));
  const admin = createSupabaseAdminClient();
  const { data: product } = await admin.from("products").select("id,external_url,public_code").eq("public_code", code.toUpperCase()).eq("status", "published").is("deleted_at", null).maybeSingle();
  const target = product ? parseSafeHttpUrl(product.external_url) : null;
  if (!product || !target) return NextResponse.redirect(new URL("/produtos", request.url));

  const anonymousId = validAnonymousId(request.cookies.get("hs_anonymous_id")?.value) ?? randomUUID();
  const { data: session } = await admin.from("analytics_sessions").upsert({ anonymous_id: anonymousId, last_seen_at: new Date().toISOString(), last_path: request.nextUrl.pathname }, { onConflict: "anonymous_id" }).select("id").single();
  if (session) await admin.from("analytics_events").insert({ session_id: session.id, event_type: "outbound_click", product_id: product.id, path: request.nextUrl.pathname, target_key: product.public_code });
  const response = NextResponse.redirect(target);
  response.cookies.set("hs_anonymous_id", anonymousId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
