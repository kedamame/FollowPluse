import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Mini App lifecycle events
  const { event, fid } = body;

  if (event === "frame_added" && fid) {
    // User installed the Mini App → create notification subscription
    const db = getServiceClient();
    await db.from("notification_subscriptions").upsert(
      {
        fid: Number(fid),
        enabled: true,
        channel: "in_app",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "fid" }
    );
  }

  if (event === "frame_removed" && fid) {
    // User uninstalled the Mini App → disable notifications
    const db = getServiceClient();
    await db
      .from("notification_subscriptions")
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq("fid", Number(fid));
  }

  return NextResponse.json({ ok: true });
}
