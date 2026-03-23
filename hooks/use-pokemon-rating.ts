import { usePokedexStore } from "@/providers/pokedex-store-provider";

export const usePokemonRating = () => {
  const ratings = usePokedexStore((store) => store.ratings);
  const setPokemonRating = usePokedexStore((store) => store.setPokemonRating);

  return {
    getRating: (pokemonId: number) => ratings[pokemonId] ?? 0,
    ratePokemon: (pokemonId: number, score: number) => setPokemonRating(pokemonId, score)
  };
};
