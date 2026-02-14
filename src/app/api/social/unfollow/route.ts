import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { signer_uuid, target_fid } = body;

  if (!signer_uuid || typeof signer_uuid !== "string") {
    return NextResponse.json({ error: "signer_uuid is required" }, { status: 400 });
  }
  if (!target_fid || typeof target_fid !== "number") {
    return NextResponse.json({ error: "target_fid (number) is required" }, { status: 400 });
  }

  try {
    const provider = getProvider();
    await provider.unfollowUser(signer_uuid, target_fid);
    return NextResponse.json({ ok: true, action: "unfollow", target_fid });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Signer not approved") || message.includes("signer")) {
      return NextResponse.json(
        {
          error: "Signer not approved. Please approve the signer in Warpcast first.",
          needs_approval: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
