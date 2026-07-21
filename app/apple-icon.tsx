import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#1b6b61",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#ffd700",
            borderRadius: 62,
            color: "#183b38",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 48,
            fontWeight: 900,
            height: 124,
            justifyContent: "center",
            letterSpacing: -4,
            width: 124,
          }}
        >
          VL
        </div>
      </div>
    ),
    size,
  );
}
