import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { ResourceScopeInterceptor } from './modules/access-control/resource-scope.interceptor';
import { ResourceScopeService } from './modules/access-control/resource-scope.service';
import { IncidentEntity } from './modules/incidents/entities/incident.entity';
import { InspectionEntity } from './modules/inspections/entities/inspection.entity';
import { UserEntity } from './modules/users/entities/user.entity';
import {
  createRateLimit,
  DatabaseRateLimitStore,
  MemoryRateLimitStore,
  securityHeaders,
} from './shared/security/http-security';
import { SanitizedExceptionFilter } from './shared/security/sanitized-exception.filter';

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

function createResourceScopeInterceptor(dataSource: DataSource): ResourceScopeInterceptor {
  return new ResourceScopeInterceptor(
    new ResourceScopeService(dataSource.getRepository(UserEntity)),
    dataSource.getRepository(InspectionEntity),
    dataSource.getRepository(IncidentEntity),
  );
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

  app.useGlobalFilters(new SanitizedExceptionFilter());
  app.useGlobalInterceptors(createResourceScopeInterceptor(dataSource));
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
