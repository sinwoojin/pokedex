import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { GachaRarity } from "@/lib/gacha";
import type { PokemonCard } from "@/types/pokemon";

export const PAGE_SIZE = 12;

export type SortOrder = "asc" | "desc";

export type PokedexState = {
  query: string;
  page: number;
  sortOrder: SortOrder;
  ownedPokemonIds: number[];
  ownedCardsById: Record<number, PokemonCard>;
  rarities: Record<number, GachaRarity>;
  duplicateCounts: Record<number, number>;
  ratings: Record<number, number>;
  drawCount: number;
  candies: number;
  lastDrawnId: number | null;
  lastDrawRarity: GachaRarity | null;
  lastDrawWasDuplicate: boolean;
  lastCandyEarned: number;
};

export type PokedexActions = {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setPage: (page: number) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  nextPage: () => void;
  prevPage: () => void;
  recordGachaDraw: (card: PokemonCard, rarity: GachaRarity, duplicateCandy: number) => void;
  setPokemonRating: (pokemonId: number, rating: number) => void;
};

export type PokedexStore = PokedexState & PokedexActions;

const defaultState: PokedexState = {
  query: "",
  page: 1,
  sortOrder: "asc",
  ownedPokemonIds: [],
  ownedCardsById: {},
  rarities: {},
  duplicateCounts: {},
  ratings: {},
  drawCount: 0,
  candies: 0,
  lastDrawnId: null,
  lastDrawRarity: null,
  lastDrawWasDuplicate: false,
  lastCandyEarned: 0
};

const STORAGE_KEY = "pokemon-card-gacha-store-v1";

export const createPokedexStore = (initState: Partial<PokedexState> = {}) => {
  const state = {
    ...defaultState,
    ...initState
  };

  return createStore<PokedexStore>()(
    persist(
      (set) => ({
        ...state,
        setQuery: (query) => set({ query, page: 1 }),
        clearQuery: () => set({ query: "", page: 1 }),
        setPage: (page) => set({ page: Math.max(page, 1) }),
        setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
        nextPage: () => set((currentState) => ({ page: currentState.page + 1 })),
        prevPage: () => set((currentState) => ({ page: Math.max(currentState.page - 1, 1) })),
        recordGachaDraw: (card, rarity, duplicateCandy) =>
          set((currentState) => {
            const pokemonId = card.id;
            const alreadyOwned = currentState.ownedPokemonIds.includes(pokemonId);

            return {
              ownedPokemonIds: alreadyOwned
                ? currentState.ownedPokemonIds
                : [...currentState.ownedPokemonIds, pokemonId],
              ownedCardsById: {
                ...currentState.ownedCardsById,
                [pokemonId]: card
              },
              rarities: {
                ...currentState.rarities,
                [pokemonId]: rarity
              },
              duplicateCounts: {
                ...currentState.duplicateCounts,
                [pokemonId]: (currentState.duplicateCounts[pokemonId] ?? 0) + (alreadyOwned ? 1 : 0)
              },
              drawCount: currentState.drawCount + 1,
              candies: currentState.candies + (alreadyOwned ? duplicateCandy : 0),
              lastDrawnId: pokemonId,
              lastDrawRarity: rarity,
              lastDrawWasDuplicate: alreadyOwned,
              lastCandyEarned: alreadyOwned ? duplicateCandy : 0
            };
          }),
        setPokemonRating: (pokemonId, rating) =>
          set((currentState) => ({
            ratings: {
              ...currentState.ratings,
              [pokemonId]: Math.max(1, Math.min(rating, 5))
            }
          }))
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (stateToPersist) => ({
          ownedPokemonIds: stateToPersist.ownedPokemonIds,
          ownedCardsById: stateToPersist.ownedCardsById,
          rarities: stateToPersist.rarities,
          duplicateCounts: stateToPersist.duplicateCounts,
          ratings: stateToPersist.ratings,
          drawCount: stateToPersist.drawCount,
          candies: stateToPersist.candies,
          lastDrawnId: stateToPersist.lastDrawnId,
          lastDrawRarity: stateToPersist.lastDrawRarity,
          lastDrawWasDuplicate: stateToPersist.lastDrawWasDuplicate,
          lastCandyEarned: stateToPersist.lastCandyEarned,
          query: stateToPersist.query,
          page: stateToPersist.page,
          sortOrder: stateToPersist.sortOrder
        })
      }
    )
  );
};
