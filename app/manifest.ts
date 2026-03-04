import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "포켓몬 카드 도감",
    short_name: "포켓몬 도감",
    description: "PokeAPI 기반 포켓몬 카드 도감",
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
