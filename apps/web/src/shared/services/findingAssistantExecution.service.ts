import type { InspectionDetailFindingItemResponse } from '@aurelia/contracts';

type AssistantExecutionRule = {
  matchSeverity?: string[];
  text: string;
};

type AssistantExecutionMock = {
  defaultText: string;
  rules: AssistantExecutionRule[];
};

type SuggestFindingExecutionActionInput = {
  item: InspectionDetailFindingItemResponse | null | undefined;
  areaLabel: string;
};

const fallbackMock: AssistantExecutionMock = {
  defaultText: 'Se ejecutó la medida correctiva solicitada para subsanar la condición detectada. Se verificó el estado posterior y se adjunta evidencia fotográfica de cierre para revisión del Admin GF HSE.',
  rules: [],
};

function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function interpolate(template: string, input: SuggestFindingExecutionActionInput) {
  const item = input.item;
  return template
    .replaceAll('{{areaLabel}}', input.areaLabel || 'el área inspeccionada')
    .replaceAll('{{condition}}', item?.condition ?? 'la condición detectada')
    .replaceAll('{{proposedCorrectiveAction}}', item?.proposedCorrectiveAction ?? 'la medida correctiva solicitada')
    .replaceAll('{{severityLabel}}', item?.severityLabel ?? 'criticidad registrada');
}

async function loadMock(): Promise<AssistantExecutionMock> {
  try {
    const response = await fetch('/mock/finding-assistant-execution-suggestions.json', { cache: 'no-cache' });
    if (!response.ok) return fallbackMock;
    const payload = await response.json() as AssistantExecutionMock;
    if (!payload.defaultText || !Array.isArray(payload.rules)) return fallbackMock;
    return payload;
  } catch {
    return fallbackMock;
  }
}

export async function suggestFindingExecutionAction(input: SuggestFindingExecutionActionInput): Promise<string> {
  const mock = await loadMock();
  const severity = normalize(input.item?.severityLabel);
  const rule = mock.rules.find((candidate) => candidate.matchSeverity?.some((value) => severity.includes(normalize(value))));
  return interpolate(rule?.text ?? mock.defaultText, input);
}
