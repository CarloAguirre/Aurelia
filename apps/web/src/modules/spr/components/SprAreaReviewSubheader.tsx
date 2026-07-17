import { useNavigate } from 'react-router-dom';
import { SprHistoricalRangeBadge } from './SprHistoricalRangeBadge';
import { SprTraceabilityIcon } from '../icons/SprIcons';
import { SPR_AREA_REVIEW } from '../spr.constants';
import { SPR_CYCLE_TRACEABILITY_ROUTE } from '../sprCycleTraceability.constants';

interface SprAreaReviewSubheaderProps {
  responsibleLabel: string;
  historicalAlertCount: number;
}

// Sub-header de revision del gerente (Figma 1399:13951).
export function SprAreaReviewSubheader({ responsibleLabel, historicalAlertCount }: SprAreaReviewSubheaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-[10px] border-b border-[#e3e3e3] bg-white px-[20px] py-[10px]">
      <div className="flex flex-wrap items-center gap-[10px]">
        <p className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#001e39]">
          {SPR_AREA_REVIEW.formSentTitle(responsibleLabel)}
        </p>
        <SprHistoricalRangeBadge count={historicalAlertCount} />
      </div>

      <div className="flex flex-wrap items-center gap-[8px]">
        <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">{SPR_AREA_REVIEW.readOnlyHint}</p>
        <button
          type="button"
          onClick={() => navigate(SPR_CYCLE_TRACEABILITY_ROUTE)}
          className="flex h-[27px] items-center gap-[5px] rounded-[6px] border border-[#e3e3e3] bg-white px-[12px] font-['Inter:Semi_Bold',sans-serif] text-[10.5px] font-semibold text-[#24588b] hover:bg-[#fafafa]"
        >
          <SprTraceabilityIcon className="h-[11px] w-[13.75px] shrink-0" />
          Ver trazabilidad
        </button>
      </div>
    </div>
  );
}
