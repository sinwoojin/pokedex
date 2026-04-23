import { Inject, Injectable } from "@nestjs/common";
import { loadAppEnv } from "../config/env";
import { COMMUNITY_REPOSITORY, type CommunityRepository } from "./community.repository";
import type { CreateCommunityPostInput } from "./community.types";

export const COMMUNITY_MEMORY_REPOSITORY = Symbol("COMMUNITY_MEMORY_REPOSITORY");
export const COMMUNITY_ORACLE_REPOSITORY = Symbol("COMMUNITY_ORACLE_REPOSITORY");

@Injectable()
export class CommunityService {
  constructor(@Inject(COMMUNITY_REPOSITORY) private readonly repository: CommunityRepository) {}

  async listPosts() {
    return this.repository.listPosts();
  }

  async createPost(input: CreateCommunityPostInput) {
    return this.repository.createPost(input);
  }

  async updateLikes(postId: string, delta: number) {
    return this.repository.updateLikes(postId, delta);
  }

  async updatePinned(postId: string, pinned: boolean) {
    return this.repository.updatePinned(postId, pinned);
  }

  async addComment(postId: string, author: string, content: string) {
    return this.repository.addComment(postId, author, content);
  }
}

export const communityRepositoryProvider = {
  provide: COMMUNITY_REPOSITORY,
  inject: [COMMUNITY_MEMORY_REPOSITORY, COMMUNITY_ORACLE_REPOSITORY],
  useFactory: (memoryRepository: CommunityRepository, oracleRepository: CommunityRepository) => {
    const env = loadAppEnv();
    return env.oracleEnabled ? oracleRepository : memoryRepository;
  }
};
