import { SPR_ACTIVE_CYCLE } from '../spr.constants';
import { SprRejectedStatusMarkIcon } from '../icons/SprIcons';
import type { SprRejectionContext } from '../sprRejectedContext';

export type SprCycleContextVariant = 'draft' | 'rejected';

interface SprCycleContextHeaderProps {
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  variant?: SprCycleContextVariant;
  rejectionContext?: SprRejectionContext | null;
}

function SprContextBlock({
  label,
  children,
  withDivider = true,
}: {
  label: string;
  children: React.ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div className={`flex flex-col justify-center pr-[21px] ${withDivider ? 'border-r border-[#e3e3e3]' : ''}`}>
      <p className="font-['Inter:Bold',sans-serif] text-[9px] font-bold uppercase tracking-[0.63px] text-[#acacac]">{label}</p>
      {children}
    </div>
  );
}

export function SprCycleContextHeader({
  completedCount,
  totalCount,
  isLoading,
  isError,
  variant = 'draft',
  rejectionContext = null,
}: SprCycleContextHeaderProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const progressLabel = isLoading
    ? 'Cargando parámetros...'
    : isError
      ? 'No disponible'
      : `${completedCount} de ${totalCount} completados`;

  return (
    <div className="w-full border-b border-[#e3e3e3] bg-white px-[20px] py-[11px]">
      <div className="flex flex-wrap items-stretch gap-x-[21px] gap-y-[12px]">
        <SprContextBlock label="Ciclo activo">
          <p className="pt-[3px] font-['Inter:Bold',sans-serif] text-[12px] font-bold text-[#131313]">{SPR_ACTIVE_CYCLE.label}</p>
          <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">{SPR_ACTIVE_CYCLE.rangeLabel}</p>
        </SprContextBlock>

        {/* PLACEHOLDER: fecha limite sin respaldo en backend */}
        <div className="border-r border-[#e3e3e3] pl-[20px]">
          <SprContextBlock label="Fecha límite" withDivider={false}>
            <p className="pt-[3px] font-['Inter:Bold',sans-serif] text-[13px] font-bold text-[#e8a820]">{SPR_ACTIVE_CYCLE.deadlineLabel}</p>
            <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">{SPR_ACTIVE_CYCLE.deadlineHelper}</p>
          </SprContextBlock>
        </div>

        <div className="border-r border-[#e3e3e3] pl-[20px]">
          <SprContextBlock label="Estado" withDivider={false}>
            {variant === 'rejected' ? (
              <>
                <div className="flex items-center gap-[5px] pt-[3px]">
                  <SprRejectedStatusMarkIcon className="size-[11px] shrink-0 text-[#bd3b5b]" />
                  <p className="font-['Inter:Bold',sans-serif] text-[11px] font-bold text-[#bd3b5b]">
                    {rejectionContext?.statusLabel ?? 'Rechazado — pendiente corrección'}
                  </p>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">
                  {rejectionContext?.statusHelper ?? 'Rechazado recientemente'}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-[5px] pt-[3px]">
                  <span className="size-[8px] rounded-full bg-[#24588b]" aria-hidden />
                  <p className="font-['Inter:Bold',sans-serif] text-[11px] font-bold text-[#24588b]">Borrador en progreso</p>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#646464]">Guardado automáticamente</p>
              </>
            )}
          </SprContextBlock>
        </div>

        <div className="flex min-w-[240px] flex-1 flex-col justify-center pl-[20px]">
          <p className="font-['Inter:Bold',sans-serif] text-[9px] font-bold uppercase tracking-[0.63px] text-[#acacac]">Progreso del formulario</p>
          <div className="flex items-center justify-between pt-[3px]">
            <p className="font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold text-[#131313]">{progressLabel}</p>
            <p className="font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold text-[#646464]">{percent}%</p>
          </div>
          <div className="mt-[6px] h-[6px] w-full overflow-hidden rounded-[3px] bg-[#e3e3e3]">
            <div className="h-full rounded-[3px] bg-[#00b398] transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
