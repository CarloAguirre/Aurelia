import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CreateInspectionFindingRequest, InspectionFindingSeverity } from '@aurelia/contracts';

export class CreateInspectionFindingDto implements CreateInspectionFindingRequest {
  @IsOptional()
  @IsUUID()
  checklistItemId?: string | null;

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
