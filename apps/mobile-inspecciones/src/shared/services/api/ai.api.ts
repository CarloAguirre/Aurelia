import { httpPost } from '../http-client';

export type AiSuggestType = 'corrective_measure' | 'company_suggestion';

export interface AiSuggestRequest {
  type: AiSuggestType;
  context: Record<string, unknown>;
}

export interface AiSuggestResponse {
  suggestion: string;
  type: AiSuggestType;
  fallback: boolean;
}

export function suggestCorrectiveMeasure(params: {
  area: string;
  sector: string;
  description: string;
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: 'corrective_measure',
    context: params,
  });
}

export function suggestCompany(params: {
  area: string;
  sector: string;
  availableCompanies: string[];
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: 'company_suggestion',
    context: params,
  });
}
