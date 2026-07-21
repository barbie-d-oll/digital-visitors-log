import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
            borderRadius: 180,
            color: "#183b38",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 132,
            fontWeight: 900,
            height: 360,
            justifyContent: "center",
            letterSpacing: -12,
            width: 360,
          }}
        >
          VL
        </div>
      </div>
    ),
    size,
  );
}
