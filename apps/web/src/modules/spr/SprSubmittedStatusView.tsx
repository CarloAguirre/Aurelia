import { SprProcessStatusSection } from './components/SprProcessStatusSection';
import { SprSubmittedSummaryHeader, type SprSubmittedSummaryVariant } from './components/SprSubmittedSummaryHeader';
import type { SprProcessStatusVariant } from './sprSubmittedStatus';

interface SprSubmittedStatusViewProps {
  signDateLabel: string;
  variant?: SprSubmittedSummaryVariant;
  processVariant?: SprProcessStatusVariant;
  onStartCorrections?: () => void;
}

// Vista post-envio del formulario SPR (Figma 1666:2149 / 1672:5810 / 1672:8557).
export function SprSubmittedStatusView({
  signDateLabel,
  variant = 'pending_approval',
  processVariant = 'initial',
  onStartCorrections,
}: SprSubmittedStatusViewProps) {
  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-y-auto bg-[#f7f7f7]">
      <div className="flex flex-col gap-[14px] px-[22px] py-[18px]">
        <SprSubmittedSummaryHeader signDateLabel={signDateLabel} variant={variant} />
        <SprProcessStatusSection variant={processVariant} />
        {variant === 'rejected' && onStartCorrections ? (
          <button
            type="button"
            onClick={onStartCorrections}
            className="self-start font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold text-[#24588b] underline-offset-2 hover:underline"
          >
            Corregir formulario
          </button>
        ) : null}
      </div>
    </div>
  );
}
