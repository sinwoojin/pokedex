import type { CommunityPost } from "./community.types";

export const seedCommunityPosts: CommunityPost[] = [
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
    createdAt: "2026-04-24T09:10:00+09:00",
    pinned: true,
    comments: [
      {
        id: "seed-meta-1-comment-1",
        author: "밸런스체커",
        content: "전기 타입은 땅 견제 루트까지 같이 보면 더 좋을 것 같아요.",
        createdAt: "2026-04-24T09:24:00+09:00"
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
    createdAt: "2026-04-24T11:42:00+09:00",
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
    createdAt: "2026-04-24T13:05:00+09:00",
    pinned: false,
    comments: [
      {
        id: "seed-qna-1-comment-1",
        author: "도감가이드",
        content: "검색으로 익숙한 포켓몬부터 보고, 그 다음 랜덤 추천으로 메타 감각을 넓히는 방식이 무난해요.",
        createdAt: "2026-04-24T13:18:00+09:00"
      }
    ]
  }
];
