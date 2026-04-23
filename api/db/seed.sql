WHENEVER SQLERROR EXIT SQL.SQLCODE;
CONNECT pokemon_app/pokemon_app@FREEPDB1;

INSERT INTO community_posts (
  post_id,
  board,
  author_name,
  title,
  content,
  related_pokemon,
  likes_count,
  pinned,
  created_at
) VALUES (
  'seed-meta-1',
  'meta',
  '메타연구원',
  '요즘 포챔스에서 자주 거론되는 전기 타입 정리',
  '피카츄처럼 인지도가 높은 포켓몬부터 체감 좋은 전기 타입까지, 약점 대응이 쉬운지 같이 보면서 정리해보면 좋겠습니다.',
  '피카츄',
  12,
  1,
  TO_TIMESTAMP_TZ('2026-04-24 09:10:00 +09:00', 'YYYY-MM-DD HH24:MI:SS TZH:TZM')
);

INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-meta-1', 0, '전기');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-meta-1', 1, '메타');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-meta-1', 2, '카운터');

INSERT INTO community_comments (
  comment_id,
  post_id,
  author_name,
  content,
  created_at
) VALUES (
  'seed-meta-1-comment-1',
  'seed-meta-1',
  '밸런스체커',
  '전기 타입은 땅 견제 루트까지 같이 보면 더 좋을 것 같아요.',
  TO_TIMESTAMP_TZ('2026-04-24 09:24:00 +09:00', 'YYYY-MM-DD HH24:MI:SS TZH:TZM')
);

INSERT INTO community_posts (
  post_id,
  board,
  author_name,
  title,
  content,
  related_pokemon,
  likes_count,
  pinned,
  created_at
) VALUES (
  'seed-strategy-1',
  'strategy',
  '실전트레이너',
  '카운터 픽 볼 때 약점 타입이 확실히 체감됩니다',
  '상세 모달에서 약점 타입이랑 기본 스탯 브리핑을 같이 보는 식으로 체크하니, 실전에서 어떤 포켓몬을 의식해야 하는지 정리가 빨랐습니다.',
  '리자몽',
  8,
  0,
  TO_TIMESTAMP_TZ('2026-04-24 11:42:00 +09:00', 'YYYY-MM-DD HH24:MI:SS TZH:TZM')
);

INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-strategy-1', 0, '카운터');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-strategy-1', 1, '운용');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-strategy-1', 2, '약점');

INSERT INTO community_posts (
  post_id,
  board,
  author_name,
  title,
  content,
  related_pokemon,
  likes_count,
  pinned,
  created_at
) VALUES (
  'seed-qna-1',
  'qna',
  '뉴비트레이너',
  '입문자는 어떤 포켓몬부터 정보 정리하면 좋을까요?',
  '검색이랑 랜덤 추천이 둘 다 있어서 좋긴 한데, 처음 보는 사람 기준으로 우선순위를 어떻게 잡으면 좋은지 궁금합니다.',
  '이브이',
  5,
  0,
  TO_TIMESTAMP_TZ('2026-04-24 13:05:00 +09:00', 'YYYY-MM-DD HH24:MI:SS TZH:TZM')
);

INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-qna-1', 0, '입문');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-qna-1', 1, '질문');
INSERT INTO community_post_tags (post_id, sort_order, tag) VALUES ('seed-qna-1', 2, '추천');

INSERT INTO community_comments (
  comment_id,
  post_id,
  author_name,
  content,
  created_at
) VALUES (
  'seed-qna-1-comment-1',
  'seed-qna-1',
  '도감가이드',
  '검색으로 익숙한 포켓몬부터 보고, 그 다음 랜덤 추천으로 메타 감각을 넓히는 방식이 무난해요.',
  TO_TIMESTAMP_TZ('2026-04-24 13:18:00 +09:00', 'YYYY-MM-DD HH24:MI:SS TZH:TZM')
);

COMMIT;
