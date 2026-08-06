import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { detectDevice } from "@/lib/device";
import { getReferrerHost } from "@/lib/safe-url";
import { validAnonymousId } from "@/lib/anonymous-id";

const schema = z.object({ event_type: z.enum(["page_view", "search", "category_view"]), path: z.string().min(1).max(500), target_key: z.string().max(120).optional(), metadata: z.record(z.unknown()).optional() });

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) return NextResponse.json({ ok: false }, { status: 413 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const anonymousId = validAnonymousId(request.cookies.get("hs_anonymous_id")?.value) ?? randomUUID();
  const admin = createSupabaseAdminClient();
  const { data: session, error } = await admin.from("analytics_sessions").upsert({
    anonymous_id: anonymousId,
    landing_path: parsed.data.path,
    last_path: parsed.data.path,
    last_seen_at: new Date().toISOString(),
    device_type: detectDevice(request.headers.get("user-agent") ?? ""),
    referrer_host: getReferrerHost(request.headers.get("referer")),
  }, { onConflict: "anonymous_id" }).select("id").single();
  if (error || !session) return NextResponse.json({ ok: false }, { status: 500 });
  await admin.from("analytics_events").insert({ session_id: session.id, ...parsed.data });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("hs_anonymous_id", anonymousId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
