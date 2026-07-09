// PLACEHOLDER: validacion de rango historico sin respaldo en backend.
// AurelIA deberia exponer promedios de 6 meses y reglas de desviacion via API.
// Por ahora se simula con promedios mock por codigo de parametro (diseno Figma 1395:4462).

export const SPR_HISTORICAL_RANGE_THRESHOLD_PERCENT = 10;

// Promedio de 6 meses mock por codigo de parametro (ej. control SOX del diseno).
export const SPR_MOCK_HISTORICAL_AVERAGES: Record<string, number> = {
  ESG_SD_C06_WMA: 44.2,
  // MOCK temporal para pruebas visuales con el seed actual ("Consumo mensual de energia").
  // Pendiente de reemplazar cuando el equipo defina la regla real de negocio / API de promedios.
  'ENERGY-CONSUMPTION-KWH': 44.2,
};

export interface SprHistoricalRangeResult {
  isOutOfRange: boolean;
  enteredValue: number | null;
  averageValue: number | null;
  deviationPercent: number | null;
}

export function parseSprNumericValue(value: string): number | null {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluateHistoricalRange(parameterCode: string, valueText: string): SprHistoricalRangeResult {
  const averageValue = SPR_MOCK_HISTORICAL_AVERAGES[parameterCode] ?? null;
  const enteredValue = parseSprNumericValue(valueText);

  if (averageValue === null || enteredValue === null || averageValue === 0) {
    return { isOutOfRange: false, enteredValue, averageValue, deviationPercent: null };
  }

  const deviationPercent = ((enteredValue - averageValue) / averageValue) * 100;
  const isOutOfRange = Math.abs(deviationPercent) > SPR_HISTORICAL_RANGE_THRESHOLD_PERCENT;

  return { isOutOfRange, enteredValue, averageValue, deviationPercent };
}

export function formatDeviationPercent(deviationPercent: number) {
  const sign = deviationPercent > 0 ? '+' : '';
  return `${sign}${deviationPercent.toFixed(1)}%`;
}
