import { Injectable, NotFoundException } from "@nestjs/common";
import { seedCommunityPosts } from "./community-seed";
import type { CreateCommunityPostInput, CommunityComment, CommunityPost } from "./community.types";

@Injectable()
export class CommunityMemoryRepository {
  private posts: CommunityPost[] = structuredClone(seedCommunityPosts);

  async listPosts() {
    return this.posts;
  }

  async createPost(input: CreateCommunityPostInput) {
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      board: input.board,
      author: input.author,
      title: input.title,
      content: input.content,
      relatedPokemon: input.relatedPokemon,
      tags: input.tags,
      likes: 0,
      createdAt: new Date().toISOString(),
      pinned: false,
      comments: []
    };

    this.posts = [post, ...this.posts];
    return post;
  }

  async updateLikes(postId: string, delta: number) {
    const post = this.findPost(postId);
    post.likes = Math.max(0, post.likes + delta);
    return post;
  }

  async updatePinned(postId: string, pinned: boolean) {
    const post = this.findPost(postId);
    post.pinned = pinned;
    return post;
  }

  async addComment(postId: string, author: string, content: string) {
    const post = this.findPost(postId);
    const comment: CommunityComment = {
      id: `comment-${postId}-${Date.now()}`,
      author,
      content,
      createdAt: new Date().toISOString()
    };

    post.comments = [...post.comments, comment];
    return post;
  }

  private findPost(postId: string) {
    const post = this.posts.find((candidate) => candidate.id === postId);

    if (!post) {
      throw new NotFoundException(`Community post '${postId}' not found`);
    }

    return post;
  }
}
