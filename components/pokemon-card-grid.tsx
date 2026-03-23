"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getDuplicateCandyReward,
  getGachaRarityColor,
  getGachaRarityLabel,
  rollGachaRarity,
  type GachaRarity
} from "@/lib/gacha";
import { fetchPokemonByQuery, fetchPokemonTotalCount, PokemonApiError } from "@/lib/pokemon";
import { getTypeColor } from "@/lib/pokemon-colors";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import type { PokemonCard } from "@/types/pokemon";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type DrawResult = {
  card: PokemonCard;
  rarity: GachaRarity;
  duplicateCandy: number;
};

type RevealState =
  | { phase: "idle" }
  | { phase: "rolling" }
  | { phase: "revealed"; result: DrawResult };

export function PokemonCardGrid() {
  const query = usePokedexStore((store) => store.query);
  const sortOrder = usePokedexStore((store) => store.sortOrder);
  const ownedPokemonIds = usePokedexStore((store) => store.ownedPokemonIds);
  const ownedCardsById = usePokedexStore((store) => store.ownedCardsById);
  const rarities = usePokedexStore((store) => store.rarities);
  const duplicateCounts = usePokedexStore((store) => store.duplicateCounts);
  const ratings = usePokedexStore((store) => store.ratings);
  const drawCount = usePokedexStore((store) => store.drawCount);
  const candies = usePokedexStore((store) => store.candies);
  const lastDrawnId = usePokedexStore((store) => store.lastDrawnId);
  const lastDrawRarity = usePokedexStore((store) => store.lastDrawRarity);
  const lastDrawWasDuplicate = usePokedexStore((store) => store.lastDrawWasDuplicate);
  const lastCandyEarned = usePokedexStore((store) => store.lastCandyEarned);
  const recordGachaDraw = usePokedexStore((store) => store.recordGachaDraw);
  const setPokemonRating = usePokedexStore((store) => store.setPokemonRating);
  const isSearchMode = Boolean(query);

  const [selected, setSelected] = useState<PokemonCard | null>(null);
  const [revealState, setRevealState] = useState<RevealState>({ phase: "idle" });
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  const totalQuery = useQuery({
    queryKey: ["pokemon-pool-total"],
    queryFn: fetchPokemonTotalCount
  });

  const searchQuery = useQuery({
    queryKey: ["pokemon-search", sortOrder, query],
    queryFn: () => fetchPokemonByQuery(query, sortOrder),
    enabled: isSearchMode
  });

  const drawMutation = useMutation({
    mutationFn: async (): Promise<DrawResult> => {
      const total = totalQuery.data;
      if (!total || total < 1) {
        throw new Error("가챠 풀 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      }
      const randomPokemonId = Math.floor(Math.random() * total) + 1;
      const drawResult = await fetchPokemonByQuery(String(randomPokemonId), sortOrder);
      const drawnCard = drawResult[0];

      if (!drawnCard) {
        throw new Error("가챠 결과를 불러오지 못했습니다.");
      }

      const rarity = rollGachaRarity();

      return {
        card: drawnCard,
        rarity,
        duplicateCandy: getDuplicateCandyReward(rarity)
      };
    },
    onMutate: () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      setRevealState({ phase: "rolling" });
    },
    onSuccess: (result) => {
      recordGachaDraw(result.card, result.rarity, result.duplicateCandy);
      setSelected(result.card);
      setRevealState({ phase: "revealed", result });

      revealTimerRef.current = setTimeout(() => {
        setRevealState({ phase: "idle" });
      }, 2200);
    },
    onError: () => {
      setRevealState({ phase: "idle" });
    }
  });

  const resolveErrorMessage = (currentError: unknown, searchMode: boolean): string | null => {
    if (!currentError) {
      return null;
    }

    if (searchMode && currentError instanceof PokemonApiError && currentError.status === 404) {
      return "포켓몬을 찾을 수 없습니다. 이름 또는 번호를 확인해주세요.";
    }

    return "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  };

  const collectionCards = useMemo(
    () => ownedPokemonIds.map((id) => ownedCardsById[id]).filter((pokemon): pokemon is PokemonCard => Boolean(pokemon)),
    [ownedPokemonIds, ownedCardsById]
  );

  const cards = useMemo(() => {
    if (isSearchMode) {
      return searchQuery.data ?? [];
    }

    return collectionCards;
  }, [collectionCards, isSearchMode, searchQuery.data]);

  const total = isSearchMode ? cards.length : ownedPokemonIds.length;
  const loading = isSearchMode ? searchQuery.isPending : false;
  const currentError = isSearchMode ? searchQuery.error : totalQuery.error;
  const error = resolveErrorMessage(currentError, isSearchMode);
  const gachaError = drawMutation.error ? resolveErrorMessage(drawMutation.error, false) : null;
  const lastDrawnName = lastDrawnId ? ownedCardsById[lastDrawnId]?.name ?? `No.${lastDrawnId}` : null;

  const renderRatingButtons = (pokemon: PokemonCard, owned: boolean) => {
    const currentRating = ratings[pokemon.id] ?? 0;

    return (
      <div className="rating-row" role="group" aria-label={`${pokemon.name} 평점`}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={`${pokemon.id}-rating-${score}`}
            type="button"
            className="rating-star"
            onClick={() => setPokemonRating(pokemon.id, score)}
            disabled={!owned}
            aria-label={`${pokemon.name} ${score}점`}
            aria-pressed={currentRating === score}
          >
            {score <= currentRating ? "★" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="collection-shell">
      <div className="collection-toolbar">
        <p className="collection-title">{isSearchMode ? "검색 결과" : "가챠 수집 도감"}</p>
        <p className="collection-count">{isSearchMode ? `${total.toLocaleString()}장` : `보유 ${total.toLocaleString()}종`}</p>
      </div>

      {!isSearchMode && (
        <div className="gacha-panel">
          <button
            type="button"
            className="gacha-button"
            onClick={() => drawMutation.mutate()}
            disabled={drawMutation.isPending || totalQuery.isPending}
          >
            {drawMutation.isPending ? "가챠 뽑는 중..." : "가챠 뽑기"}
          </button>
          <p className="gacha-meta">총 뽑기 {drawCount.toLocaleString()}회</p>
          <p className="gacha-meta">보유 캔디 {candies.toLocaleString()}개</p>
          {lastDrawnName && <p className="gacha-recent">최근 획득: {lastDrawnName}</p>}
          {lastDrawRarity && <p className="gacha-recent">최근 등급: {getGachaRarityLabel(lastDrawRarity)}</p>}
          {lastDrawWasDuplicate && <p className="gacha-recent">중복 보상: +{lastCandyEarned} 캔디</p>}
          {gachaError && <p className="message error">{gachaError}</p>}

          {revealState.phase === "rolling" && (
            <div className="gacha-reveal gacha-reveal-rolling" role="status" aria-live="polite">
              <span className="gacha-orb" aria-hidden="true" />
              <p>캡슐을 개봉하는 중...</p>
            </div>
          )}

          {revealState.phase === "revealed" && (
            <div className="gacha-reveal gacha-reveal-result" role="status" aria-live="polite">
              <p>
                {revealState.result.card.name} 등장! ({getGachaRarityLabel(revealState.result.rarity)})
              </p>
            </div>
          )}
        </div>
      )}

      {isSearchMode && <p className="collection-mode-hint">검색 모드: 필터된 카드만 표시됩니다.</p>}

      {error && <p className="message error">{error}</p>}

      {!error && isSearchMode && !loading && cards.length === 0 && (
        <p className="message">검색 결과가 없습니다. 다른 키워드로 시도해주세요.</p>
      )}

      {!error && (
        <div className="collection-grid-wrapper">
          <div className="collection-grid">
            {loading
              ? Array.from({ length: 1 }).map((_, index) => (
                  <article key={`skeleton-${index}`} className="card skeleton" data-testid="pokemon-skeleton">
                    <div className="skeleton-line skeleton-id" />
                    <div className="skeleton-image" />
                    <div className="skeleton-title" />
                    <div className="skeleton-chip-row">
                      <div className="skeleton-chip" />
                      <div className="skeleton-chip" />
                    </div>
                  </article>
                ))
              : cards.map((pokemon) => {
                  const owned = ownedPokemonIds.includes(pokemon.id);
                  const rarity = rarities[pokemon.id];
                  const duplicateCount = duplicateCounts[pokemon.id] ?? 0;

                  return (
                    <article key={pokemon.id} className="card" style={{ borderColor: pokemon.representativeColor }}>
                      <button
                        type="button"
                        className="card-detail-button"
                        onClick={() => setSelected(pokemon)}
                        aria-label={`${pokemon.name} 카드 상세 보기`}
                      >
                        <span className="id">#{pokemon.id.toString().padStart(4, "0")}</span>
                        {pokemon.imageUrl ? (
                          <Image src={pokemon.imageUrl} alt={pokemon.name} width={240} height={240} unoptimized />
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
                        {rarity && (
                          <p className="rarity-badge" style={{ borderColor: getGachaRarityColor(rarity) }}>
                            {getGachaRarityLabel(rarity)}
                          </p>
                        )}
                      </button>

                      <div className="card-footer">
                        <p className="duplicate-label">중복 획득 {duplicateCount}회</p>
                        <p className="rating-label">평점</p>
                        {renderRatingButtons(pokemon, owned)}
                        {!owned && <p className="rating-hint">가챠로 획득한 카드만 평점 가능</p>}
                      </div>
                    </article>
                  );
                })}
          </div>

          {!isSearchMode && !cards.length && <p className="collection-loading-text">가챠를 돌려 첫 카드를 수집해보세요.</p>}
          {!isSearchMode && !!cards.length && <p className="collection-complete">수집 중</p>}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <article className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="ghost close-modal" onClick={() => setSelected(null)}>
              닫기
            </button>
            <div className="modal-main-grid">
              <div className="modal-left">
                {selected.imageUrl ? (
                  <Image src={selected.imageUrl} alt={selected.name} width={360} height={360} unoptimized />
                ) : (
                  <div className="image-fallback modal-fallback">이미지 없음</div>
                )}
              </div>

              <div className="modal-right">
                <div className="modal-header">
                  <div>
                    <p className="id">#{selected.id.toString().padStart(4, "0")}</p>
                    <h3>{selected.name}</h3>
                  </div>
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
                  <h4>평점</h4>
                  {renderRatingButtons(selected, ownedPokemonIds.includes(selected.id))}
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
              </div>
            </div>

            <section className="modal-section">
              <h4>진화 과정</h4>
              <ul className="evolution-list">
                {selected.evolutionStages.map((stage, index) => (
                  <li key={`${stage}-${index}`}>
                    <span>{stage}</span>
                    {index < selected.evolutionStages.length - 1 && <em>→</em>}
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
