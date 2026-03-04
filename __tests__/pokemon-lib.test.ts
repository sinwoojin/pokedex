import { toPokemonCard } from "@/lib/pokemon";
import type { PokemonApiDetail } from "@/types/pokemon";

describe("toPokemonCard", () => {
  it("maps api detail to card with official artwork", async () => {
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
      },
      species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" }
    };

    const originalFetch = globalThis.fetch;
    const mockFetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("pokemon-species")) {
        return {
          ok: true,
          json: async () => ({ color: { name: "yellow", url: "" } })
        } as Response;
      }
      if (url.includes("/type/electric")) {
        return {
          ok: true,
          json: async () => ({
            name: "electric",
            damage_relations: {
              double_damage_from: [{ name: "ground", url: "" }],
              half_damage_from: [{ name: "electric", url: "" }, { name: "flying", url: "" }, { name: "steel", url: "" }],
              no_damage_from: []
            }
          })
        } as Response;
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({})
      } as Response;
    });
    Object.defineProperty(globalThis, "fetch", {
      value: mockFetch,
      writable: true,
      configurable: true
    });

    await expect(toPokemonCard(detail)).resolves.toEqual({
      id: 25,
      name: "Pikachu",
      imageUrl: "https://example.com/official.png",
      types: ["electric"],
      height: 4,
      weight: 60,
      abilities: ["Static"],
      speciesColor: "yellow",
      representativeColor: "#E9C84A",
      weaknesses: [{ name: "ground", multiplier: 2, color: "#E2BF65" }],
      stats: [{ name: "hp", value: 35 }]
    });

    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true
    });
  });
});
