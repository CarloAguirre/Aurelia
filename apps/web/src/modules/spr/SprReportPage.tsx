import { useNavigate, useSearchParams } from 'react-router-dom';

import { SPR_REPORT_FLOW_QUERY, SPR_REPORT_DASHBOARD, getSprReportDashboardConfig } from './spr.constants';
import { SPR_CYCLE_TRACEABILITY_ROUTE } from './sprCycleTraceability.constants';
import { resolveSprReportCycleContext, SPR_REPORT_CYCLE_QUERY } from './sprReportCycles';
import { SprReportCycleSelector } from './components/SprReportCycleSelector';
import { SprReportView } from './SprReportView';
import { SprTraceabilityIcon } from './icons/SprIcons';
import { AppSidebar } from '../../shared/layout/AppSidebar';
import { DashboardFrameShell } from '../dashboard/components/DashboardSections';

function SprReportPageHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cycle, flow } = resolveSprReportCycleContext(
    searchParams.get(SPR_REPORT_CYCLE_QUERY),
    searchParams.get(SPR_REPORT_FLOW_QUERY),
  );
  const config = getSprReportDashboardConfig(flow);

  return (
    <div className="relative h-[56px] w-full shrink-0 bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 border-b border-solid border-[#e3e3e3]" />
      <div className="relative flex size-full items-center justify-between gap-[12px] px-[22px] pb-px">
        <div className="flex min-w-0 flex-col items-start">
          <p className="whitespace-nowrap font-['Inter:Bold',sans-serif] text-[16px] font-bold text-[#131313]">
            {SPR_REPORT_DASHBOARD.pageTitle}
          </p>
          <p className="truncate pt-px font-['Inter:Regular',sans-serif] text-[11px] text-[#646464]">
            {config.pageSubtitle(cycle.label)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-[8px]">
          <SprReportCycleSelector cycle={cycle} />
          <button
            type="button"
            onClick={() => navigate(SPR_CYCLE_TRACEABILITY_ROUTE)}
            className="flex h-[27px] items-center gap-[5px] rounded-[6px] border border-[#e3e3e3] bg-white px-[12px] font-['Inter:Semi_Bold',sans-serif] text-[10.5px] font-semibold text-[#24588b]"
          >
            <SprTraceabilityIcon className="h-[11px] w-[13.75px] shrink-0" />
            {SPR_REPORT_DASHBOARD.traceabilityLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Dashboard Especialista (Figma 2109:49077 / 1797:46981 / 47550 / 48163).
export function SprReportPage() {
  const [searchParams] = useSearchParams();
  const { cycle, flow } = resolveSprReportCycleContext(
    searchParams.get(SPR_REPORT_CYCLE_QUERY),
    searchParams.get(SPR_REPORT_FLOW_QUERY),
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AppSidebar />
      <DashboardFrameShell header={<SprReportPageHeader />} content={<SprReportView cycle={cycle} flow={flow} />} />
    </div>
  );
}

