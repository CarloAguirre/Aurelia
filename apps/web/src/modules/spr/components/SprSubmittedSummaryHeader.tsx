import {
  SPR_ACTIVE_CYCLE,
  SPR_APPROVED_STATUS,
  SPR_MANAGER_REJECTED_WAITING_STATUS,
  SPR_MANAGER_WAITING_STATUS,
  SPR_REJECTED_STATUS,
  SPR_SUBMITTED_STATUS,
} from '../spr.constants';

export type SprSubmittedSummaryVariant =
  | 'pending_approval'
  | 'rejected'
  | 'completed'
  | 'waiting_for_responsible'
  | 'manager_corrections_pending';

interface SprSubmittedSummaryHeaderProps {
  signDateLabel: string;
  variant?: SprSubmittedSummaryVariant;
}

function SummaryColumn({
  label,
  value,
  helper,
  valueClassName,
  withDivider = true,
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName: string;
  withDivider?: boolean;
}) {
  return (
    <div className={`flex flex-col ${withDivider ? 'border-r border-[#e3e3e3] pr-[21px]' : 'px-[20px]'}`}>
      <p className="pb-[3px] font-['Inter:Bold',sans-serif] text-[9px] font-bold uppercase tracking-[0.63px] text-[#acacac]">{label}</p>
      <p className={`font-['Inter:Bold',sans-serif] text-[12px] font-bold ${valueClassName}`}>{value}</p>
      <p className="pt-px font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">{helper}</p>
    </div>
  );
}

// Barra resumen post-envio (Figma 1666:2149 / 1672:8919 / 1672:11206).
export function SprSubmittedSummaryHeader({ signDateLabel, variant = 'pending_approval' }: SprSubmittedSummaryHeaderProps) {
  const statusCopy =
    variant === 'rejected'
      ? SPR_REJECTED_STATUS
      : variant === 'completed'
        ? SPR_APPROVED_STATUS
        : variant === 'waiting_for_responsible'
          ? SPR_MANAGER_WAITING_STATUS
          : variant === 'manager_corrections_pending'
            ? SPR_MANAGER_REJECTED_WAITING_STATUS
            : SPR_SUBMITTED_STATUS;
  const formStatusColor =
    variant === 'rejected' || variant === 'manager_corrections_pending'
      ? 'text-[#570b1d]'
      : variant === 'completed'
        ? 'text-[#3a9b3a]'
        : 'text-[#8e6e3e]';

  return (
    <div className="w-full border-b border-[#e3e3e3] bg-white px-[20px] py-[10px]">
      <div className="flex flex-wrap items-stretch">
        <SummaryColumn
          label="Ciclo"
          value={SPR_ACTIVE_CYCLE.label}
          helper={SPR_ACTIVE_CYCLE.cycleStatusLabel}
          valueClassName="text-[#131313]"
        />
        <div className="pl-[20px]">
          <SummaryColumn
            label="Tu formulario"
            value={statusCopy.formStatusLabel}
            helper={statusCopy.formStatusHelper}
            valueClassName={formStatusColor}
          />
        </div>
        <SummaryColumn
          label="Reporte SPR"
          value={statusCopy.reportStatusLabel}
          helper={`Fecha de firma · ${signDateLabel}`}
          valueClassName="text-[#24588b]"
          withDivider={false}
        />
      </div>
    </div>
  );
}
