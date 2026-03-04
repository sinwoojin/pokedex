"use client";

import { type ChangeEvent, FormEvent, useState } from "react";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import type { SortOrder } from "@/stores/pokedex-store";

export function PokedexHeader() {
  const query = usePokedexStore((store) => store.query);
  const setQuery = usePokedexStore((store) => store.setQuery);
  const clearQuery = usePokedexStore((store) => store.clearQuery);
  const sortOrder = usePokedexStore((store) => store.sortOrder);
  const setSortOrder = usePokedexStore((store) => store.setSortOrder);
  const [draft, setDraft] = useState(query);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(draft.trim());
  };

  const onReset = () => {
    setDraft("");
    clearQuery();
  };

  const onSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder);
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
          placeholder="이름/번호 검색 (예: 피카츄, 피, pikachu, 25)"
        />
        <button type="submit">검색</button>
        <button type="button" className="ghost" onClick={onReset}>
          초기화
        </button>
        <label className="sort-wrap">
          도감번호
          <select value={sortOrder} onChange={onSortChange} aria-label="도감번호 정렬">
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </label>
      </form>
    </header>
  );
}
