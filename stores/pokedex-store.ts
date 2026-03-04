import { createStore } from "zustand/vanilla";

export const PAGE_SIZE = 12;

export type SortOrder = "asc" | "desc";

export type PokedexState = {
  query: string;
  page: number;
  sortOrder: SortOrder;
};

export type PokedexActions = {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setPage: (page: number) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  nextPage: () => void;
  prevPage: () => void;
};

export type PokedexStore = PokedexState & PokedexActions;

const defaultState: PokedexState = {
  query: "",
  page: 1,
  sortOrder: "asc"
};

export const createPokedexStore = (initState: PokedexState = defaultState) => {
  return createStore<PokedexStore>()((set) => ({
    ...initState,
    setQuery: (query) => set({ query, page: 1 }),
    clearQuery: () => set({ query: "", page: 1 }),
    setPage: (page) => set({ page: Math.max(page, 1) }),
    setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
    nextPage: () => set((state) => ({ page: state.page + 1 })),
    prevPage: () => set((state) => ({ page: Math.max(state.page - 1, 1) }))
  }));
};
