import { AiSuggestType, type AiSuggestRequest, type AiSuggestResponse } from '@aurelia/contracts';
import { httpPost } from '../http-client';

export function suggestCorrectiveMeasure(params: {
  area: string;
  sector: string;
  description: string;
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: AiSuggestType.CORRECTIVE_MEASURE,
    context: params,
  });
}

export function suggestCompany(params: {
  area: string;
  sector: string;
  availableCompanies: string[];
}): Promise<AiSuggestResponse> {
  return httpPost<AiSuggestRequest, AiSuggestResponse>('/ai/suggest', {
    type: AiSuggestType.COMPANY_SUGGESTION,
    context: params,
  });
}
