"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import {
  createPokedexStore,
  type PokedexState,
  type PokedexStore
} from "@/stores/pokedex-store";

const PokedexStoreContext = createContext<ReturnType<typeof createPokedexStore> | undefined>(undefined);

type PokedexStoreProviderProps = {
  children: ReactNode;
  initState?: Partial<PokedexState>;
};

export function PokedexStoreProvider({ children, initState }: PokedexStoreProviderProps) {
  const [store] = useState(() => createPokedexStore(initState));

  return <PokedexStoreContext.Provider value={store}>{children}</PokedexStoreContext.Provider>;
}

export function usePokedexStore<T>(selector: (store: PokedexStore) => T): T {
  const context = useContext(PokedexStoreContext);
  if (!context) {
    throw new Error("usePokedexStore must be used within PokedexStoreProvider");
  }
  return useStore(context, selector);
}
