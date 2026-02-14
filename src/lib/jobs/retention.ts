import { getServiceClient } from "@/lib/supabase/server";

export async function runRetentionJob(): Promise<{ deletedCounts: Record<string, number> }> {
  const db = getServiceClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const tables = [
    { name: "follow_events", column: "detected_at" },
    { name: "user_metrics_hourly", column: "ts_hour" },
    { name: "rankings_hourly", column: "ts_hour" },
    { name: "job_runs", column: "started_at" },
  ] as const;

  const deletedCounts: Record<string, number> = {};

  for (const { name, column } of tables) {
    const { count, error } = await db
      .from(name)
      .delete({ count: "exact" })
      .lt(column, cutoff);

    if (error) throw new Error(`Retention delete from ${name} failed: ${error.message}`);
    deletedCounts[name] = count ?? 0;
  }

  return { deletedCounts };
}
