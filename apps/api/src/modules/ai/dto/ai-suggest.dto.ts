import { IsEnum, IsObject } from 'class-validator';

export enum AiSuggestType {
  CORRECTIVE_MEASURE = 'corrective_measure',
  COMPANY_SUGGESTION = 'company_suggestion',
}

export class AiSuggestDto {
  @IsEnum(AiSuggestType)
  type: AiSuggestType;

  @IsObject()
  context: Record<string, unknown>;
}

export interface AiSuggestResponse {
  suggestion: string;
  type: AiSuggestType;
  fallback: boolean;
}
