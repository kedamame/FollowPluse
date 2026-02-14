import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  const { fid: fidStr } = await params;
  const fid = Number(fidStr);
  if (isNaN(fid)) {
    return NextResponse.json({ error: "Invalid fid" }, { status: 400 });
  }

  const db = getServiceClient();

  // Get user info
  const { data: user } = await db
    .from("tracked_users")
    .select("*")
    .eq("fid", fid)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get recent metrics (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: metrics } = await db
    .from("user_metrics_hourly")
    .select("ts_hour, follower_count, following_count")
    .eq("fid", fid)
    .gte("ts_hour", sevenDaysAgo)
    .order("ts_hour", { ascending: true });

  // Get recent follow events
  const { data: events } = await db
    .from("follow_events")
    .select("source_fid, target_fid, action, detected_at")
    .eq("target_fid", fid)
    .gte("detected_at", sevenDaysAgo)
    .order("detected_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    user,
    metrics: metrics ?? [],
    events: events ?? [],
  });
}
