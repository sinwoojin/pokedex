import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CommunityController } from "./community.controller";
import { CommunityMemoryRepository } from "./community-memory.repository";
import { CommunityOracleRepository } from "./community-oracle.repository";
import {
  COMMUNITY_MEMORY_REPOSITORY,
  COMMUNITY_ORACLE_REPOSITORY,
  communityRepositoryProvider,
  CommunityService
} from "./community.service";

const oracleRepositoryProvider = {
  provide: COMMUNITY_ORACLE_REPOSITORY,
  useExisting: CommunityOracleRepository
};

const memoryRepositoryProvider = {
  provide: COMMUNITY_MEMORY_REPOSITORY,
  useExisting: CommunityMemoryRepository
};

@Module({
  imports: [DatabaseModule],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityMemoryRepository,
    CommunityOracleRepository,
    memoryRepositoryProvider,
    oracleRepositoryProvider,
    communityRepositoryProvider
  ]
})
export class CommunityModule {}
