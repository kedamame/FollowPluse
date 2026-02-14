import { getProvider } from "@/lib/providers";
import { getServiceClient } from "@/lib/supabase/server";
import type { FarcasterUser } from "@/lib/providers/types";

const TOP_N = 50;

function toHourBucket(date: Date): string {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export async function runIngestJob(): Promise<{ usersUpdated: number; growthEventsCreated: number }> {
  const provider = getProvider();
  const db = getServiceClient();
  const tsHour = toHourBucket(new Date());

  // 1. Fetch top N users via bulk lookup (free tier)
  const topUsers = await provider.getTopUsers(TOP_N);
  if (topUsers.length === 0) {
    throw new Error("No users returned from provider");
  }

  // 2. Get previous follower counts to detect changes
  const fids = topUsers.map((u) => u.fid);
  const { data: prevTracked } = await db
    .from("tracked_users")
    .select("fid, follower_count")
    .in("fid", fids);

  const prevCountMap = new Map(
    (prevTracked ?? []).map((r: { fid: number; follower_count: number }) => [r.fid, r.follower_count])
  );

  // 3. Upsert tracked_users
  const { error: upsertErr } = await db.from("tracked_users").upsert(
    topUsers.map((u: FarcasterUser) => ({
      fid: u.fid,
      username: u.username,
      display_name: u.displayName,
      pfp_url: u.pfpUrl,
      follower_count: u.followerCount,
      following_count: u.followingCount,
      last_seen_at: new Date().toISOString(),
    })),
    { onConflict: "fid" }
  );
  if (upsertErr) throw new Error(`Upsert tracked_users failed: ${upsertErr.message}`);

  // 4. Detect follower count changes and create approximate events
  let growthEventsCreated = 0;
  const now = new Date().toISOString();

  for (const user of topUsers) {
    const prevCount = prevCountMap.get(user.fid);
    if (prevCount === undefined) continue; // First time seeing this user

    const diff = user.followerCount - prevCount;
    if (diff === 0) continue;

    // Record the net change as a single event
    const { error: evErr } = await db.from("follow_events").insert({
      source_fid: 0, // 0 = aggregate (not individual)
      target_fid: user.fid,
      action: diff > 0 ? "follow" : "unfollow",
      detected_at: now,
    });
    if (evErr) throw new Error(`Insert follow_events failed: ${evErr.message}`);
    growthEventsCreated++;
  }

  // 5. Save metrics snapshot
  const { error: metricsErr } = await db.from("user_metrics_hourly").upsert(
    topUsers.map((u: FarcasterUser) => ({
      fid: u.fid,
      ts_hour: tsHour,
      follower_count: u.followerCount,
      following_count: u.followingCount,
      casts_count: 0,
      reactions_received: 0,
      mentions_received: 0,
    })),
    { onConflict: "fid,ts_hour" }
  );
  if (metricsErr) throw new Error(`Upsert user_metrics_hourly failed: ${metricsErr.message}`);

  // 6. Compute rankings
  await computeRankings(db, topUsers, tsHour);

  return { usersUpdated: topUsers.length, growthEventsCreated };
}

async function computeRankings(
  db: ReturnType<typeof getServiceClient>,
  users: FarcasterUser[],
  tsHour: string
) {
  const sixHoursAgo = new Date(new Date(tsHour).getTime() - 6 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(new Date(tsHour).getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { data: prev6h } = await db
    .from("user_metrics_hourly")
    .select("fid, follower_count")
    .eq("ts_hour", sixHoursAgo);

  const { data: prev24h } = await db
    .from("user_metrics_hourly")
    .select("fid, follower_count")
    .eq("ts_hour", twentyFourHoursAgo);

  const prev6hMap = new Map((prev6h ?? []).map((r: { fid: number; follower_count: number }) => [r.fid, r.follower_count]));
  const prev24hMap = new Map((prev24h ?? []).map((r: { fid: number; follower_count: number }) => [r.fid, r.follower_count]));

  type RankingEntry = { ts_hour: string; metric_key: string; fid: number; rank: number; score: number };
  const rankings: RankingEntry[] = [];

  // Follower count ranking
  const byFollowers = [...users].sort((a, b) => b.followerCount - a.followerCount);
  byFollowers.forEach((u, i) => {
    rankings.push({ ts_hour: tsHour, metric_key: "follower_count", fid: u.fid, rank: i + 1, score: u.followerCount });
  });

  // 24h growth ranking
  const with24hGrowth = users
    .map((u) => ({
      fid: u.fid,
      growth: prev24hMap.has(u.fid) ? u.followerCount - (prev24hMap.get(u.fid) ?? 0) : 0,
    }))
    .sort((a, b) => b.growth - a.growth);
  with24hGrowth.forEach((u, i) => {
    rankings.push({ ts_hour: tsHour, metric_key: "24h_growth", fid: u.fid, rank: i + 1, score: u.growth });
  });

  // 6h growth ranking
  const with6hGrowth = users
    .map((u) => ({
      fid: u.fid,
      growth: prev6hMap.has(u.fid) ? u.followerCount - (prev6hMap.get(u.fid) ?? 0) : 0,
    }))
    .sort((a, b) => b.growth - a.growth);
  with6hGrowth.forEach((u, i) => {
    rankings.push({ ts_hour: tsHour, metric_key: "6h_growth", fid: u.fid, rank: i + 1, score: u.growth });
  });

  if (rankings.length > 0) {
    const { error } = await db.from("rankings_hourly").upsert(rankings, {
      onConflict: "ts_hour,metric_key,fid",
    });
    if (error) throw new Error(`Upsert rankings_hourly failed: ${error.message}`);
  }
}
