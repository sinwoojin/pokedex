import { createPokedexStore } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";

const createSampleCard = (id: number): PokemonCard => ({
  id,
  name: `포켓몬-${id}`,
  imageUrl: "https://example.com/sample.png",
  types: ["전기"],
  height: 10,
  weight: 100,
  abilities: ["샘플"],
  speciesColor: "노랑",
  representativeColor: "#E9C84A",
  weaknesses: [{ name: "땅", color: "#E2BF65", multiplier: 2 }],
  evolutionStages: ["A", "B"],
  stats: [{ name: "HP", value: 50 }]
});

describe("pokedex store", () => {
  it("resets page to 1 when search query changes", () => {
    const store = createPokedexStore({ query: "", page: 4, sortOrder: "asc" });

    store.getState().setQuery("bulbasaur");

    expect(store.getState().query).toBe("bulbasaur");
    expect(store.getState().page).toBe(1);
  });

  it("never sets page smaller than 1", () => {
    const store = createPokedexStore();

    store.getState().setPage(0);

    expect(store.getState().page).toBe(1);
  });

  it("resets page to 1 when sort order changes", () => {
    const store = createPokedexStore({ query: "", page: 5, sortOrder: "asc" });

    store.getState().setSortOrder("desc");

    expect(store.getState().sortOrder).toBe("desc");
    expect(store.getState().page).toBe(1);
  });

  it("tracks gacha ownership and draw count", () => {
    const store = createPokedexStore();

    store.getState().recordGachaDraw(createSampleCard(25), "rare", 3);
    store.getState().recordGachaDraw(createSampleCard(25), "rare", 3);

    expect(store.getState().ownedPokemonIds).toEqual([25]);
    expect(store.getState().drawCount).toBe(2);
    expect(store.getState().lastDrawnId).toBe(25);
    expect(store.getState().rarities[25]).toBe("rare");
    expect(store.getState().duplicateCounts[25]).toBe(1);
    expect(store.getState().candies).toBe(3);
  });

  it("clamps rating between 1 and 5", () => {
    const store = createPokedexStore();

    store.getState().setPokemonRating(25, 0);
    store.getState().setPokemonRating(151, 8);

    expect(store.getState().ratings[25]).toBe(1);
    expect(store.getState().ratings[151]).toBe(5);
  });
});
