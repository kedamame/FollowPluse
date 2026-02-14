import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fid = searchParams.get("fid");
  const signerUuid = searchParams.get("signer_uuid");
  const username = searchParams.get("username") ?? "";
  const displayName = searchParams.get("display_name") ?? "";
  const pfpUrl = searchParams.get("pfp_url") ?? "";

  if (!fid || !signerUuid) {
    return new NextResponse(
      `<html><body><script>
        window.opener?.postMessage({ type: "neynar_siwf_error", error: "Missing fid or signer_uuid" }, "*");
        window.close();
      </script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Send user data back to the opener window
  const userData = JSON.stringify({
    fid: Number(fid),
    username,
    displayName,
    pfpUrl: pfpUrl || null,
    signerUuid,
  });

  return new NextResponse(
    `<html><body><script>
      window.opener?.postMessage({
        type: "neynar_siwf_success",
        user: ${userData}
      }, "*");
      window.close();
    </script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
