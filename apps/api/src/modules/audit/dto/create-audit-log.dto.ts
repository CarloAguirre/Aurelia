import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsString()
  @MinLength(1)
  action: string;

  @IsOptional()
  oldValue?: Record<string, unknown>;

  @IsOptional()
  newValue?: Record<string, unknown>;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
