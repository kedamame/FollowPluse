import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/utils/auth-cron";
import { runIngestJob } from "@/lib/jobs/ingest";
import { getServiceClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: jobRun } = await db
    .from("job_runs")
    .insert({ job_name: "ingest", status: "running" })
    .select("id")
    .single();

  try {
    const result = await runIngestJob();

    if (jobRun) {
      await db
        .from("job_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "success",
          metadata: result,
        })
        .eq("id", jobRun.id);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (jobRun) {
      await db
        .from("job_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          error_text: message,
        })
        .eq("id", jobRun.id);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
