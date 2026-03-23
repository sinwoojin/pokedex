import { useQuery } from "@tanstack/react-query";
import { fetchPokemonByQuery } from "@/lib/pokemon";
import type { SortOrder } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";
import { useMemo } from "react";

type UseCardGridDataParams = {
  query: string;
  sortOrder: SortOrder;
  ownedPokemonIds: number[];
  ownedCardsById: Record<number, PokemonCard>;
};

export const useCardGridData = ({ query, sortOrder, ownedPokemonIds, ownedCardsById }: UseCardGridDataParams) => {
  const isSearchMode = Boolean(query);

  const searchQuery = useQuery({
    queryKey: ["pokemon-search", sortOrder, query],
    queryFn: () => fetchPokemonByQuery(query, sortOrder),
    enabled: isSearchMode
  });

  const collectionCards = useMemo(
    () => ownedPokemonIds.map((id) => ownedCardsById[id]).filter((pokemon): pokemon is PokemonCard => Boolean(pokemon)),
    [ownedPokemonIds, ownedCardsById]
  );

  const cards = useMemo(() => {
    if (isSearchMode) {
      return searchQuery.data ?? [];
    }

    return collectionCards;
  }, [collectionCards, isSearchMode, searchQuery.data]);

  return {
    isSearchMode,
    cards,
    total: isSearchMode ? cards.length : ownedPokemonIds.length,
    loading: isSearchMode ? searchQuery.isPending : false,
    searchError: searchQuery.error
  };
};
