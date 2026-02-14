import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fid, enabled, threshold_followers, locale } = body;

  if (!fid || typeof fid !== "number") {
    return NextResponse.json({ error: "fid (number) is required" }, { status: 400 });
  }

  const db = getServiceClient();

  const updateData: Record<string, unknown> = {
    fid,
    updated_at: new Date().toISOString(),
  };

  if (typeof enabled === "boolean") updateData.enabled = enabled;
  if (typeof threshold_followers === "number") updateData.threshold_followers = threshold_followers;
  if (locale === "ja" || locale === "en") updateData.locale = locale;

  const { data, error } = await db
    .from("notification_subscriptions")
    .upsert(updateData, { onConflict: "fid" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subscription: data });
}

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "fid query param is required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("notification_subscriptions")
    .select("*")
    .eq("fid", Number(fid))
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data ?? null });
}
