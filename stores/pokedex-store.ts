import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { GachaRarity } from "@/lib/gacha";
import type { PokemonCard } from "@/types/pokemon";

export const PAGE_SIZE = 12;

export type SortOrder = "asc" | "desc";

export type CommunityBoard = "meta" | "strategy" | "qna";
export type CommunityFeedFilter = CommunityBoard | "all";
export type CommunitySortOrder = "latest" | "likes" | "comments";

export type CommunitySavedView = {
  id: string;
  name: string;
  filter: CommunityFeedFilter;
  relatedPokemon: string;
  sortOrder: CommunitySortOrder;
  query: string;
};

export type CommunityComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  board: CommunityBoard;
  author: string;
  title: string;
  content: string;
  relatedPokemon: string;
  tags: string[];
  likes: number;
  createdAt: string;
  pinned: boolean;
  comments: CommunityComment[];
};

export type PokedexState = {
  query: string;
  page: number;
  sortOrder: SortOrder;
  ownedPokemonIds: number[];
  ownedCardsById: Record<number, PokemonCard>;
  rarities: Record<number, GachaRarity>;
  duplicateCounts: Record<number, number>;
  ratings: Record<number, number>;
  drawCount: number;
  candies: number;
  lastDrawnId: number | null;
  lastDrawRarity: GachaRarity | null;
  lastDrawWasDuplicate: boolean;
  lastCandyEarned: number;
  communityPosts: CommunityPost[];
  likedCommunityPostIds: string[];
  activeCommunityFilter: CommunityFeedFilter;
  activeRelatedPokemonFilter: string;
  activeCommunitySort: CommunitySortOrder;
  activeCommunityQuery: string;
  savedCommunityViews: CommunitySavedView[];
};

export type PokedexActions = {
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setPage: (page: number) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  nextPage: () => void;
  prevPage: () => void;
  recordGachaDraw: (card: PokemonCard, rarity: GachaRarity, duplicateCandy: number) => void;
  setPokemonRating: (pokemonId: number, rating: number) => void;
  createCommunityPost: (input: {
    board: CommunityBoard;
    title: string;
    content: string;
    relatedPokemon: string;
    tags: string[];
  }) => void;
  setActiveCommunityFilter: (filter: CommunityFeedFilter) => void;
  setActiveRelatedPokemonFilter: (pokemonName: string) => void;
  setActiveCommunitySort: (sortOrder: CommunitySortOrder) => void;
  setActiveCommunityQuery: (query: string) => void;
  saveCurrentCommunityView: (name: string) => void;
  applySavedCommunityView: (viewId: string) => void;
  removeSavedCommunityView: (viewId: string) => void;
  toggleCommunityPostLike: (postId: string) => void;
  toggleCommunityPostPinned: (postId: string) => void;
  addCommunityComment: (postId: string, content: string) => void;
};

export type PokedexStore = PokedexState & PokedexActions;

const seedCommunityPosts: CommunityPost[] = [
  {
    id: "seed-meta-1",
    board: "meta",
    author: "메타연구원",
    title: "요즘 포챔스에서 자주 거론되는 전기 타입 정리",
    content:
      "피카츄처럼 인지도가 높은 포켓몬부터 체감 좋은 전기 타입까지, 약점 대응이 쉬운지 같이 보면서 정리해보면 좋겠습니다.",
    relatedPokemon: "피카츄",
    tags: ["전기", "메타", "카운터"],
    likes: 12,
    createdAt: "오늘 09:10",
    pinned: true,
    comments: [
      {
        id: "seed-meta-1-comment-1",
        author: "밸런스체커",
        content: "전기 타입은 땅 견제 루트까지 같이 보면 더 좋을 것 같아요.",
        createdAt: "오늘 09:24"
      }
    ]
  },
  {
    id: "seed-strategy-1",
    board: "strategy",
    author: "실전트레이너",
    title: "카운터 픽 볼 때 약점 타입이 확실히 체감됩니다",
    content:
      "상세 모달에서 약점 타입이랑 기본 스탯 브리핑을 같이 보는 식으로 체크하니, 실전에서 어떤 포켓몬을 의식해야 하는지 정리가 빨랐습니다.",
    relatedPokemon: "리자몽",
    tags: ["카운터", "운용", "약점"],
    likes: 8,
    createdAt: "오늘 11:42",
    pinned: false,
    comments: []
  },
  {
    id: "seed-qna-1",
    board: "qna",
    author: "뉴비트레이너",
    title: "입문자는 어떤 포켓몬부터 정보 정리하면 좋을까요?",
    content:
      "검색이랑 랜덤 추천이 둘 다 있어서 좋긴 한데, 처음 보는 사람 기준으로 우선순위를 어떻게 잡으면 좋은지 궁금합니다.",
    relatedPokemon: "이브이",
    tags: ["입문", "질문", "추천"],
    likes: 5,
    createdAt: "오늘 13:05",
    pinned: false,
    comments: [
      {
        id: "seed-qna-1-comment-1",
        author: "도감가이드",
        content: "검색으로 익숙한 포켓몬부터 보고, 그 다음 랜덤 추천으로 메타 감각을 넓히는 방식이 무난해요.",
        createdAt: "오늘 13:18"
      }
    ]
  }
];

