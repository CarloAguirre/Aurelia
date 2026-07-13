import { SprRecordStatus, type SprMonthlyRecordResponse } from '@aurelia/contracts';
import { SPR_ACTIVE_CYCLE } from './spr.constants';

export type SprAreaDisplayMode =
  | 'waiting_for_responsible'
  | 'pending_review'
  | 'pending_review_after_correction'
  | 'rejected_pending_correction'
  | 'approved';

export type SprAreaProcessStatusVariant =
  | 'manager_waiting'
  | 'manager_pending_review'
  | 'manager_pending_re_review';

export type SprAreaStatusViewMode = Extract<
  SprAreaDisplayMode,
  'waiting_for_responsible' | 'pending_review_after_correction'
>;

function filterSprCycleRecords(records: SprMonthlyRecordResponse[] | undefined): SprMonthlyRecordResponse[] {
  return (records ?? []).filter(
    (record) => record.periodYear === SPR_ACTIVE_CYCLE.periodYear && record.periodMonth === SPR_ACTIVE_CYCLE.periodMonth,
  );
}

function isWaitingForResponsibleEmission(
  cycleRecords: SprMonthlyRecordResponse[],
  totalParameterCount: number,
): boolean {
  if (totalParameterCount <= 0) return true;
  if (cycleRecords.length < totalParameterCount) return true;
  return cycleRecords.some((record) => record.status === SprRecordStatus.DRAFT);
}

export function resolveSprAreaDisplayMode(
  records: SprMonthlyRecordResponse[] | undefined,
  totalParameterCount: number,
): SprAreaDisplayMode {
  const cycleRecords = filterSprCycleRecords(records);

  if (isWaitingForResponsibleEmission(cycleRecords, totalParameterCount)) {
    return 'waiting_for_responsible';
  }

  if (cycleRecords.some((record) => record.status === SprRecordStatus.REJECTED)) {
    return 'rejected_pending_correction';
  }

  if (
    cycleRecords.every(
      (record) => record.status === SprRecordStatus.APPROVED || record.status === SprRecordStatus.CLOSED,
    )
  ) {
    return 'approved';
  }

  return 'pending_review';
}

export function resolveSprAreaEffectiveDisplayMode(
  displayMode: SprAreaDisplayMode,
  hasCorrectionHistory: boolean,
): SprAreaDisplayMode {
  if (displayMode === 'pending_review' && hasCorrectionHistory) {
    return 'pending_review_after_correction';
  }

  return displayMode;
}
