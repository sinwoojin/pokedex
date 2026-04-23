WHENEVER SQLERROR EXIT SQL.SQLCODE;
CONNECT pokemon_app/pokemon_app@FREEPDB1;

CREATE TABLE community_posts (
  post_id VARCHAR2(64) PRIMARY KEY,
  board VARCHAR2(32) NOT NULL,
  author_name VARCHAR2(120) NOT NULL,
  title VARCHAR2(200) NOT NULL,
  content CLOB NOT NULL,
  related_pokemon VARCHAR2(120) NOT NULL,
  likes_count NUMBER DEFAULT 0 NOT NULL,
  pinned NUMBER(1) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT community_posts_board_ck CHECK (board IN ('meta', 'strategy', 'qna')),
  CONSTRAINT community_posts_pinned_ck CHECK (pinned IN (0, 1))
);

CREATE TABLE community_post_tags (
  post_id VARCHAR2(64) NOT NULL,
  sort_order NUMBER NOT NULL,
  tag VARCHAR2(100) NOT NULL,
  CONSTRAINT community_post_tags_pk PRIMARY KEY (post_id, sort_order),
  CONSTRAINT community_post_tags_post_fk FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE
);

CREATE TABLE community_comments (
  comment_id VARCHAR2(96) PRIMARY KEY,
  post_id VARCHAR2(64) NOT NULL,
  author_name VARCHAR2(120) NOT NULL,
  content VARCHAR2(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT community_comments_post_fk FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE
);

CREATE INDEX community_posts_created_at_ix ON community_posts (created_at DESC);
CREATE INDEX community_comments_post_id_ix ON community_comments (post_id);
