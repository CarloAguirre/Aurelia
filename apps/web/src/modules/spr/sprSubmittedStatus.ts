import { SprRecordStatus, type SprMonthlyRecordResponse } from '@aurelia/contracts';
import { SPR_ACTIVE_CYCLE, SPR_APPROVED_STATUS, SPR_SUBMITTED_STATUS } from './spr.constants';

const dateLabelFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export type SprFormDisplayMode = 'entry' | 'pending_approval' | 'rejected' | 'manager_approved';

export type SprProcessStatusVariant =
  | 'initial'
  | 'rejected'
  | 'corrected'
  | 'approved'
  | 'approved_corrected';

function filterSprCycleRecords(records: SprMonthlyRecordResponse[] | undefined): SprMonthlyRecordResponse[] {
  return (records ?? []).filter(
    (record) => record.periodYear === SPR_ACTIVE_CYCLE.periodYear && record.periodMonth === SPR_ACTIVE_CYCLE.periodMonth,
  );
}

function resolveLatestSprDateLabel(
  records: SprMonthlyRecordResponse[],
  field: 'submittedAt' | 'approvedAt',
  fallback: string,
): string {
  const dates = records
    .map((record) => record[field])
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (dates.length === 0) return fallback;

  const latest = dates.reduce((current, next) => (next > current ? next : current));
  return dateLabelFormatter.format(latest).replace(/\//g, '-');
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
  if (
    cycleRecords.every(
      (record) => record.status === SprRecordStatus.APPROVED || record.status === SprRecordStatus.CLOSED,
    )
  ) {
    return 'manager_approved';
  }

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
  if (displayMode === 'manager_approved') {
    return hasCorrectionHistory ? 'approved_corrected' : 'approved';
  }
  if (displayMode === 'pending_approval' && hasCorrectionHistory) return 'corrected';
  return 'initial';
}

export function resolveSprSignDateLabel(records: SprMonthlyRecordResponse[] | undefined): string {
  return resolveLatestSprDateLabel(
    filterSprCycleRecords(records),
    'submittedAt',
    SPR_SUBMITTED_STATUS.signDateFallbackLabel,
  );
}

export function resolveSprManagerApprovalDateLabel(records: SprMonthlyRecordResponse[] | undefined): string {
  return resolveLatestSprDateLabel(
    filterSprCycleRecords(records),
    'approvedAt',
    SPR_APPROVED_STATUS.managerApprovalDateFallback,
  );
}
