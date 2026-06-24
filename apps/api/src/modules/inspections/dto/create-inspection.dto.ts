import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CreateInspectionRequest, InspectionConstraints } from '@aurelia/contracts';

export class CreateInspectionDto implements CreateInspectionRequest {
  @IsUUID()
  inspectionTypeId: string;

  @IsOptional()
  @IsUUID()
  templateId?: string | null;

  @IsOptional()
  @IsUUID()
  companyId?: string | null;

  @IsOptional()
  @IsUUID()
  areaId?: string | null;

  @IsOptional()
  @IsUUID()
  sectorId?: string | null;

  @IsOptional()
  @IsUUID()
  locationId?: string | null;

  @IsString()
  @MinLength(InspectionConstraints.title.minLength)
  @MaxLength(InspectionConstraints.title.maxLength)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(InspectionConstraints.description.maxLength)
  description?: string | null;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string | null;

  @IsOptional()
  latitude?: number | null;

  @IsOptional()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(InspectionConstraints.notes.maxLength)
  notes?: string | null;
}
