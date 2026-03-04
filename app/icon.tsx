import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d3557, #0b1b2f)",
          borderRadius: "12px",
          border: "4px solid #ffcb05"
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            background: "linear-gradient(to bottom, #ef5350 50%, #f5f7fb 50%)",
            border: "3px solid #0f1726",
            position: "relative"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "0",
              width: "100%",
              height: "3px",
              background: "#0f1726"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "9px",
              left: "9px",
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              background: "#f5f7fb",
              border: "2px solid #0f1726"
            }}
          />
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
