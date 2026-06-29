import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import {
  createRateLimit,
  DatabaseRateLimitStore,
  MemoryRateLimitStore,
  securityHeaders,
} from './shared/security/http-security';

function parseOrigins(value: string | undefined): string[] {
  return (value ?? 'http://localhost:8081,http://localhost:3001,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createRateLimitStore(config: ConfigService, dataSource: DataSource) {
  const store = config.get<string>('security.rateLimitStore') ?? 'memory';
  if (store === 'database') return new DatabaseRateLimitStore(dataSource);
  return new MemoryRateLimitStore();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(securityHeaders);

  const config = app.get(ConfigService);
  const dataSource = app.get(DataSource);

  app.use(createRateLimit({
    windowMs: config.get<number>('security.rateLimitWindowMs') ?? 60_000,
    max: config.get<number>('security.rateLimitMax') ?? 180,
    store: createRateLimitStore(config, dataSource),
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('port') ?? 3000;
  app.enableCors({
    origin: parseOrigins(process.env.CORS_ORIGINS),
    credentials: true,
  });
  await app.listen(port);
}

void bootstrap();
