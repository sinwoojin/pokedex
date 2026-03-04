import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 600
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,203,5,0.28), transparent 35%), linear-gradient(140deg, #081426, #112b48)",
          color: "#f7fbff"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: "22px",
            padding: "36px 46px",
            background: "rgba(9, 22, 38, 0.62)"
          }}
        >
          <div style={{ color: "#ffcb05", fontSize: "28px", fontWeight: 700 }}>포켓몬 카드 도감</div>
          <div style={{ fontSize: "58px", fontWeight: 800 }}>한글 부분 검색 지원</div>
          <div style={{ fontSize: "28px", color: "#c8d7ea" }}>PokeAPI 기반 Dex</div>
        </div>
      </div>
    ),
    size
  );
}
