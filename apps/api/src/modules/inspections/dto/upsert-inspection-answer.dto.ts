import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { InspectionAnswerValue, UpsertInspectionAnswerRequest } from '@aurelia/contracts';

export class UpsertInspectionAnswerDto implements UpsertInspectionAnswerRequest {
  @IsUUID()
  checklistItemId: string;

  @IsOptional()
  @IsEnum(InspectionAnswerValue)
  answerValue?: InspectionAnswerValue | null;

  @IsOptional()
  @IsString()
  answerText?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  numericValue?: number | null;

  @IsOptional()
  @IsISO8601()
  answeredAt?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
