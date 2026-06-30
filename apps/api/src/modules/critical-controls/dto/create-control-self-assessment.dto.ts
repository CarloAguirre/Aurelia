import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export class CreateControlSelfAssessmentDto {
  @IsUUID()
  mueId: string;

  @IsOptional()
  @IsUUID()
  criticalControlId?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsUUID()
  gerenciaId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  periodYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;
}

export class UpsertControlSelfAssessmentAnswerDto {
  @IsUUID()
  verificationItemId: string;

  @IsString()
  @IsIn(['yes', 'no', 'partial', 'not_applicable', 'not_observed'])
  answer: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsBoolean()
  actionRequired?: boolean;
}

export class UpsertControlSelfAssessmentAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertControlSelfAssessmentAnswerDto)
  answers: UpsertControlSelfAssessmentAnswerDto[];
}
