import { useMemo } from 'react';
import { useSprParameters } from '../../shared/hooks/useSprParameters';
import { useSprMonthlyRecords } from '../../shared/hooks/useSprMonthlyRecords';
import { useSprCycleCorrectionHistory } from '../../shared/hooks/useSprCycleCorrectionHistory';
import { SprAreaReviewView } from './SprAreaReviewView';
import { SprAreaStatusView } from './SprAreaStatusView';
import { SPR_ACTIVE_CYCLE } from './spr.constants';
import { resolveSprAreaDisplayMode, resolveSprAreaEffectiveDisplayMode } from './sprAreaStatus';
import { getSprCycleRecordIds, resolveSprSignDateLabel } from './sprSubmittedStatus';

function SprAreaPendingNodePlaceholder({ displayMode }: { displayMode: string }) {
  return (
    <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7] px-[22px]">
      <p className="max-w-[480px] text-center font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">
        Vista del gerente para el estado <span className="font-semibold text-[#131313]">{displayMode}</span> pendiente de
        implementación (siguiente nodo Figma de la fila Gerente de Área).
      </p>
    </div>
  );
}

export function SprAreaView() {
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
  const effectiveDisplayMode = useMemo(
    () => resolveSprAreaEffectiveDisplayMode(displayMode, correctionHistoryQuery.hasCorrectionHistory),
    [correctionHistoryQuery.hasCorrectionHistory, displayMode],
  );
  const signDateLabel = useMemo(() => resolveSprSignDateLabel(recordsQuery.data), [recordsQuery.data]);

  if (parametersQuery.isLoading || recordsQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Cargando vista SPR del área…</p>
      </div>
    );
  }

  if (needsCorrectionHistory && correctionHistoryQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#f7f7f7]">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Cargando historial del ciclo…</p>
      </div>
    );
  }

  if (parametersQuery.isError || recordsQuery.isError) {
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

  // approved del gerente: placeholder hasta que Alexis confirme el nodo Figma (pregunta G5).
  // 1672:10661 fue candidato no confirmado y se revirtió deliberadamente.
  return <SprAreaPendingNodePlaceholder displayMode={effectiveDisplayMode} />;
}
