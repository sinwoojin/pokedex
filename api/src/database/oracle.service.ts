import { Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import oracledb from "oracledb";
import { loadAppEnv } from "../config/env";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OracleService.name);
  private readonly env = loadAppEnv();
  private pool: oracledb.Pool | null = null;
  private poolInitPromise: Promise<oracledb.Pool | null> | null = null;
  private lastError: string | null = null;

  async onModuleInit() {
    await this.ensurePool();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close(10);
      this.pool = null;
    }
  }

  isEnabled() {
    return this.env.oracleEnabled;
  }

  async ensurePool() {
    if (!this.env.oracleEnabled) {
      return null;
    }

    if (this.pool) {
      return this.pool;
    }

    if (!this.poolInitPromise) {
      this.poolInitPromise = oracledb
        .createPool({
          user: this.env.oracleUser,
          password: this.env.oraclePassword,
          connectString: this.env.oracleConnectString,
          poolMin: this.env.oraclePoolMin,
          poolMax: this.env.oraclePoolMax,
          poolIncrement: this.env.oraclePoolIncrement
        })
        .then((pool: oracledb.Pool) => {
          this.pool = pool;
          this.lastError = null;
          this.logger.log(`Oracle pool ready for ${this.env.oracleConnectString}`);
          return pool;
        })
        .catch((error: Error) => {
          this.lastError = error.message;
          this.logger.error(`Oracle pool initialization failed: ${error.message}`);
          return null;
        })
        .finally(() => {
          this.poolInitPromise = null;
        });
    }

    return this.poolInitPromise;
  }

  async getConnection() {
    const pool = await this.ensurePool();

    if (!pool) {
      throw new ServiceUnavailableException("Oracle connection pool is not ready");
    }

    return pool.getConnection();
  }

  async getHealth() {
    if (!this.env.oracleEnabled) {
      return {
        enabled: false,
        ready: false,
        message: "Oracle integration disabled"
      };
    }

    try {
      const connection = await this.getConnection();
      await connection.ping();
      await connection.close();

      return {
        enabled: true,
        ready: true,
        message: "Oracle pool reachable"
      };
    } catch (error) {
      return {
        enabled: true,
        ready: false,
        message: error instanceof Error ? error.message : this.lastError ?? "Oracle pool unavailable"
      };
    }
  }
}
