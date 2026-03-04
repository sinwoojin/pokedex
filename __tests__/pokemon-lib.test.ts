import { toPokemonCard } from "@/lib/pokemon";
import type { PokemonApiDetail } from "@/types/pokemon";

describe("toPokemonCard", () => {
  it("maps api detail to card with official artwork", () => {
    const detail: PokemonApiDetail = {
      id: 25,
      name: "pikachu",
      height: 4,
      weight: 60,
      types: [{ slot: 1, type: { name: "electric", url: "" } }],
      abilities: [{ ability: { name: "static", url: "" } }],
      stats: [{ base_stat: 35, stat: { name: "hp", url: "" } }],
      sprites: {
        front_default: "https://example.com/front.png",
        other: {
          "official-artwork": {
            front_default: "https://example.com/official.png"
          }
        }
      }
    };

    expect(toPokemonCard(detail)).toEqual({
      id: 25,
      name: "Pikachu",
      imageUrl: "https://example.com/official.png",
      types: ["electric"],
      height: 4,
      weight: 60,
      abilities: ["Static"],
      stats: [{ name: "hp", value: 35 }]
    });
  });
});
