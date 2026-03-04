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
      abilities: [{ ability: { name: "static", url: "https://pokeapi.co/api/v2/ability/9/" } }],
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
        if (url.endsWith("/25/")) {
          return {
            ok: true,
            json: async () => ({
              names: [{ name: "피카츄", language: { name: "ko", url: "" } }],
              color: { name: "yellow", url: "" },
              evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/10/" }
            })
          } as Response;
        }

        if (url.endsWith("/172/")) {
          return {
            ok: true,
            json: async () => ({
              names: [{ name: "피츄", language: { name: "ko", url: "" } }],
              color: { name: "yellow", url: "" },
              evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/10/" }
            })
          } as Response;
        }

        if (url.endsWith("/26/")) {
          return {
            ok: true,
            json: async () => ({
              names: [{ name: "라이츄", language: { name: "ko", url: "" } }],
              color: { name: "yellow", url: "" },
              evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/10/" }
            })
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({ names: [], color: { name: "yellow", url: "" }, evolution_chain: { url: "" } })
        } as Response;
      }
      if (url.includes("evolution-chain")) {
        return {
          ok: true,
          json: async () => ({
            chain: {
              species: { name: "pichu", url: "https://pokeapi.co/api/v2/pokemon-species/172/" },
              evolves_to: [
                {
                  species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
                  evolves_to: [
                    {
                      species: { name: "raichu", url: "https://pokeapi.co/api/v2/pokemon-species/26/" },
                      evolves_to: []
                    }
                  ]
                }
              ]
            }
          })
        } as Response;
      }
      if (url.includes("/type/electric")) {
        return {
          ok: true,
          json: async () => ({
            name: "electric",
            names: [{ name: "전기", language: { name: "ko", url: "" } }],
            damage_relations: {
              double_damage_from: [{ name: "ground", url: "" }],
              half_damage_from: [{ name: "electric", url: "" }, { name: "flying", url: "" }, { name: "steel", url: "" }],
              no_damage_from: []
            }
          })
        } as Response;
      }
      if (url.includes("ability")) {
        return {
          ok: true,
          json: async () => ({ names: [{ name: "정전기", language: { name: "ko", url: "" } }] })
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
      name: "피카츄",
      imageUrl: "https://example.com/official.png",
      types: ["전기"],
      height: 4,
      weight: 60,
      abilities: ["정전기"],
      speciesColor: "노랑",
      representativeColor: "#E9C84A",
      weaknesses: [{ name: "땅", multiplier: 2, color: "#E2BF65" }],
      evolutionStages: ["피츄", "피카츄", "라이츄"],
      stats: [{ name: "HP", value: 35 }]
    });

    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true
    });
  });
});
