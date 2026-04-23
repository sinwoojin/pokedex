import { Module } from "@nestjs/common";
import { CommunityModule } from "./community/community.module";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [DatabaseModule, CommunityModule],
  controllers: [HealthController]
})
export class AppModule {}
