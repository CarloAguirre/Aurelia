import { IsEnum, IsISO8601, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import {
  CreateIncidentRequest,
  IncidentConstraints,
  IncidentRiskLevel,
  IncidentType,
} from '@aurelia/contracts';

export class CreateIncidentDto implements CreateIncidentRequest {
  @IsString()
  @MinLength(IncidentConstraints.title.minLength)
  @MaxLength(IncidentConstraints.title.maxLength)
  title: string;

  @IsString()
  @MinLength(IncidentConstraints.description.minLength)
  @MaxLength(IncidentConstraints.description.maxLength)
  description: string;

  @IsEnum(IncidentType)
  type: IncidentType;

  @IsEnum(IncidentRiskLevel)
  riskLevel: IncidentRiskLevel;

  @IsUUID()
  areaId: string;

  @IsUUID()
  mueId: string;

  @IsISO8601()
  occurredAt: string;
}
