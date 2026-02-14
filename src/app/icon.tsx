import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 200, height: 200 };
export const contentType = "image/png";

export default function Icon() {
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
        <span style={{ fontSize: 120, color: "white" }}>F</span>
      </div>
    ),
    { ...size }
  );
}
