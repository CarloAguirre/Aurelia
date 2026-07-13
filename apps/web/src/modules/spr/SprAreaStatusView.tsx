import { SprProcessStatusSection } from './components/SprProcessStatusSection';
import { SprSubmittedSummaryHeader } from './components/SprSubmittedSummaryHeader';
import type { SprAreaStatusViewMode } from './sprAreaStatus';

interface SprAreaStatusViewProps {
  signDateLabel: string;
  mode: SprAreaStatusViewMode;
}

const STATUS_VIEW_CONFIG: Record<
  SprAreaStatusViewMode,
  {
    summaryVariant: 'waiting_for_responsible' | 'pending_approval' | 'manager_corrections_pending';
    processVariant: 'manager_waiting' | 'manager_rejected_waiting_correction' | 'manager_pending_re_review';
  }
> = {
  waiting_for_responsible: {
    summaryVariant: 'waiting_for_responsible',
    processVariant: 'manager_waiting',
  },
  // PROVISIONAL: Figma 1672:5531 — copy KPI pendiente de confirmar con Alexis (pregunta C1).
  rejected_pending_correction: {
    summaryVariant: 'manager_corrections_pending',
    processVariant: 'manager_rejected_waiting_correction',
  },
  // Figma 1672:8268 — PROVISIONAL G2.
  pending_review_after_correction: {
    summaryVariant: 'pending_approval',
    processVariant: 'manager_pending_re_review',
  },
};

// Vista de estado del gerente de area (Figma 1672:4446 / 1672:5531 provisional C1 / 1672:8268).
export function SprAreaStatusView({ signDateLabel, mode }: SprAreaStatusViewProps) {
  const { summaryVariant, processVariant } = STATUS_VIEW_CONFIG[mode];

  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-y-auto bg-[#f7f7f7]">
      <div className="flex flex-col gap-[14px] px-[22px] py-[18px]">
        <SprSubmittedSummaryHeader signDateLabel={signDateLabel} variant={summaryVariant} />
        <SprProcessStatusSection variant={processVariant} />
      </div>
    </div>
  );
}
