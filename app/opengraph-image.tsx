import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,203,5,0.35), transparent 35%), radial-gradient(circle at 80% 10%, rgba(78,156,255,0.28), transparent 30%), linear-gradient(160deg, #071120, #0f2339)",
          color: "#f7fbff",
          padding: "56px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: "28px",
            padding: "44px",
            background: "rgba(9, 22, 38, 0.55)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ color: "#ffcb05", fontSize: "34px", fontWeight: 700 }}>POKEDEX</div>
            <div style={{ fontSize: "82px", fontWeight: 800, lineHeight: 1.1 }}>포켓몬 카드 도감</div>
            <div style={{ fontSize: "32px", color: "#c8d7ea" }}>
              한글/영문 부분 검색, 타입/약점, 진화 과정까지
            </div>
          </div>
          <div style={{ fontSize: "28px", color: "#b4c9df" }}>PokeAPI + Next.js</div>
        </div>
      </div>
    ),
    size
  );
}
