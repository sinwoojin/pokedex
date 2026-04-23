import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "포챔스 포켓몬 커뮤니티",
    short_name: "포켓몬 커뮤니티",
    description: "포챔스 분위기의 포켓몬 정보 공유 커뮤니티",
    start_url: "/",
    display: "standalone",
    background_color: "#08111d",
    theme_color: "#08111d",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png"
      }
    ]
  };
}
