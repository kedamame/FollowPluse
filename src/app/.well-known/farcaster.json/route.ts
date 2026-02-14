import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://follow-pluse.vercel.app";

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIxMTE4OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDMxOTk5REZCMzI1NkQzMjNDQTA1N0RkMjBhREI1NkI4RUQ0NTE3NzQifQ",
      payload: "eyJkb21haW4iOiJmb2xsb3ctcGx1c2UudmVyY2VsLmFwcCJ9",
      signature: "L1Ak6qiry41w+kTLIQxDOikV3iW1s11uQNW0NKUPzKEmqCov6zUyHvrUfL8Igi7AvacyU8WWArKhg8ue7GpgbBw=",
    },
    frame: {
      version: "next",
      name: "FollowPulse",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#7c3aed",
      homeUrl: appUrl,
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return NextResponse.json(manifest);
}
