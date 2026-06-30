import { IsArray, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(140)
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  triggeredByUserId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  recipientUserIds: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
