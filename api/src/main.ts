import "dotenv/config";
import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { loadAppEnv } from "./config/env";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const env = loadAppEnv();
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [env.clientOrigin],
      credentials: true
    }
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  await app.listen(env.port);

  new Logger("Bootstrap").log(`Pokemon community API listening on ${env.port}`);
};

void bootstrap();
