import type { CreateCommunityPostInput, CommunityPost } from "./community.types";

export interface CommunityRepository {
  listPosts(): Promise<CommunityPost[]>;
  createPost(input: CreateCommunityPostInput): Promise<CommunityPost>;
  updateLikes(postId: string, delta: number): Promise<CommunityPost>;
  updatePinned(postId: string, pinned: boolean): Promise<CommunityPost>;
  addComment(postId: string, author: string, content: string): Promise<CommunityPost>;
}

export const COMMUNITY_REPOSITORY = Symbol("COMMUNITY_REPOSITORY");
