import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSprParameters } from '../../shared/hooks/useSprParameters';
import { useSprMonthlyRecords } from '../../shared/hooks/useSprMonthlyRecords';
import { useSprCycleCorrectionHistory } from '../../shared/hooks/useSprCycleCorrectionHistory';
import { SprAreaReviewView } from './SprAreaReviewView';
import { SprAreaStatusView } from './SprAreaStatusView';
import {
  SPR_ACTIVE_CYCLE,
  SPR_AREA_DEMO_APPROVED_STATE,
  SPR_AREA_DEMO_STATE_QUERY,
} from './spr.constants';
import { resolveSprAreaDisplayMode, resolveSprAreaEffectiveDisplayMode } from './sprAreaStatus';
import {
  getSprCycleRecordIds,
  resolveSprManagerApprovalDateLabel,
  resolveSprSignDateLabel,
} from './sprSubmittedStatus';

export function SprAreaView() {
  const [searchParams] = useSearchParams();
  const demoState = searchParams.get(SPR_AREA_DEMO_STATE_QUERY);
  const parametersQuery = useSprParameters();
  const recordsQuery = useSprMonthlyRecords({
    periodYear: SPR_ACTIVE_CYCLE.periodYear,
    periodMonth: SPR_ACTIVE_CYCLE.periodMonth,
  });

  const totalParameterCount = parametersQuery.data?.length ?? 0;
  const displayMode = useMemo(
    () => resolveSprAreaDisplayMode(recordsQuery.data, totalParameterCount),
    [recordsQuery.data, totalParameterCount],
  );
  const cycleRecordIds = useMemo(() => getSprCycleRecordIds(recordsQuery.data), [recordsQuery.data]);
  const needsCorrectionHistory = displayMode === 'pending_review';
  const correctionHistoryQuery = useSprCycleCorrectionHistory(cycleRecordIds, needsCorrectionHistory);
  const effectiveDisplayMode = useMemo(() => {
    if (demoState === SPR_AREA_DEMO_APPROVED_STATE) return 'approved' as const;
    return resolveSprAreaEffectiveDisplayMode(displayMode, correctionHistoryQuery.hasCorrectionHistory);
  }, [correctionHistoryQuery.hasCorrectionHistory, demoState, displayMode]);
  const signDateLabel = useMemo(() => resolveSprSignDateLabel(recordsQuery.data), [recordsQuery.data]);
  const managerApprovalDateLabel = useMemo(
    () => resolveSprManagerApprovalDateLabel(recordsQuery.data),
    [recordsQuery.data],
  );

  const isDemoApproved = demoState === SPR_AREA_DEMO_APPROVED_STATE;

  if (!isDemoApproved && (parametersQuery.isLoading || recordsQuery.isLoading)) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Cargando vista SPR del área…</p>
      </div>
    );
  }

  if (!isDemoApproved && needsCorrectionHistory && correctionHistoryQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Cargando historial del ciclo…</p>
      </div>
    );
  }

  if (!isDemoApproved && (parametersQuery.isError || recordsQuery.isError)) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7] px-[22px]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#bd3b5b]">
          No se pudo cargar el estado del formulario SPR. Intenta recargar la página.
        </p>
      </div>
    );
  }

  if (effectiveDisplayMode === 'waiting_for_responsible') {
    return <SprAreaStatusView signDateLabel={signDateLabel} mode="waiting_for_responsible" />;
  }

  // PROVISIONAL: Figma 1672:5531 cableado pendiente de confirmar copy KPI con Alexis (pregunta C1).
  // Espejo de 1672:5810 del responsable. Solo lectura.
  if (effectiveDisplayMode === 'rejected_pending_correction') {
    return <SprAreaStatusView signDateLabel={signDateLabel} mode="rejected_pending_correction" />;
  }

  // PROVISIONAL: implementado sin confirmar con Alexis si esta vista debe navegar a review UI (pregunta G2 pendiente).
  // Figma 1672:8268 — espejo de 1672:8557 del responsable. Solo lectura, sin CTA inventado.
  if (effectiveDisplayMode === 'pending_review_after_correction') {
    return <SprAreaStatusView signDateLabel={signDateLabel} mode="pending_review_after_correction" />;
  }

  if (effectiveDisplayMode === 'pending_review') {
    return <SprAreaReviewView />;
  }

  if (effectiveDisplayMode === 'approved') {
    return (
      <SprAreaStatusView
        signDateLabel={signDateLabel}
        managerApprovalDateLabel={managerApprovalDateLabel}
        mode="approved"
      />
    );
  }

  return null;
}
