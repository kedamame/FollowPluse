import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
        }}
      >
        <span style={{ fontSize: 80, color: "white", fontWeight: 700 }}>FollowPulse</span>
        <span style={{ fontSize: 24, color: "rgba(255,255,255,0.8)", marginTop: 16 }}>
          Farcaster Rankings
        </span>
      </div>
    ),
    { width: 600, height: 400 }
  );
}
