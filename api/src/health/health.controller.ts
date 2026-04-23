import { Controller, Get } from "@nestjs/common";
import { OracleService } from "../database/oracle.service";

@Controller("health")
export class HealthController {
  constructor(private readonly oracleService: OracleService) {}

  @Get()
  async getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: await this.oracleService.getHealth()
    };
  }
}
