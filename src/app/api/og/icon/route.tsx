import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          borderRadius: 40,
        }}
      >
        <span style={{ fontSize: 120, color: "white", fontWeight: 700 }}>FP</span>
      </div>
    ),
    { width: 200, height: 200 }
  );
}
