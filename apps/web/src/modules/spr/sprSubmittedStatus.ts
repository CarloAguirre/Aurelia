import { SprRecordStatus, type SprMonthlyRecordResponse } from '@aurelia/contracts';
import { SPR_ACTIVE_CYCLE, SPR_SUBMITTED_STATUS } from './spr.constants';

const signDateFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export type SprFormDisplayMode = 'entry' | 'pending_approval' | 'rejected';

export type SprProcessStatusVariant = 'initial' | 'rejected' | 'corrected';

function filterSprCycleRecords(records: SprMonthlyRecordResponse[] | undefined): SprMonthlyRecordResponse[] {
  return (records ?? []).filter(
    (record) => record.periodYear === SPR_ACTIVE_CYCLE.periodYear && record.periodMonth === SPR_ACTIVE_CYCLE.periodMonth,
  );
}

export function isSprFormSubmitted(
  records: SprMonthlyRecordResponse[] | undefined,
  totalParameterCount: number,
): boolean {
  return resolveSprFormDisplayMode(records, totalParameterCount) !== 'entry';
}

export function resolveSprFormDisplayMode(
  records: SprMonthlyRecordResponse[] | undefined,
  totalParameterCount: number,
): SprFormDisplayMode {
  if (totalParameterCount <= 0) return 'entry';

  const cycleRecords = filterSprCycleRecords(records);
  if (cycleRecords.length < totalParameterCount) return 'entry';
  if (cycleRecords.some((record) => record.status === SprRecordStatus.DRAFT)) return 'entry';
  if (cycleRecords.some((record) => record.status === SprRecordStatus.REJECTED)) return 'rejected';

  return 'pending_approval';
}

export function getSprCycleRecordIds(records: SprMonthlyRecordResponse[] | undefined): string[] {
  return filterSprCycleRecords(records).map((record) => record.id);
}

export function resolveSprProcessStatusVariant(
  displayMode: SprFormDisplayMode,
  hasCorrectionHistory: boolean,
): SprProcessStatusVariant {
  if (displayMode === 'rejected') return 'rejected';
  if (displayMode === 'pending_approval' && hasCorrectionHistory) return 'corrected';
  return 'initial';
}

export function resolveSprSignDateLabel(records: SprMonthlyRecordResponse[] | undefined): string {
  const submittedDates = (records ?? [])
    .map((record) => record.submittedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (submittedDates.length === 0) return SPR_SUBMITTED_STATUS.signDateFallbackLabel;

  const latest = submittedDates.reduce((current, next) => (next > current ? next : current));
  return signDateFormatter.format(latest).replace(/\//g, '-');
}
