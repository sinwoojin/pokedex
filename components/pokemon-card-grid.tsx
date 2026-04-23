"use client";

import { useCardGridData } from "@/hooks/use-card-grid-data";
import { usePokemonErrorMessage } from "@/hooks/use-pokemon-error-message";
import { useGachaDraw } from "@/hooks/use-gacha-draw";
import { usePokemonGridState } from "@/hooks/use-pokemon-grid-state";
import { usePokemonModal } from "@/hooks/use-pokemon-modal";
import { usePokemonRating } from "@/hooks/use-pokemon-rating";
import { getGachaRarityColor, getGachaRarityLabel } from "@/lib/gacha";
import { getTypeColor } from "@/lib/pokemon-colors";
import type { PokemonCard } from "@/types/pokemon";
import Image from "next/image";

export function PokemonCardGrid() {
  const {
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
  } = usePokemonGridState();

  const { selected, openModal, closeModal } = usePokemonModal();
  const { getRating, ratePokemon } = usePokemonRating();
  const { resolveErrorMessage } = usePokemonErrorMessage();

  const {
    isSearchMode,
    cards,
    total,
    loading,
    searchError
  } = useCardGridData({
    query,
    sortOrder,
    ownedPokemonIds,
    ownedCardsById
  });

  const { draw, isDrawing, drawError, poolError, isPoolPending, revealState } = useGachaDraw({
    sortOrder,
    onDrawSuccess: openModal
  });

  const currentError = isSearchMode ? searchError : poolError;
  const error = resolveErrorMessage(currentError, isSearchMode);
  const gachaError = drawError ? resolveErrorMessage(drawError, false) : null;
  const lastDrawnName = lastDrawnId ? ownedCardsById[lastDrawnId]?.name ?? `No.${lastDrawnId}` : null;

  const renderRatingButtons = (pokemon: PokemonCard, owned: boolean) => {
    const currentRating = getRating(pokemon.id);

    return (
      <div className="rating-row" role="group" aria-label={`${pokemon.name} 평점`}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={`${pokemon.id}-rating-${score}`}
            type="button"
            className="rating-star"
            onClick={() => ratePokemon(pokemon.id, score)}
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
        <p className="collection-title">{isSearchMode ? "검색된 포켓몬 토픽" : "실시간 포켓몬 정보 아카이브"}</p>
        <p className="collection-count">{isSearchMode ? `${total.toLocaleString()}건` : `추천 기록 ${total.toLocaleString()}종`}</p>
      </div>

      {!isSearchMode && (
        <div className="gacha-panel">
          <button
            type="button"
            className="gacha-button"
            onClick={draw}
            disabled={isDrawing || isPoolPending}
          >
            {isDrawing ? "핫픽 불러오는 중..." : "핫픽 랜덤 추천"}
          </button>
          <p className="gacha-meta">누적 추천 열람 {drawCount.toLocaleString()}회</p>
          <p className="gacha-meta">커뮤니티 분석 포인트 {candies.toLocaleString()}P</p>
          {lastDrawnName && <p className="gacha-recent">최근 화제 포켓몬: {lastDrawnName}</p>}
          {lastDrawRarity && <p className="gacha-recent">현재 주목도: {getGachaRarityLabel(lastDrawRarity)}</p>}
          {lastDrawWasDuplicate && <p className="gacha-recent">재언급 보너스: +{lastCandyEarned}P</p>}
          {gachaError && <p className="message error">{gachaError}</p>}

          {revealState.phase === "rolling" && (
            <div className="gacha-reveal gacha-reveal-rolling" role="status" aria-live="polite">
              <span className="gacha-orb" aria-hidden="true" />
              <p>오늘의 핫픽을 불러오는 중...</p>
            </div>
          )}

          {revealState.phase === "revealed" && (
            <div className="gacha-reveal gacha-reveal-result" role="status" aria-live="polite">
              <p>
                {revealState.result.card.name} 토픽 오픈! (주목도 {getGachaRarityLabel(revealState.result.rarity)})
              </p>
            </div>
          )}
        </div>
      )}

      {isSearchMode && <p className="collection-mode-hint">검색 모드: 조건에 맞는 포켓몬 정보 글감만 모아 보여줍니다.</p>}

      {error && <p className="message error">{error}</p>}

      {!error && isSearchMode && !loading && cards.length === 0 && (
        <p className="message">검색된 포켓몬 토픽이 없습니다. 다른 이름이나 타입 키워드로 시도해주세요.</p>
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
                        onClick={() => openModal(pokemon)}
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
                          대표 컬러: <span className="swatch" style={{ background: pokemon.representativeColor }} />
                          {pokemon.speciesColor}
                        </p>
                        {rarity && (
                          <p className="rarity-badge" style={{ borderColor: getGachaRarityColor(rarity) }}>
                            주목도 {getGachaRarityLabel(rarity)}
                          </p>
                        )}
                      </button>

                      <div className="card-footer">
                        <p className="duplicate-label">커뮤니티 언급 {duplicateCount}회</p>
                        <p className="rating-label">커뮤니티 평점</p>
                        {renderRatingButtons(pokemon, owned)}
                        {!owned && <p className="rating-hint">랜덤 추천으로 열린 포켓몬부터 평점을 남길 수 있습니다.</p>}
                      </div>
                    </article>
                  );
                })}
          </div>

          {!isSearchMode && !cards.length && <p className="collection-loading-text">핫픽 랜덤 추천으로 첫 포켓몬 이슈를 열어보세요.</p>}
          {!isSearchMode && !!cards.length && <p className="collection-complete">커뮤니티 흐름 추적 중</p>}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <article className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="ghost close-modal" onClick={closeModal}>
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
                  <h4>핵심 타입</h4>
                  <ul className="type-list">
                    {selected.types.map((type) => (
                      <li key={type} style={{ borderColor: getTypeColor(type), color: getTypeColor(type) }}>
                        {type}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="modal-section">
                  <h4>커뮤니티 평점</h4>
                  {renderRatingButtons(selected, ownedPokemonIds.includes(selected.id))}
                </section>

                <section className="modal-section">
                  <h4>카운터 체크</h4>
                  <ul className="ability-list">
                    {selected.weaknesses.map((weakness) => (
                      <li key={weakness.name} style={{ borderColor: weakness.color, color: weakness.color }}>
                        {weakness.name} x{weakness.multiplier}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="modal-section">
                  <h4>자주 언급되는 특성</h4>
                  <ul className="ability-list">
                    {selected.abilities.map((ability) => (
                      <li key={ability}>{ability}</li>
                    ))}
                  </ul>
                </section>

                <section className="modal-section">
                  <h4>기본 스탯 브리핑</h4>
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
              <h4>운용 루트 / 진화 과정</h4>
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
