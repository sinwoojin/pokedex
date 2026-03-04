"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPokemonByNameOrId, fetchPokemonPage, PokemonApiError } from "@/lib/pokemon";
import { getTypeColor } from "@/lib/pokemon-colors";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import { PAGE_SIZE } from "@/stores/pokedex-store";
import type { PokemonCard } from "@/types/pokemon";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function PokemonCardGrid() {
  const queryClient = useQueryClient();
  const query = usePokedexStore((store) => store.query);
  const page = usePokedexStore((store) => store.page);
  const nextPage = usePokedexStore((store) => store.nextPage);
  const prevPage = usePokedexStore((store) => store.prevPage);

  const [selected, setSelected] = useState<PokemonCard | null>(null);

  const pageQuery = useQuery({
    queryKey: ["pokemon-page", page, PAGE_SIZE],
    queryFn: () => fetchPokemonPage(page, PAGE_SIZE),
    enabled: !query,
    placeholderData: keepPreviousData
  });

  const searchQuery = useQuery({
    queryKey: ["pokemon-search", query],
    queryFn: () => fetchPokemonByNameOrId(query),
    enabled: Boolean(query)
  });

  const resolveErrorMessage = (currentError: unknown, isSearchMode: boolean): string | null => {
    if (!currentError) {
      return null;
    }

    if (isSearchMode && currentError instanceof PokemonApiError && currentError.status === 404) {
      return "포켓몬을 찾을 수 없습니다. 이름 또는 번호를 확인해주세요.";
    }

    return "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  };

  const cards = useMemo(() => {
    if (query) {
      return searchQuery.data ? [searchQuery.data] : [];
    }
    return pageQuery.data?.cards ?? [];
  }, [pageQuery.data?.cards, query, searchQuery.data]);

  const total = query ? (searchQuery.data ? 1 : 0) : pageQuery.data?.total ?? 0;
  const loading = query ? searchQuery.isPending : pageQuery.isPending;
  const isPageTransitionLoading = !query && pageQuery.isFetching;
  const currentError = query ? searchQuery.error : pageQuery.error;
  const error = resolveErrorMessage(currentError, Boolean(query));

  const maxPage = useMemo(() => {
    if (query) {
      return 1;
    }
    return Math.max(Math.ceil(total / PAGE_SIZE), 1);
  }, [query, total]);

  const canPrev = !query && page > 1;
  const canNext = !query && page < maxPage;

  useEffect(() => {
    if (query || !pageQuery.data || page >= maxPage) {
      return;
    }

    const nextPageNumber = page + 1;
    void queryClient.prefetchQuery({
      queryKey: ["pokemon-page", nextPageNumber, PAGE_SIZE],
      queryFn: () => fetchPokemonPage(nextPageNumber, PAGE_SIZE)
    });
  }, [maxPage, page, pageQuery.data, query, queryClient]);

  const handlePrev = () => {
    if (isPageTransitionLoading) {
      return;
    }
    prevPage();
  };

  const handleNext = () => {
    if (isPageTransitionLoading) {
      return;
    }
    nextPage();
  };

  return (
    <section>
      <div className="status-row">
        <p>{query ? "검색 결과" : `전체 ${total.toLocaleString()}마리`}</p>
        <p>{query ? "1 / 1" : `${page} / ${maxPage}`}</p>
      </div>

      {!query && (
        <div className="pager">
          <button
            type="button"
            className="ghost"
            disabled={!canPrev || isPageTransitionLoading}
            onClick={handlePrev}
          >
            이전
          </button>
          <button
            type="button"
            className="ghost"
            disabled={!canNext || isPageTransitionLoading}
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      )}

      {isPageTransitionLoading && <p className="page-loading-hint">페이지 불러오는 중...</p>}

      {error && <p className="message error">{error}</p>}

      {!error && (
        <div className="grid">
          {loading
            ? Array.from({ length: query ? 1 : PAGE_SIZE }).map((_, index) => (
                <article key={`skeleton-${index}`} className="card skeleton" data-testid="pokemon-skeleton">
                  <div className="skeleton-line skeleton-id" />
                  <div className="skeleton-image" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-chip-row">
                    <div className="skeleton-chip" />
                    <div className="skeleton-chip" />
                  </div>
                  <div className="skeleton-meta-row">
                    <div className="skeleton-meta" />
                    <div className="skeleton-meta" />
                  </div>
                </article>
              ))
            : cards.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  className="card card-button"
                  onClick={() => setSelected(pokemon)}
                  aria-label={`${pokemon.name} 카드 상세 보기`}
                  style={{ borderColor: pokemon.representativeColor }}
                >
                  <span className="id">#{pokemon.id.toString().padStart(4, "0")}</span>
                  {pokemon.imageUrl ? (
                    <Image src={pokemon.imageUrl} alt={pokemon.name} width={220} height={220} unoptimized />
                  ) : (
                    <div className="image-fallback">이미지 없음</div>
                  )}
                  <h2>{pokemon.name}</h2>
                  <ul className="type-list">
                    {pokemon.types.map((type) => (
                      <li key={type} style={{ borderColor: getTypeColor(type), color: getTypeColor(type) }}>
                        {type}
                      </li>
                    ))}
                  </ul>
                  <p className="rep-color-label">
                    대표색: <span className="swatch" style={{ background: pokemon.representativeColor }} />
                    {pokemon.speciesColor}
                  </p>
                  <dl className="meta">
                    <div>
                      <dt>키</dt>
                      <dd>{pokemon.height}</dd>
                    </div>
                    <div>
                      <dt>몸무게</dt>
                      <dd>{pokemon.weight}</dd>
                    </div>
                  </dl>
                </button>
              ))}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <article className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="ghost close-modal" onClick={() => setSelected(null)}>
              닫기
            </button>
            <div className="modal-header">
              <div>
                <p className="id">#{selected.id.toString().padStart(4, "0")}</p>
                <h3>{selected.name}</h3>
              </div>
              {selected.imageUrl ? (
                <Image src={selected.imageUrl} alt={selected.name} width={180} height={180} unoptimized />
              ) : (
                <div className="image-fallback modal-fallback">이미지 없음</div>
              )}
            </div>

            <section className="modal-section">
              <h4>타입</h4>
              <ul className="type-list">
                {selected.types.map((type) => (
                  <li key={type} style={{ borderColor: getTypeColor(type), color: getTypeColor(type) }}>
                    {type}
                  </li>
                ))}
              </ul>
            </section>

            <section className="modal-section">
              <h4>약점 타입</h4>
              <ul className="ability-list">
                {selected.weaknesses.map((weakness) => (
                  <li key={weakness.name} style={{ borderColor: weakness.color, color: weakness.color }}>
                    {weakness.name} x{weakness.multiplier}
                  </li>
                ))}
              </ul>
            </section>

            <section className="modal-section">
              <h4>특성</h4>
              <ul className="ability-list">
                {selected.abilities.map((ability) => (
                  <li key={ability}>{ability}</li>
                ))}
              </ul>
            </section>

            <section className="modal-section">
              <h4>능력치</h4>
              <ul className="stats-list">
                {selected.stats.map((stat) => (
                  <li key={stat.name}>
                    <span>{stat.name}</span>
                    <div>
                      <strong>{stat.value}</strong>
                      <progress max={255} value={stat.value} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>
      )}
    </section>
  );
}
