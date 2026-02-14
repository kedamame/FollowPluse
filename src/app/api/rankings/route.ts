import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const metric = searchParams.get("metric") ?? "24h_growth";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const offset = (page - 1) * limit;

  const validMetrics = ["follower_count", "24h_growth", "6h_growth"];
  if (!validMetrics.includes(metric)) {
    return NextResponse.json({ error: `Invalid metric. Use: ${validMetrics.join(", ")}` }, { status: 400 });
  }

  const db = getServiceClient();

  // Get latest ts_hour for this metric
  const { data: latestRow } = await db
    .from("rankings_hourly")
    .select("ts_hour")
    .eq("metric_key", metric)
    .order("ts_hour", { ascending: false })
    .limit(1)
    .single();

  if (!latestRow) {
    return NextResponse.json({ data: [], total: 0, page, metric, ts_hour: null });
  }

  const tsHour = latestRow.ts_hour;

  // Get rankings with user data
  const { data: rankings, count } = await db
    .from("rankings_hourly")
    .select("rank, score, fid", { count: "exact" })
    .eq("metric_key", metric)
    .eq("ts_hour", tsHour)
    .order("rank", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!rankings || rankings.length === 0) {
    return NextResponse.json({ data: [], total: 0, page, metric, ts_hour: tsHour });
  }

  // Fetch user details
  const fids = rankings.map((r: { fid: number }) => r.fid);
  const { data: users } = await db
    .from("tracked_users")
    .select("fid, username, display_name, pfp_url, follower_count, following_count")
    .in("fid", fids);

  const userMap = new Map((users ?? []).map((u: { fid: number; username: string; display_name: string; pfp_url: string; follower_count: number; following_count: number }) => [u.fid, u]));

  const data = rankings.map((r: { rank: number; score: number; fid: number }) => ({
    rank: r.rank,
    score: r.score,
    user: userMap.get(r.fid) ?? null,
  }));

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    metric,
    ts_hour: tsHour,
  });
}
