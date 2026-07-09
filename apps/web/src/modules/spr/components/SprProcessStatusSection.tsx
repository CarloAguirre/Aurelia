import {
  SprProcessStatusBellIcon,
  SprProcessStatusDocumentIcon,
  SprProcessStatusRejectedIcon,
} from '../icons/SprIcons';
import { SPR_ACTIVE_CYCLE, SPR_CORRECTED_STATUS, SPR_REJECTED_STATUS, SPR_SUBMITTED_STATUS } from '../spr.constants';
import type { SprProcessStatusVariant } from '../sprSubmittedStatus';

interface SprProcessStatusSectionProps {
  variant?: SprProcessStatusVariant;
}

interface ProcessStepRowProps {
  icon: 'document' | 'rejected' | 'corrected';
  iconBgClassName: string;
  iconClassName: string;
  title: string;
  helper: string;
  badgeLabel: string;
  badgeClassName: string;
  withBottomBorder?: boolean;
}

function ProcessStepRow({
  icon,
  iconBgClassName,
  iconClassName,
  title,
  helper,
  badgeLabel,
  badgeClassName,
  withBottomBorder = false,
}: ProcessStepRowProps) {
  const Icon = icon === 'document' ? SprProcessStatusDocumentIcon : SprProcessStatusRejectedIcon;

  return (
    <div
      className={`flex flex-wrap items-center gap-[10px] px-[14px] py-[10px] ${withBottomBorder ? 'border-b border-[#f4f6f9] pb-[11px] pt-[10px]' : ''}`}
    >
      <div className={`flex size-[32px] shrink-0 items-center justify-center rounded-[8px] ${iconBgClassName}`}>
        <Icon className={`h-[13px] w-[16.25px] ${iconClassName}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-['Inter:Semi_Bold',sans-serif] text-[11.5px] font-semibold text-[#131313]">{title}</p>
        <p className="pt-px font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">{helper}</p>
      </div>

      <span
        className={`shrink-0 rounded-[4px] px-[6px] py-[2px] font-['Inter:Bold',sans-serif] text-[9px] font-bold ${badgeClassName}`}
      >
        {badgeLabel}
      </span>
    </div>
  );
}

// Tarjeta "Estatus del proceso" post-envio (Figma 1666:2384 / 1672:6045 / 1672:8792).
export function SprProcessStatusSection({ variant = 'initial' }: SprProcessStatusSectionProps) {
  return (
    <div className="w-full overflow-hidden rounded-[9px] border border-[#e3e3e3] bg-white">
      <div className="border-b border-[#e3e3e3] px-[14px] py-[10px]">
        <div className="flex items-center gap-[7px]">
          <SprProcessStatusBellIcon className="h-[12px] w-[15px] shrink-0 text-[#24588b]" />
          <p className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#001e39]">Estatus del proceso</p>
        </div>
      </div>

      {variant === 'rejected' ? (
        <>
          <ProcessStepRow
            icon="rejected"
            iconBgClassName="bg-[#ffd0db]"
            iconClassName="text-[#570b1d]"
            title={SPR_REJECTED_STATUS.rejectedStepTitle(SPR_ACTIVE_CYCLE.label)}
            helper={SPR_REJECTED_STATUS.rejectedStepHelper}
            badgeLabel={SPR_REJECTED_STATUS.rejectedBadgeLabel}
            badgeClassName="bg-[#ffeab8] text-[10px] text-[#8e6e3e]"
            withBottomBorder
          />
          <ProcessStepRow
            icon="document"
            iconBgClassName="bg-[#e0ffd3]"
            iconClassName="text-[#2a5c16]"
            title={SPR_REJECTED_STATUS.emittedStepTitle(SPR_ACTIVE_CYCLE.label)}
            helper={SPR_REJECTED_STATUS.emittedStepHelper}
            badgeLabel="Completado"
            badgeClassName="bg-[#e0ffd3] text-[#2a5c16]"
          />
        </>
      ) : variant === 'corrected' ? (
        <>
          <ProcessStepRow
            icon="corrected"
            iconBgClassName="bg-[#e0ffd3]"
            iconClassName="text-[#2a5c16]"
            title={SPR_CORRECTED_STATUS.correctedStepTitle(SPR_ACTIVE_CYCLE.label)}
            helper={SPR_CORRECTED_STATUS.correctedStepHelper}
            badgeLabel="Completado"
            badgeClassName="bg-[#e0ffd3] text-[#2a5c16]"
            withBottomBorder
          />
          <ProcessStepRow
            icon="document"
            iconBgClassName="bg-[#e0ffd3]"
            iconClassName="text-[#2a5c16]"
            title={SPR_CORRECTED_STATUS.emittedStepTitle(SPR_ACTIVE_CYCLE.label)}
            helper={SPR_CORRECTED_STATUS.emittedStepHelper}
            badgeLabel="Completado"
            badgeClassName="bg-[#e0ffd3] text-[#2a5c16]"
          />
        </>
      ) : (
        <ProcessStepRow
          icon="document"
          iconBgClassName="bg-[#e0ffd3]"
          iconClassName="text-[#2a5c16]"
          title={SPR_SUBMITTED_STATUS.processStepTitle(SPR_ACTIVE_CYCLE.label)}
          helper={SPR_SUBMITTED_STATUS.processStepHelper}
          badgeLabel="Completado"
          badgeClassName="bg-[#e0ffd3] text-[#2a5c16]"
        />
      )}
    </div>
  );
}
