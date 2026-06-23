import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CreateInspectionRequest,
  InspectionConstraints,
  InspectionType,
} from '@aurelia/contracts';

export class CreateInspectionDto implements CreateInspectionRequest {
  @IsString()
  @MinLength(InspectionConstraints.title.minLength)
  @MaxLength(InspectionConstraints.title.maxLength)
  title: string;

  @IsEnum(InspectionType)
  type: InspectionType;

  @IsUUID()
  areaId: string;

  @IsUUID()
  mueId: string;

  @IsOptional()
  @IsUUID()
  criticalControlId?: string;

  @IsOptional()
  @IsISO8601()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(InspectionConstraints.notes.maxLength)
  notes?: string;
}
