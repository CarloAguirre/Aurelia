import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CreateInspectionFindingRequest, InspectionFindingSeverity } from '@aurelia/contracts';
import { IsArray } from 'class-validator';

export class CreateInspectionFindingDto implements CreateInspectionFindingRequest {
  @IsOptional()
  @IsUUID()
  checklistItemId?: string | null;

  @IsOptional()
  @IsUUID()
  findingTypeId?: string | null;

  @IsOptional()
  @IsUUID()
  severityId?: string | null;

  @IsOptional()
  @IsUUID()
  responsibleCompanyId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  responsibleUserIds?: string[];

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsEnum(InspectionFindingSeverity)
  severity: InspectionFindingSeverity;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string | null;

  @IsOptional()
  @IsISO8601()
  dueAt?: string | null;
}
