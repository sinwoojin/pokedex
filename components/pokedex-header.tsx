"use client";

import { FormEvent, useState } from "react";
import { usePokedexStore } from "@/providers/pokedex-store-provider";

export function PokedexHeader() {
  const query = usePokedexStore((store) => store.query);
  const setQuery = usePokedexStore((store) => store.setQuery);
  const clearQuery = usePokedexStore((store) => store.clearQuery);
  const [draft, setDraft] = useState(query);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(draft.trim());
  };

  const onReset = () => {
    setDraft("");
    clearQuery();
  };

  return (
    <header className="header">
      <div>
        <p className="eyebrow">POKEDEX</p>
        <h1>포켓몬 카드 도감</h1>
      </div>

      <form className="search-form" onSubmit={onSubmit}>
        <input
          aria-label="포켓몬 검색"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="이름 또는 번호 (예: pikachu, 25)"
        />
        <button type="submit">검색</button>
        <button type="button" className="ghost" onClick={onReset}>
          초기화
        </button>
      </form>
    </header>
  );
}
