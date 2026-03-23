import { usePokedexStore } from "@/providers/pokedex-store-provider";

export const usePokemonGridState = () => {
  const query = usePokedexStore((store) => store.query);
  const sortOrder = usePokedexStore((store) => store.sortOrder);
  const ownedPokemonIds = usePokedexStore((store) => store.ownedPokemonIds);
  const ownedCardsById = usePokedexStore((store) => store.ownedCardsById);
  const rarities = usePokedexStore((store) => store.rarities);
  const duplicateCounts = usePokedexStore((store) => store.duplicateCounts);
  const drawCount = usePokedexStore((store) => store.drawCount);
  const candies = usePokedexStore((store) => store.candies);
  const lastDrawnId = usePokedexStore((store) => store.lastDrawnId);
  const lastDrawRarity = usePokedexStore((store) => store.lastDrawRarity);
  const lastDrawWasDuplicate = usePokedexStore((store) => store.lastDrawWasDuplicate);
  const lastCandyEarned = usePokedexStore((store) => store.lastCandyEarned);

  return {
    query,
    sortOrder,
    ownedPokemonIds,
    ownedCardsById,
    rarities,
    duplicateCounts,
    drawCount,
    candies,
    lastDrawnId,
    lastDrawRarity,
    lastDrawWasDuplicate,
    lastCandyEarned
  };
};
