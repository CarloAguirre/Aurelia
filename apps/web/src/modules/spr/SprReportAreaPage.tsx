import { useParams } from 'react-router-dom';
import { SPR_ACTIVE_CYCLE, SPR_REPORT_DASHBOARD, resolveSprReportAreaDetail } from './spr.constants';
import { SprReportAreaView } from './SprReportAreaView';
import { AppSidebar } from '../../shared/layout/AppSidebar';
import { DashboardFrameShell } from '../dashboard/components/DashboardSections';

function SprReportAreaPageHeader({ withEstimates }: { withEstimates: boolean }) {
  return (
    <div className="relative h-[56px] w-full shrink-0 bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 border-b border-solid border-[#e3e3e3]" />
      <div className="relative flex size-full items-center justify-between gap-[12px] px-[22px] pb-px">
        <div className="flex min-w-0 flex-col items-start">
          <p className="whitespace-nowrap font-['Inter:Bold',sans-serif] text-[15px] font-bold text-[#131313]">
            {SPR_REPORT_DASHBOARD.pageTitle}
          </p>
          <p className="truncate pt-px font-['Inter:Regular',sans-serif] text-[11px] text-[#646464]">
            Ciclo {SPR_ACTIVE_CYCLE.label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-[8px]">
          <div className="flex h-[26px] items-center gap-[6px] rounded-[6px] border border-[#e3e3e3] bg-white px-[8px]">
            <span className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#131313]">
              {withEstimates ? SPR_ACTIVE_CYCLE.label : `${SPR_ACTIVE_CYCLE.label} (Actual)`}
            </span>
            {withEstimates ? (
              <span className="rounded-[4px] bg-[#f3e8ff] px-[6px] py-[1px] font-['Inter:Bold',sans-serif] text-[9px] font-bold text-[#7b4fbf]">
                {SPR_REPORT_DASHBOARD.cycleWithEstimatesBadge}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            title="Pendiente de integración con historial del ciclo"
            className="flex h-[27px] items-center rounded-[6px] border border-[#e3e3e3] bg-white px-[12px] font-['Inter:Semi_Bold',sans-serif] text-[10.5px] font-semibold text-[#24588b]"
          >
            {SPR_REPORT_DASHBOARD.traceabilityLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Detalle de área — Especialista (Figma 1560:3294 / 2587:4277). Solo lectura / mock.
export function SprReportAreaPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const resolved = resolveSprReportAreaDetail(areaSlug);
  const withEstimates = resolved?.detail.viewMode === 'estimated';

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AppSidebar />
      <DashboardFrameShell
        header={<SprReportAreaPageHeader withEstimates={Boolean(withEstimates)} />}
        content={
          resolved ? (
            <SprReportAreaView areaName={resolved.area.name} detail={resolved.detail} />
          ) : (
            <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-[#f7f7f7] px-[22px]">
              <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">
                Esta área aún no tiene detalle de consolidado disponible en el mock.
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
