"use client";

import { PokedexHeader } from "@/components/pokedex-header";
import { PokemonCardGrid } from "@/components/pokemon-card-grid";
import { PokedexStoreProvider } from "@/providers/pokedex-store-provider";

export default function HomePage() {
  return (
    <PokedexStoreProvider>
      <main className="page-shell">
        <div className="glow glow-a" aria-hidden="true" />
        <div className="glow glow-b" aria-hidden="true" />
        <PokedexHeader />
        <PokemonCardGrid />
      </main>
    </PokedexStoreProvider>
  );
}