const defaultState: PokedexState = {
  query: "",
  page: 1,
  sortOrder: "asc",
  ownedPokemonIds: [],
  ownedCardsById: {},
  rarities: {},
  duplicateCounts: {},
  ratings: {},
  drawCount: 0,
  candies: 0,
  lastDrawnId: null,
  lastDrawRarity: null,
  lastDrawWasDuplicate: false,
  lastCandyEarned: 0,
  communityPosts: seedCommunityPosts,
  likedCommunityPostIds: [],
  activeCommunityFilter: "all",
  activeRelatedPokemonFilter: "all",
  activeCommunitySort: "latest",
  activeCommunityQuery: "",
  savedCommunityViews: [
    {
      id: "seed-view-meta",
      name: "메타 집중",
      filter: "meta",
      relatedPokemon: "all",
      sortOrder: "likes",
      query: ""
    },
    {
      id: "seed-view-qna",
      name: "입문 질문",
      filter: "qna",
      relatedPokemon: "all",
      sortOrder: "comments",
      query: ""
    }
  ]
};

const STORAGE_KEY = "pokemon-card-community-store-v2";

export const createPokedexStore = (initState: Partial<PokedexState> = {}) => {
  const state = {
    ...defaultState,
    ...initState
  };

  return createStore<PokedexStore>()(
    persist(
      (set) => ({
        ...state,
        setQuery: (query) => set({ query, page: 1 }),
        clearQuery: () => set({ query: "", page: 1 }),
        setPage: (page) => set({ page: Math.max(page, 1) }),
        setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
        setActiveCommunityFilter: (activeCommunityFilter) => set({ activeCommunityFilter }),
        setActiveRelatedPokemonFilter: (activeRelatedPokemonFilter) => set({ activeRelatedPokemonFilter }),
        setActiveCommunitySort: (activeCommunitySort) => set({ activeCommunitySort }),
        setActiveCommunityQuery: (activeCommunityQuery) => set({ activeCommunityQuery }),
        nextPage: () => set((currentState) => ({ page: currentState.page + 1 })),
        prevPage: () => set((currentState) => ({ page: Math.max(currentState.page - 1, 1) })),
        recordGachaDraw: (card, rarity, duplicateCandy) =>
          set((currentState) => {
            const pokemonId = card.id;
            const alreadyOwned = currentState.ownedPokemonIds.includes(pokemonId);
            const existingRarity = currentState.rarities[pokemonId];

            return {
              ownedPokemonIds: alreadyOwned
                ? currentState.ownedPokemonIds
                : [...currentState.ownedPokemonIds, pokemonId],
              ownedCardsById: {
                ...currentState.ownedCardsById,
                [pokemonId]: card
              },
              rarities: {
                ...currentState.rarities,
                [pokemonId]: existingRarity ?? rarity
              },
              duplicateCounts: {
                ...currentState.duplicateCounts,
                [pokemonId]: (currentState.duplicateCounts[pokemonId] ?? 0) + (alreadyOwned ? 1 : 0)
              },
              drawCount: currentState.drawCount + 1,
              candies: currentState.candies + (alreadyOwned ? duplicateCandy : 0),
              lastDrawnId: pokemonId,
              lastDrawRarity: rarity,
              lastDrawWasDuplicate: alreadyOwned,
              lastCandyEarned: alreadyOwned ? duplicateCandy : 0
            };
          }),
        setPokemonRating: (pokemonId, rating) =>
          set((currentState) => ({
            ratings: {
              ...currentState.ratings,
              [pokemonId]: Math.max(1, Math.min(rating, 5))
            }
          })),
        createCommunityPost: ({ board, title, content, relatedPokemon, tags }) =>
          set((currentState) => {
            const normalizedTitle = title.trim();
            const normalizedContent = content.trim();
            const normalizedPokemon = relatedPokemon.trim();
            const normalizedTags = tags
              .map((tag) => tag.trim())
              .filter(Boolean)
              .slice(0, 4);

            if (!normalizedTitle || !normalizedContent) {
              return currentState;
            }

            const post: CommunityPost = {
              id: `post-${Date.now()}`,
              board,
              author: "로컬트레이너",
              title: normalizedTitle,
              content: normalizedContent,
              relatedPokemon: normalizedPokemon || "미지정",
              tags: normalizedTags.length ? normalizedTags : [normalizedPokemon || "자유주제", board],
              likes: 0,
              createdAt: "방금 전",
              pinned: false,
              comments: []
            };

            return {
              communityPosts: [post, ...currentState.communityPosts]
            };
          }),
        saveCurrentCommunityView: (name) =>
          set((currentState) => {
            const normalizedName = name.trim();

            if (!normalizedName) {
              return currentState;
            }

            return {
              savedCommunityViews: [
                {
                  id: `view-${Date.now()}`,
                  name: normalizedName,
                  filter: currentState.activeCommunityFilter,
                  relatedPokemon: currentState.activeRelatedPokemonFilter,
                  sortOrder: currentState.activeCommunitySort,
                  query: currentState.activeCommunityQuery
                },
                ...currentState.savedCommunityViews
              ]
            };
          }),
        applySavedCommunityView: (viewId) =>
          set((currentState) => {
            const selectedView = currentState.savedCommunityViews.find((view) => view.id === viewId);

            if (!selectedView) {
              return currentState;
            }

            return {
              activeCommunityFilter: selectedView.filter,
              activeRelatedPokemonFilter: selectedView.relatedPokemon,
              activeCommunitySort: selectedView.sortOrder,
              activeCommunityQuery: selectedView.query
            };
          }),
        removeSavedCommunityView: (viewId) =>
          set((currentState) => ({
            savedCommunityViews: currentState.savedCommunityViews.filter((view) => view.id !== viewId)
          })),
        toggleCommunityPostLike: (postId) =>
          set((currentState) => {
            const alreadyLiked = currentState.likedCommunityPostIds.includes(postId);

            return {
              likedCommunityPostIds: alreadyLiked
                ? currentState.likedCommunityPostIds.filter((id) => id !== postId)
                : [...currentState.likedCommunityPostIds, postId],
              communityPosts: currentState.communityPosts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      likes: Math.max(0, post.likes + (alreadyLiked ? -1 : 1))
                    }
                  : post
              )
            };
          }),
        toggleCommunityPostPinned: (postId) =>
          set((currentState) => ({
            communityPosts: currentState.communityPosts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    pinned: !post.pinned
                  }
                : post
            )
          })),
        addCommunityComment: (postId, content) =>
          set((currentState) => {
            const normalizedContent = content.trim();

            if (!normalizedContent) {
              return currentState;
            }

            return {
              communityPosts: currentState.communityPosts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      comments: [
                        ...post.comments,
                        {
                          id: `comment-${postId}-${Date.now()}`,
                          author: "로컬트레이너",
                          content: normalizedContent,
                          createdAt: "방금 전"
                        }
                      ]
                    }
                  : post
              )
            };
          })
      }),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (stateToPersist) => ({
          ownedPokemonIds: stateToPersist.ownedPokemonIds,
          ownedCardsById: stateToPersist.ownedCardsById,
          rarities: stateToPersist.rarities,
          duplicateCounts: stateToPersist.duplicateCounts,
          ratings: stateToPersist.ratings,
          drawCount: stateToPersist.drawCount,
          candies: stateToPersist.candies,
          lastDrawnId: stateToPersist.lastDrawnId,
          lastDrawRarity: stateToPersist.lastDrawRarity,
          lastDrawWasDuplicate: stateToPersist.lastDrawWasDuplicate,
          lastCandyEarned: stateToPersist.lastCandyEarned,
          communityPosts: stateToPersist.communityPosts,
          likedCommunityPostIds: stateToPersist.likedCommunityPostIds,
          activeCommunityFilter: stateToPersist.activeCommunityFilter,
          activeRelatedPokemonFilter: stateToPersist.activeRelatedPokemonFilter,
          activeCommunitySort: stateToPersist.activeCommunitySort,
          activeCommunityQuery: stateToPersist.activeCommunityQuery,
          savedCommunityViews: stateToPersist.savedCommunityViews,
          query: stateToPersist.query,
          page: stateToPersist.page,
          sortOrder: stateToPersist.sortOrder
        })
      }
    )
  );
};
