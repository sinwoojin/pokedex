"use client";

import {
  addCommunityCommentRequest,
  createCommunityPostRequest,
  isCommunityApiEnabled,
  listCommunityPosts,
  toggleCommunityPostLikeRequest,
  toggleCommunityPostPinnedRequest
} from "@/lib/community-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePokedexStore } from "@/providers/pokedex-store-provider";
import type { CommunityBoard, CommunityFeedFilter, CommunitySortOrder } from "@/stores/pokedex-store";

const boardLabels: Record<CommunityBoard, string> = {
  meta: "메타 브리핑",
  strategy: "육성·운용 공유",
  qna: "질문 / 답변"
};

const boardFilterOptions: Array<{ value: CommunityFeedFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "meta", label: "메타" },
  { value: "strategy", label: "운용" },
  { value: "qna", label: "질문" }
];

const matchesCommunityQuery = (post: {
  author: string;
  title: string;
  content: string;
  relatedPokemon: string;
  tags: string[];
}, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return (
    post.author.toLowerCase().includes(normalizedQuery) ||
    post.title.toLowerCase().includes(normalizedQuery) ||
    post.content.toLowerCase().includes(normalizedQuery) ||
    post.relatedPokemon.toLowerCase().includes(normalizedQuery) ||
    post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
};

export function CommunityFeed() {
  const posts = usePokedexStore((store) => store.communityPosts);
  const likedPostIds = usePokedexStore((store) => store.likedCommunityPostIds);
  const activeFilter = usePokedexStore((store) => store.activeCommunityFilter);
  const activeRelatedPokemonFilter = usePokedexStore((store) => store.activeRelatedPokemonFilter);
  const activeCommunitySort = usePokedexStore((store) => store.activeCommunitySort);
  const activeCommunityQuery = usePokedexStore((store) => store.activeCommunityQuery);
  const savedCommunityViews = usePokedexStore((store) => store.savedCommunityViews);
  const replaceCommunityPosts = usePokedexStore((store) => store.replaceCommunityPosts);
  const replaceCommunityPost = usePokedexStore((store) => store.replaceCommunityPost);
  const setCommunityPostLiked = usePokedexStore((store) => store.setCommunityPostLiked);
  const createCommunityPost = usePokedexStore((store) => store.createCommunityPost);
  const setActiveCommunityFilter = usePokedexStore((store) => store.setActiveCommunityFilter);
  const setActiveRelatedPokemonFilter = usePokedexStore((store) => store.setActiveRelatedPokemonFilter);
  const setActiveCommunitySort = usePokedexStore((store) => store.setActiveCommunitySort);
  const setActiveCommunityQuery = usePokedexStore((store) => store.setActiveCommunityQuery);
  const saveCurrentCommunityView = usePokedexStore((store) => store.saveCurrentCommunityView);
  const applySavedCommunityView = usePokedexStore((store) => store.applySavedCommunityView);
  const removeSavedCommunityView = usePokedexStore((store) => store.removeSavedCommunityView);
  const toggleCommunityPostLike = usePokedexStore((store) => store.toggleCommunityPostLike);
  const toggleCommunityPostPinned = usePokedexStore((store) => store.toggleCommunityPostPinned);
  const addCommunityComment = usePokedexStore((store) => store.addCommunityComment);

  const [board, setBoard] = useState<CommunityBoard>("meta");
  const [title, setTitle] = useState("");
  const [relatedPokemon, setRelatedPokemon] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [savedViewName, setSavedViewName] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const communityApiEnabled = isCommunityApiEnabled();

  const syncCommunityPosts = useCallback(async () => {
    if (!communityApiEnabled) {
      return;
    }

    try {
      const remotePosts = await listCommunityPosts();
      replaceCommunityPosts(remotePosts);
      setApiError(null);
    } catch {
      setApiError("실서비스 API 연결에 실패해 현재는 로컬 데이터로 표시 중입니다.");
    }
  }, [communityApiEnabled, replaceCommunityPosts]);

  useEffect(() => {
    if (!communityApiEnabled) {
      return;
    }

    const syncTimer = window.setTimeout(() => {
      void syncCommunityPosts();
    }, 0);

    return () => {
      window.clearTimeout(syncTimer);
    };
  }, [communityApiEnabled, syncCommunityPosts]);

  const totalComments = useMemo(
    () => posts.reduce((count, post) => count + post.comments.length, 0),
    [posts]
  );

  const boardSummary = useMemo(
    () => ({
      meta: posts.filter((post) => post.board === "meta").length,
      strategy: posts.filter((post) => post.board === "strategy").length,
      qna: posts.filter((post) => post.board === "qna").length
    }),
    [posts]
  );

  const pinnedPosts = useMemo(() => posts.filter((post) => post.pinned).slice(0, 3), [posts]);
  const hotPosts = useMemo(() => [...posts].sort((left, right) => right.likes - left.likes).slice(0, 3), [posts]);

  const trendingTags = useMemo(() => {
    const tagCounts = new Map<string, number>();

    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    return [...tagCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6);
  }, [posts]);

  const liveSearchTerms = useMemo(() => {
    const termCounts = new Map<string, number>();

    posts.forEach((post) => {
      [post.relatedPokemon, ...post.tags.slice(0, 2)].forEach((term) => {
        termCounts.set(term, (termCounts.get(term) ?? 0) + 1);
      });
    });

    return [...termCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [posts]);

  const rankedAuthors = useMemo(() => {
    const authorMap = new Map<string, { posts: number; likes: number; comments: number }>();

    posts.forEach((post) => {
      const current = authorMap.get(post.author) ?? { posts: 0, likes: 0, comments: 0 };

      authorMap.set(post.author, {
        posts: current.posts + 1,
        likes: current.likes + post.likes,
        comments: current.comments + post.comments.length
      });
    });

    return [...authorMap.entries()]
      .map(([author, summary]) => ({ author, score: summary.likes + summary.comments * 2 + summary.posts * 3, ...summary }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);
  }, [posts]);

  const featuredPokemon = useMemo(() => {
    const counts = new Map<string, number>();

    posts.forEach((post) => {
      counts.set(post.relatedPokemon, (counts.get(post.relatedPokemon) ?? 0) + 1);
    });

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const filteredPosts = posts.filter((post) => {
      const boardMatches = activeFilter === "all" || post.board === activeFilter;
      const pokemonMatches = activeRelatedPokemonFilter === "all" || post.relatedPokemon === activeRelatedPokemonFilter;
      const queryMatches = matchesCommunityQuery(post, activeCommunityQuery);

      return boardMatches && pokemonMatches && queryMatches;
    });

    const sortedPosts = [...filteredPosts].sort((left, right) => Number(right.pinned) - Number(left.pinned));

    if (activeCommunitySort === "likes") {
      sortedPosts.sort((left, right) => Number(right.pinned) - Number(left.pinned) || right.likes - left.likes);
    }

    if (activeCommunitySort === "comments") {
      sortedPosts.sort(
        (left, right) => Number(right.pinned) - Number(left.pinned) || right.comments.length - left.comments.length
      );
    }

    return sortedPosts;
  }, [activeCommunityQuery, activeCommunitySort, activeFilter, activeRelatedPokemonFilter, posts]);

  const onSubmitPost = async () => {
    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!title.trim() || !content.trim()) {
      return;
    }

    if (communityApiEnabled) {
      try {
        const createdPost = await createCommunityPostRequest({
          board,
          title,
          content,
          relatedPokemon,
          tags
        });

        replaceCommunityPost(createdPost);
        setApiError(null);
      } catch {
        setApiError("새 글을 서버에 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
    } else {
      createCommunityPost({ board, title, content, relatedPokemon, tags });
    }

    setTitle("");
    setRelatedPokemon("");
    setTagInput("");
    setContent("");
    setBoard("meta");
  };

  const onSaveView = () => {
    saveCurrentCommunityView(savedViewName);

    if (!savedViewName.trim()) {
      return;
    }

    setSavedViewName("");
  };

  const onSubmitComment = async (postId: string) => {
    const draft = commentDrafts[postId] ?? "";

    if (!draft.trim()) {
      return;
    }

    if (communityApiEnabled) {
      try {
        const updatedPost = await addCommunityCommentRequest(postId, draft);
        replaceCommunityPost(updatedPost);
        setApiError(null);
      } catch {
        setApiError("댓글을 서버에 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
    } else {
      addCommunityComment(postId, draft);
    }

    setCommentDrafts((current) => ({
      ...current,
      [postId]: ""
    }));
  };

  const onToggleLike = async (postId: string, liked: boolean) => {
    if (communityApiEnabled) {
      try {
        const updatedPost = await toggleCommunityPostLikeRequest(postId, liked ? -1 : 1);
        replaceCommunityPost(updatedPost);
        setCommunityPostLiked(postId, !liked);
        setApiError(null);
      } catch {
        setApiError("추천 반영에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }

      return;
    }

    toggleCommunityPostLike(postId);
  };

  const onTogglePin = async (postId: string, pinned: boolean) => {
    if (communityApiEnabled) {
      try {
        const updatedPost = await toggleCommunityPostPinnedRequest(postId, !pinned);
        replaceCommunityPost(updatedPost);
        setApiError(null);
      } catch {
        setApiError("고정 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }

      return;
    }

    toggleCommunityPostPinned(postId);
  };

  return (
    <section className="community-feed-shell" aria-label="포켓몬 커뮤니티 피드">
      <div className="community-feed-header">
        <div>
          <p className="section-label">LIVE COMMUNITY</p>
          <h2>비어 보이지 않게 흐름이 보이는 포켓몬 커뮤니티 대시보드</h2>
          <p className="community-feed-copy">
            외부 커뮤니티 패턴을 반영해서, 검색·핀·저장된 뷰까지 붙인 정보 공유형 커뮤니티 대시보드로
            확장했습니다.
          </p>
          <p className="community-feed-copy">
            {communityApiEnabled
              ? "현재 커뮤니티 피드는 별도 API 서버와 연동되며, Oracle 저장소를 붙일 수 있는 구조로 동작합니다."
              : "현재 커뮤니티 피드는 로컬 모드입니다. NEXT_PUBLIC_COMMUNITY_API_BASE_URL 설정 시 실서비스 API와 연결됩니다."}
          </p>
          {apiError && <p className="message error">{apiError}</p>}
        </div>

        <dl className="community-feed-stats">
          <div>
            <dt>게시글</dt>
            <dd>{posts.length}</dd>
          </div>
          <div>
            <dt>댓글</dt>
            <dd>{totalComments}</dd>
          </div>
        </dl>
      </div>

      <div className="community-overview-grid">
        <section className="community-density-card">
          <p className="section-label">BOARD SNAPSHOT</p>
          <div className="community-board-summary">
            <div>
              <strong>메타 브리핑</strong>
              <span>{boardSummary.meta}개 글</span>
            </div>
            <div>
              <strong>육성·운용 공유</strong>
              <span>{boardSummary.strategy}개 글</span>
            </div>
            <div>
              <strong>질문 / 답변</strong>
              <span>{boardSummary.qna}개 글</span>
            </div>
          </div>
        </section>

        <section className="community-density-card">
          <p className="section-label">PINNED NOW</p>
          <ul className="community-hot-list">
            {pinnedPosts.map((post) => (
              <li key={post.id}>
                <strong>{post.title}</strong>
                <span>{boardLabels[post.board]} · 고정글 · 관련 포켓몬 {post.relatedPokemon}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="community-density-card">
          <p className="section-label">HOT POSTS</p>
          <ul className="community-hot-list">
            {hotPosts.map((post) => (
              <li key={post.id}>
                <strong>{post.title}</strong>
                <span>
                  {boardLabels[post.board]} · 추천 {post.likes} · 댓글 {post.comments.length}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="community-density-card">
          <p className="section-label">TRENDING TAGS</p>
          <div className="community-chip-cloud">
            {trendingTags.map(([tag, count]) => (
              <button key={tag} type="button" className="ghost" onClick={() => setActiveCommunityQuery(tag)}>
                #{tag} · {count}
              </button>
            ))}
          </div>
        </section>

        <section className="community-density-card">
          <p className="section-label">LIVE SEARCHES</p>
          <ul className="community-hot-list">
            {liveSearchTerms.map(([term, count]) => (
              <li key={term}>
                <strong>{term}</strong>
                <span>관련 언급 {count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="community-feed-grid">
        <aside className="community-composer">
          <p className="section-label">WRITE POST</p>
          <h3>새 글 작성</h3>

          <label className="community-field">
            게시판
            <select value={board} onChange={(event) => setBoard(event.target.value as CommunityBoard)} aria-label="게시판">
              <option value="meta">메타 브리핑</option>
              <option value="strategy">육성·운용 공유</option>
              <option value="qna">질문 / 답변</option>
            </select>
          </label>

          <label className="community-field">
            관련 포켓몬
            <input value={relatedPokemon} onChange={(event) => setRelatedPokemon(event.target.value)} placeholder="예: 피카츄" />
          </label>

          <label className="community-field">
            태그
            <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="예: 메타, 전기, 카운터" />
          </label>

          <label className="community-field">
            제목
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 이번 시즌 전기 타입 체감" />
          </label>

          <label className="community-field">
            내용
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="운용 팁, 카운터, 포챔스 이슈, 질문 등을 자유롭게 적어보세요."
              rows={5}
            />
          </label>

          <button type="button" onClick={onSubmitPost}>
            글 올리기
          </button>

          <div className="saved-view-panel">
            <p className="section-label">SAVED VIEWS</p>
            <label className="community-field">
              현재 필터 저장
              <input value={savedViewName} onChange={(event) => setSavedViewName(event.target.value)} placeholder="예: 내 메타 뷰" />
            </label>
            <button type="button" className="ghost" onClick={onSaveView}>
              뷰 저장
            </button>
            <ul className="saved-view-list">
              {savedCommunityViews.map((view) => (
                <li key={view.id}>
                  <button type="button" className="ghost" onClick={() => applySavedCommunityView(view.id)}>
                    {view.name}
                  </button>
                  <button type="button" className="ghost" onClick={() => removeSavedCommunityView(view.id)}>
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="community-main-column">
          <div className="community-toolbar">
            <div className="community-toolbar-main">
              <div className="community-filter-tabs" role="tablist" aria-label="커뮤니티 보드 필터">
                {boardFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={activeFilter === option.value ? "ghost is-active" : "ghost"}
                    onClick={() => setActiveCommunityFilter(option.value)}
                    aria-pressed={activeFilter === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="community-pokemon-tabs" aria-label="포켓몬별 커뮤니티 탭">
                <button
                  type="button"
                  className={activeRelatedPokemonFilter === "all" ? "ghost is-active" : "ghost"}
                  onClick={() => setActiveRelatedPokemonFilter("all")}
                >
                  전체 포켓몬
                </button>
                {featuredPokemon.map(([pokemonName]) => (
                  <button
                    key={pokemonName}
                    type="button"
                    className={activeRelatedPokemonFilter === pokemonName ? "ghost is-active" : "ghost"}
                    onClick={() => setActiveRelatedPokemonFilter(pokemonName)}
                  >
                    {pokemonName}
                  </button>
                ))}
              </div>
            </div>

            <div className="community-toolbar-side">
              <label className="community-field community-search-field">
                커뮤니티 검색
                <input
                  aria-label="커뮤니티 검색"
                  value={activeCommunityQuery}
                  onChange={(event) => setActiveCommunityQuery(event.target.value)}
                  placeholder="제목, 내용, 작성자, 태그, 포켓몬 검색"
                />
              </label>
              <label className="community-sort-select">
                정렬
                <select
                  value={activeCommunitySort}
                  onChange={(event) => setActiveCommunitySort(event.target.value as CommunitySortOrder)}
                >
                  <option value="latest">최신순</option>
                  <option value="likes">추천순</option>
                  <option value="comments">댓글순</option>
                </select>
              </label>
              <p className="community-toolbar-meta">현재 {visiblePosts.length}개 글 표시 중</p>
            </div>
          </div>

          <section className="community-density-card">
            <p className="section-label">TOP CONTRIBUTORS</p>
            <ul className="community-ranking-list">
              {rankedAuthors.map((author, index) => (
                <li key={author.author}>
                  <div>
                    <strong>
                      #{index + 1} {author.author}
                    </strong>
                    <span>
                      글 {author.posts} · 추천 {author.likes} · 댓글 {author.comments}
                    </span>
                  </div>
                  <em>{author.score}pt</em>
                </li>
              ))}
            </ul>
          </section>

          <div className="community-post-list">
            {visiblePosts.map((post) => {
              const liked = likedPostIds.includes(post.id);

              return (
                <article key={post.id} className="community-post-card">
                  <div className="community-post-meta-row">
                    <span className="community-board-badge">{boardLabels[post.board]}</span>
                    {post.pinned && <span className="community-pin-badge">고정글</span>}
                    <span>{post.author}</span>
                    <span>{post.createdAt}</span>
                  </div>

                  <h3>{post.title}</h3>
                  <p className="community-post-related">관련 포켓몬 · {post.relatedPokemon}</p>
                  <p className="community-post-body">{post.content}</p>
                  <div className="community-post-tags">
                    {post.tags.map((tag) => (
                      <span key={`${post.id}-${tag}`}>#{tag}</span>
                    ))}
                  </div>

                  <dl className="community-post-insights">
                    <div>
                      <dt>보드</dt>
                      <dd>{boardLabels[post.board]}</dd>
                    </div>
                    <div>
                      <dt>반응도</dt>
                      <dd>{post.likes + post.comments.length}</dd>
                    </div>
                    <div>
                      <dt>댓글</dt>
                      <dd>{post.comments.length}</dd>
                    </div>
                  </dl>

                  <div className="community-post-actions">
                    <div className="community-post-action-group">
                      <button type="button" className={liked ? "ghost is-active" : "ghost"} onClick={() => void onToggleLike(post.id, liked)}>
                        {liked ? `추천 취소 ${post.likes}` : `추천 ${post.likes}`}
                      </button>
                      <button type="button" className={post.pinned ? "ghost is-active" : "ghost"} onClick={() => void onTogglePin(post.id, post.pinned)}>
                        {post.pinned ? "고정 해제" : "고정하기"}
                      </button>
                    </div>
                    <span>댓글 {post.comments.length}</span>
                  </div>

                  <div className="community-comment-form">
                    <input
                      aria-label={`${post.title} 댓글 입력`}
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(event) =>
                        setCommentDrafts((current) => ({
                          ...current,
                          [post.id]: event.target.value
                        }))
                      }
                      placeholder="이 글에 의견 남기기"
                    />
                    <button type="button" className="ghost" onClick={() => void onSubmitComment(post.id)}>
                      댓글 등록
                    </button>
                  </div>

                  <ul className="community-comment-list">
                    {post.comments.map((comment) => (
                      <li key={comment.id}>
                        <div className="community-comment-meta">
                          <strong>{comment.author}</strong>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p>{comment.content}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
