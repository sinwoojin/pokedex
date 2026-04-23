import { Injectable, NotFoundException } from "@nestjs/common";
import oracledb from "oracledb";
import { OracleService } from "../database/oracle.service";
import type { CreateCommunityPostInput, CommunityComment, CommunityPost } from "./community.types";

type PostRow = {
  id: string;
  board: CommunityPost["board"];
  author: string;
  title: string;
  content: string;
  relatedPokemon: string;
  likes: number;
  createdAt: Date | string;
  pinned: number;
};

type TagRow = {
  postId: string;
  tag: string;
};

type CommentRow = {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: Date | string;
};

@Injectable()
export class CommunityOracleRepository {
  constructor(private readonly oracleService: OracleService) {}

  async listPosts() {
    const connection = await this.oracleService.getConnection();

    try {
      const postsResult = await connection.execute<PostRow>(
        `
          SELECT
            post_id AS "id",
            board AS "board",
            author_name AS "author",
            title AS "title",
            content AS "content",
            related_pokemon AS "relatedPokemon",
            likes_count AS "likes",
            created_at AS "createdAt",
            pinned AS "pinned"
          FROM community_posts
          ORDER BY pinned DESC, created_at DESC
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const posts = (postsResult.rows ?? []) as PostRow[];

      if (!posts.length) {
        return [];
      }

      const postIds = posts.map((post) => post.id);
      const binds = postIds.reduce<Record<string, string>>((acc, postId, index) => {
        acc[`id${index}`] = postId;
        return acc;
      }, {});
      const placeholders = postIds.map((_, index) => `:id${index}`).join(", ");

      const tagRows = (
        await connection.execute<TagRow>(
          `
            SELECT post_id AS "postId", tag AS "tag"
            FROM community_post_tags
            WHERE post_id IN (${placeholders})
            ORDER BY sort_order ASC
          `,
          binds,
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        )
      ).rows as TagRow[] | undefined;

      const commentRows = (
        await connection.execute<CommentRow>(
          `
            SELECT
              comment_id AS "id",
              post_id AS "postId",
              author_name AS "author",
              content AS "content",
              created_at AS "createdAt"
            FROM community_comments
            WHERE post_id IN (${placeholders})
            ORDER BY created_at ASC
          `,
          binds,
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        )
      ).rows as CommentRow[] | undefined;

      const tagsByPostId = (tagRows ?? []).reduce<Record<string, string[]>>((acc, row) => {
        acc[row.postId] = [...(acc[row.postId] ?? []), row.tag];
        return acc;
      }, {});

      const commentsByPostId = (commentRows ?? []).reduce<Record<string, CommunityComment[]>>((acc, row) => {
        acc[row.postId] = [
          ...(acc[row.postId] ?? []),
          {
            id: row.id,
            author: row.author,
            content: row.content,
            createdAt: this.toIsoString(row.createdAt)
          }
        ];
        return acc;
      }, {});

      return posts.map((post) => ({
        id: post.id,
        board: post.board,
        author: post.author,
        title: post.title,
        content: post.content,
        relatedPokemon: post.relatedPokemon,
        tags: tagsByPostId[post.id] ?? [],
        likes: post.likes,
        createdAt: this.toIsoString(post.createdAt),
        pinned: Boolean(post.pinned),
        comments: commentsByPostId[post.id] ?? []
      }));
    } finally {
      await connection.close();
    }
  }

  async createPost(input: CreateCommunityPostInput) {
    const connection = await this.oracleService.getConnection();
    const postId = `post-${Date.now()}`;

    try {
      await connection.execute(
        `
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
            :postId,
            :board,
            :author,
            :title,
            :content,
            :relatedPokemon,
            0,
            0,
            CURRENT_TIMESTAMP
          )
        `,
        {
          postId,
          board: input.board,
          author: input.author,
          title: input.title,
          content: input.content,
          relatedPokemon: input.relatedPokemon
        },
        { autoCommit: true }
      );

      await this.replaceTags(connection, postId, input.tags);
      await connection.commit();
    } finally {
      await connection.close();
    }

    return this.requirePost(postId);
  }

  async updateLikes(postId: string, delta: number) {
    const connection = await this.oracleService.getConnection();

    try {
      const result = await connection.execute(
        `
          UPDATE community_posts
          SET likes_count = GREATEST(0, likes_count + :delta)
          WHERE post_id = :postId
        `,
        { delta, postId },
        { autoCommit: true }
      );

      if (!result.rowsAffected) {
        throw new NotFoundException(`Community post '${postId}' not found`);
      }
    } finally {
      await connection.close();
    }

    return this.requirePost(postId);
  }

  async updatePinned(postId: string, pinned: boolean) {
    const connection = await this.oracleService.getConnection();

    try {
      const result = await connection.execute(
        `
          UPDATE community_posts
          SET pinned = :pinned
          WHERE post_id = :postId
        `,
        { pinned: pinned ? 1 : 0, postId },
        { autoCommit: true }
      );

      if (!result.rowsAffected) {
        throw new NotFoundException(`Community post '${postId}' not found`);
      }
    } finally {
      await connection.close();
    }

    return this.requirePost(postId);
  }

  async addComment(postId: string, author: string, content: string) {
    const connection = await this.oracleService.getConnection();
    const commentId = `comment-${postId}-${Date.now()}`;

    try {
      await connection.execute(
        `
          INSERT INTO community_comments (
            comment_id,
            post_id,
            author_name,
            content,
            created_at
          ) VALUES (
            :commentId,
            :postId,
            :author,
            :content,
            CURRENT_TIMESTAMP
          )
        `,
        { commentId, postId, author, content },
        { autoCommit: true }
      );
    } finally {
      await connection.close();
    }

    return this.requirePost(postId);
  }

  private async replaceTags(connection: oracledb.Connection, postId: string, tags: string[]) {
    await connection.execute(`DELETE FROM community_post_tags WHERE post_id = :postId`, { postId });

    await Promise.all(
      tags.map((tag, index) =>
        connection.execute(
          `
            INSERT INTO community_post_tags (post_id, sort_order, tag)
            VALUES (:postId, :sortOrder, :tag)
          `,
          {
            postId,
            sortOrder: index,
            tag
          }
        )
      )
    );
  }

  private async requirePost(postId: string) {
    const posts = await this.listPosts();
    const post = posts.find((candidate) => candidate.id === postId);

    if (!post) {
      throw new NotFoundException(`Community post '${postId}' not found`);
    }

    return post;
  }

  private toIsoString(value: Date | string) {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
