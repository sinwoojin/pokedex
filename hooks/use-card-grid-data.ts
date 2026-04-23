import { useQuery } from "@tanstack/react-query";
import { fetchPokemonByQuery } from "@/lib/pokemon";
import type { SortOrder } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";
import { useMemo } from "react";

const matchesLocalQuery = (pokemon: PokemonCard, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return (
    pokemon.name.toLowerCase().includes(normalizedQuery) ||
    pokemon.id.toString() === normalizedQuery ||
    pokemon.types.some((type) => type.toLowerCase().includes(normalizedQuery)) ||
    pokemon.abilities.some((ability) => ability.toLowerCase().includes(normalizedQuery)) ||
    pokemon.evolutionStages.some((stage) => stage.toLowerCase().includes(normalizedQuery))
  );
};

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

  const localSearchCards = useMemo(
    () => collectionCards.filter((pokemon) => matchesLocalQuery(pokemon, query)),
    [collectionCards, query]
  );

  const cards = useMemo(() => {
    if (isSearchMode) {
      const remoteCards = searchQuery.data ?? [];
      const mergedCards = [...localSearchCards, ...remoteCards];

      return mergedCards.filter(
        (pokemon, index, list) => list.findIndex((candidate) => candidate.id === pokemon.id) === index
      );
    }

    return collectionCards;
  }, [collectionCards, isSearchMode, localSearchCards, searchQuery.data]);

  return {
    isSearchMode,
    cards,
    total: isSearchMode ? cards.length : ownedPokemonIds.length,
    loading: isSearchMode ? searchQuery.isPending : false,
    searchError: searchQuery.error
  };
};
