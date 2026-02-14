import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fid = searchParams.get("fid");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const offset = (page - 1) * limit;

  const db = getServiceClient();

  let query = db
    .from("follow_events")
    .select("id, source_fid, target_fid, action, detected_at", { count: "exact" })
    .order("detected_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (fid) {
    query = query.or(`source_fid.eq.${fid},target_fid.eq.${fid}`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page });
}
