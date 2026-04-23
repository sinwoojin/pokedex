"use client";

import { type ChangeEvent, FormEvent, useState } from "react";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import type { SortOrder } from "@/stores/pokedex-store";

export function PokedexHeader() {
  const trendingTopics = ["포챔스 메타", "카운터 픽", "실전 후기", "입문 질문"] as const;

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
      <div className="header-copy-block">
        <p className="eyebrow">POKE COMMUNITY</p>
        <h1>포챔스 이슈를 모아보는 포켓몬 정보 공유 커뮤니티</h1>
        <p className="header-subtitle">
          메타에서 자주 언급되는 포켓몬을 검색하고, 랜덤 추천으로 흐름을 훑고, 커뮤니티 감각으로
          평점을 남길 수 있게 구성했습니다.
        </p>

        <ul className="topic-chip-list" aria-label="주요 커뮤니티 주제">
          {trendingTopics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>

      <form className="search-form" onSubmit={onSubmit}>
        <input
          aria-label="포켓몬 커뮤니티 검색"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="포켓몬명·번호·메타 키워드 검색 (예: 피카츄, 25, 전기)"
        />
        <button type="submit">토픽 찾기</button>
        <button type="button" className="ghost" onClick={onReset}>
          필터 초기화
        </button>
        <label className="sort-wrap">
          정렬
          <select value={sortOrder} onChange={onSortChange} aria-label="커뮤니티 목록 정렬">
            <option value="asc">도감순</option>
            <option value="desc">역순</option>
          </select>
        </label>
      </form>
    </header>
  );
}
