import type { PokemonCard } from "@/types/pokemon";
import { useState } from "react";

export const usePokemonModal = () => {
  const [selected, setSelected] = useState<PokemonCard | null>(null);

  return {
    selected,
    openModal: (pokemon: PokemonCard) => setSelected(pokemon),
    closeModal: () => setSelected(null)
  };
};
