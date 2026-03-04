import { createPokedexStore } from "@/stores/pokedex-store";

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
});
