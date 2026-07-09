import { useEffect, useMemo, useState } from 'react';
import { useSprParameters } from '../../shared/hooks/useSprParameters';
import { useSprMonthlyRecords } from '../../shared/hooks/useSprMonthlyRecords';
import { useSprRecordApprovals } from '../../shared/hooks/useSprRecordApprovals';
import { useSprCycleCorrectionHistory } from '../../shared/hooks/useSprCycleCorrectionHistory';
import { SprMonthlyEntryView } from './SprMonthlyEntryView';
import { SprSubmittedStatusView } from './SprSubmittedStatusView';
import { SPR_ACTIVE_CYCLE } from './spr.constants';
import { findSprRejectedRecordId, resolveSprRejectionContext } from './sprRejectedContext';
import {
  getSprCycleRecordIds,
  resolveSprFormDisplayMode,
  resolveSprProcessStatusVariant,
  resolveSprSignDateLabel,
} from './sprSubmittedStatus';

export function SprFormView() {
  const [isCorrectingRejectedForm, setIsCorrectingRejectedForm] = useState(false);
  const parametersQuery = useSprParameters();
  const recordsQuery = useSprMonthlyRecords({
    periodYear: SPR_ACTIVE_CYCLE.periodYear,
    periodMonth: SPR_ACTIVE_CYCLE.periodMonth,
  });

  const totalParameterCount = parametersQuery.data?.length ?? 0;
  const displayMode = useMemo(
    () => resolveSprFormDisplayMode(recordsQuery.data, totalParameterCount),
    [recordsQuery.data, totalParameterCount],
  );
  const signDateLabel = useMemo(() => resolveSprSignDateLabel(recordsQuery.data), [recordsQuery.data]);
  const cycleRecordIds = useMemo(() => getSprCycleRecordIds(recordsQuery.data), [recordsQuery.data]);
  const correctionHistoryQuery = useSprCycleCorrectionHistory(
    cycleRecordIds,
    displayMode === 'pending_approval',
  );
  const processVariant = useMemo(
    () => resolveSprProcessStatusVariant(displayMode, correctionHistoryQuery.hasCorrectionHistory),
    [correctionHistoryQuery.hasCorrectionHistory, displayMode],
  );
  const rejectedRecordId = useMemo(() => findSprRejectedRecordId(recordsQuery.data), [recordsQuery.data]);
  const approvalsQuery = useSprRecordApprovals(
    displayMode === 'rejected' && isCorrectingRejectedForm ? rejectedRecordId : null,
  );
  const rejectionContext = useMemo(
    () => (displayMode === 'rejected' && isCorrectingRejectedForm ? resolveSprRejectionContext(approvalsQuery.data) : null),
    [approvalsQuery.data, displayMode, isCorrectingRejectedForm],
  );

  useEffect(() => {
    if (displayMode !== 'rejected') {
      setIsCorrectingRejectedForm(false);
    }
  }, [displayMode]);

  if (parametersQuery.isLoading || recordsQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Cargando formulario SPR…</p>
      </div>
    );
  }

  if (displayMode === 'rejected' && isCorrectingRejectedForm) {
    return <SprMonthlyEntryView correctionMode rejectionContext={rejectionContext} />;
  }

  if (displayMode === 'rejected' && !isCorrectingRejectedForm) {
    return (
      <SprSubmittedStatusView
        signDateLabel={signDateLabel}
        variant="rejected"
        processVariant="rejected"
        onStartCorrections={() => setIsCorrectingRejectedForm(true)}
      />
    );
  }

  if (displayMode === 'pending_approval') {
    return (
      <SprSubmittedStatusView
        signDateLabel={signDateLabel}
        variant="pending_approval"
        processVariant={correctionHistoryQuery.isLoading ? 'initial' : processVariant}
      />
    );
  }

  return <SprMonthlyEntryView />;
}
