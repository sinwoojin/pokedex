import { createPokedexStore } from "@/stores/pokedex-store";

describe("pokedex store", () => {
  it("resets page to 1 when search query changes", () => {
    const store = createPokedexStore({ query: "", page: 4 });

    store.getState().setQuery("bulbasaur");

    expect(store.getState().query).toBe("bulbasaur");
    expect(store.getState().page).toBe(1);
  });

  it("never sets page smaller than 1", () => {
    const store = createPokedexStore();

    store.getState().setPage(0);

    expect(store.getState().page).toBe(1);
  });
});
