import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/utils/auth-cron";
import { runRetentionJob } from "@/lib/jobs/retention";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: jobRun } = await db
    .from("job_runs")
    .insert({ job_name: "retention", status: "running" })
    .select("id")
    .single();

  try {
    const result = await runRetentionJob();

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
