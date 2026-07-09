import { useMemo } from 'react';
import { AppSidebar } from '../../shared/layout/AppSidebar';
import { useSessionStore } from '../../shared/stores/session.store';
import { useSprParameters } from '../../shared/hooks/useSprParameters';
import { useSprMonthlyRecords } from '../../shared/hooks/useSprMonthlyRecords';
import { DashboardFrameShell } from '../dashboard/components/DashboardSections';
import { SprFormView } from './SprFormView';
import { SPR_ACTIVE_CYCLE } from './spr.constants';
import { isSprFormSubmitted } from './sprSubmittedStatus';

function SprPageHeader() {
  const user = useSessionStore((state) => state.user);
  const parametersQuery = useSprParameters();
  const recordsQuery = useSprMonthlyRecords({
    periodYear: SPR_ACTIVE_CYCLE.periodYear,
    periodMonth: SPR_ACTIVE_CYCLE.periodMonth,
  });

  const isSubmitted = useMemo(
    () => isSprFormSubmitted(recordsQuery.data, parametersQuery.data?.length ?? 0),
    [recordsQuery.data, parametersQuery.data?.length],
  );

  const subtitle = isSubmitted
    ? `Vista: ${user?.fullName ?? 'Usuario'} · Responsable de Área · Servicios Técnicos`
    : 'Carga mensual de parámetros del período activo';

  return (
    <div className="relative h-[56px] w-full shrink-0 bg-white" data-name="Header">
      <div aria-hidden className="pointer-events-none absolute inset-0 border-b border-solid border-[#e3e3e3]" />
      <div className="relative flex size-full items-center px-[22px] pb-px">
        <div className="flex flex-col items-start">
          <p className="whitespace-nowrap font-['Inter:Bold',sans-serif] text-[15px] font-bold leading-[normal] text-[#131313]">
            SPR — Mi formulario · Servicios Técnicos
          </p>
          <p className="whitespace-nowrap pt-px font-['Inter:Regular',sans-serif] text-[11px] font-normal leading-[normal] text-[#646464]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SprPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden" data-name="SPR - Mi formulario">
      <AppSidebar />
      <DashboardFrameShell header={<SprPageHeader />} content={<SprFormView />} />
    </div>
  );
}
