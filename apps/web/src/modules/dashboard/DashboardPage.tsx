import { useState } from 'react';
import svgPaths from "./svg-gaoncjys4y";
import { useDashboardChartsFiltered } from './hooks/useDashboardChartsFiltered';
import { useDashboardCompanyAnalysisFiltered } from './hooks/useDashboardCompanyAnalysisFiltered';
import { useDashboardKpisFiltered } from './hooks/useDashboardKpisFiltered';
import { useDashboardDetailsFiltered } from './hooks/useDashboardDetailsFiltered';
import type { InspectionDashboardPeriod } from '../../shared/services/inspections.service';
import {
  DashboardAreaObservationsCard,
  DashboardAreaObservationsHeaderPrimary,
  DashboardAreaObservationsHeaderSecondary,
  DashboardAnnualKpiClosedCard,
  DashboardAnnualKpiFindingsCard,
  DashboardCoreAnalysisSection,
  DashboardAnnualHeaderLeft,
  DashboardAnnualKpiHistoricalClosureCard,
  DashboardAnnualKpiInspectionsCard,
  DashboardAnnualKpiOpenCard,
  DashboardAnnualKpiYearClosureCard,
  DashboardAnnualHeaderSection,
  DashboardAlertsHeaderLeft,
  DashboardAlertsHeaderRight,
  DashboardFrameShell,
  DashboardAlertsSectionLayout,
  DashboardAlertsStrip,
  DashboardChartsBlock,
  DashboardChartsPrimaryGrid,
  DashboardMainContentShell,
  DashboardMainPanelsLayout,
  DashboardSecondaryPanelStack,
  DashboardPageHeader,
  DashboardSidebar,
  DashboardSidebarTopBrandBar,
  DashboardTopKpis,
} from './components/DashboardSections';
import {
  DashboardFigmaAnnualFindingsChartCard,
  DashboardFigmaAnnualInspectionsChartCard,
} from './components/DashboardFigmaChartCards';
import {
  DashboardFigmaClosureGaugeChartCard,
  DashboardFigmaFindingsEvolutionChartCard,
} from './components/DashboardFigmaSecondaryChartCards';
import { DashboardFigmaAreaObservationsChart } from './components/DashboardFigmaAreaObservationsChart';
import { DashboardResponsiveSecondaryGrid } from './components/DashboardResponsiveSecondaryGrid';
import { DashboardResponsiveTopKpisGrid } from './components/DashboardResponsiveTopKpisGrid';
import { DashboardResponsiveCompanyAnalysisSection } from './components/DashboardResponsiveCompanyAnalysisSection';
import { DashboardFigmaCompanyAnalysisChart } from './components/DashboardFigmaCompanyAnalysisChart';
import { DashboardFigmaOpenFindingsDetailsTable } from './components/DashboardFigmaOpenFindingsDetailsTable';
import { DashboardPeriodLite } from './components/DashboardPeriodLite';
import {
  DashboardCompanyCardOpenCompanies,
  DashboardCompanyCardOpenDays,
  DashboardCompanyCardOpenFindings,
  DashboardCompanyCardOpenInspections,
} from './components/DashboardFigmaCompanyKpiCards';

const currentYear = new Date().getFullYear();

export function DashboardPage() {
  const [dashboardQuery, setDashboardQuery] = useState({ year: currentYear, period: 'q1' as InspectionDashboardPeriod });
  const { runtimeModel: kpisRuntimeModel, isLoading: isKpisLoading, isError: isKpisError } = useDashboardKpisFiltered(dashboardQuery);
  const { annualInspectionRows, monthlySeriesRows, areaObservationRows, closureMetrics, isLoading: isChartsLoading, isError: isChartsError } = useDashboardChartsFiltered(dashboardQuery);
  const { runtimeModel: companyAnalysisRuntimeModel } = useDashboardCompanyAnalysisFiltered(dashboardQuery);
  const { rows: openFindingRows, severeOpenFindings, openInspections, isLoading: isOpenFindingsLoading, isError: isOpenFindingsError } = useDashboardDetailsFiltered(dashboardQuery);

  return (
    <div className="relative h-screen w-full overflow-hidden" data-name="Dashboard inspecciones">
      <DashboardSidebarTopBrandBar />
      <DashboardSidebar />
      <DashboardFrameShell
        header={<DashboardPageHeader />}
        content={
          <DashboardMainContentShell>
            <DashboardMainPanelsLayout
              primaryPanel={
                <DashboardCoreAnalysisSection
                  annualHeader={
                    <DashboardAnnualHeaderSection>
                      <div className="flex w-full flex-wrap items-center justify-between gap-[12px]">
                        <DashboardAnnualHeaderLeft iconPath={svgPaths.p26a85e00} />
                        <DashboardPeriodLite value={dashboardQuery} onChange={setDashboardQuery} clearIconPath={svgPaths.p12771800} caretIconPath={svgPaths.pf36e620} />
                      </div>
                    </DashboardAnnualHeaderSection>
                  }
                  topKpis={
                    <DashboardTopKpis>
                      <DashboardResponsiveTopKpisGrid>
                        <DashboardAnnualKpiInspectionsCard iconPath={svgPaths.p1711cfc0} inspectionsValue={kpisRuntimeModel.totalInspections} findingsValue={kpisRuntimeModel.totalFindings} />
                        <DashboardAnnualKpiClosedCard iconPath={svgPaths.p2acec00} closedValue={kpisRuntimeModel.closedInspections} closedRate={kpisRuntimeModel.closedRate} />
                        <DashboardAnnualKpiOpenCard iconPath={svgPaths.p162f2a3a} openValue={kpisRuntimeModel.openInspections} openLabel={kpisRuntimeModel.openLabel} />
                        <DashboardAnnualKpiFindingsCard iconPath={svgPaths.p31927d00} findingsValue={kpisRuntimeModel.totalFindings} findingsLabel={kpisRuntimeModel.findingsLabel} />
                        {isKpisLoading ? <div className="bg-white rounded-[8px] border border-[#e3e3e3] min-h-[96px] flex items-center justify-center text-[12px] text-[#646464]">Cargando KPI...</div> : <DashboardAnnualKpiYearClosureCard iconPath={svgPaths.p12a2ea00} />}
                        {isKpisError ? <div className="bg-white rounded-[8px] border border-[#ffd0db] min-h-[96px] flex items-center justify-center text-[12px] text-[#570b1d]">Error al cargar KPI</div> : <DashboardAnnualKpiHistoricalClosureCard iconPath={svgPaths.p347ba580} />}
                      </DashboardResponsiveTopKpisGrid>
                    </DashboardTopKpis>
                  }
                  charts={
                    <DashboardChartsBlock>
                      <DashboardChartsPrimaryGrid>
                        {isChartsLoading ? <div className="bg-white rounded-[10px] border border-[#e3e3e3] min-h-[320px] flex items-center justify-center text-[12px] text-[#646464]">Cargando gráfico de inspecciones...</div> : <DashboardFigmaAnnualInspectionsChartCard rows={annualInspectionRows} />}
                        {isChartsError ? <div className="bg-white rounded-[10px] border border-[#ffd0db] min-h-[320px] flex items-center justify-center text-[12px] text-[#570b1d]">Error al cargar gráfico de observaciones</div> : <DashboardFigmaAnnualFindingsChartCard rows={monthlySeriesRows} />}
                      </DashboardChartsPrimaryGrid>
                      <DashboardResponsiveSecondaryGrid>
                        <DashboardFigmaClosureGaugeChartCard rate={closureMetrics.historicalClosureRate} title="% Cierre histórico" subtitle="2023–2026" />
                        <DashboardFigmaClosureGaugeChartCard rate={closureMetrics.periodClosureRate} title="% Cierre del período" subtitle={closureMetrics.periodLabel} />
                        {isChartsError ? <div className="bg-white rounded-[8px] border border-[#ffd0db] h-[278.5px] flex items-center justify-center text-[12px] text-[#570b1d]">Error al cargar evolución</div> : <DashboardFigmaFindingsEvolutionChartCard rows={monthlySeriesRows} />}
                      </DashboardResponsiveSecondaryGrid>
                      <DashboardAreaObservationsCard headerPrimary={<DashboardAreaObservationsHeaderPrimary />} headerSecondary={<DashboardAreaObservationsHeaderSecondary />} chart={isChartsLoading ? <div className="h-[320px] w-full flex items-center justify-center text-[12px] text-[#646464]">Cargando observaciones por área...</div> : <DashboardFigmaAreaObservationsChart rows={areaObservationRows} />} />
                    </DashboardChartsBlock>
                  }
                />
              }
              secondaryPanel={
                <DashboardSecondaryPanelStack
                  alerts={
                    <DashboardAlertsStrip>
                      <DashboardAlertsSectionLayout left={<DashboardAlertsHeaderLeft iconPath={svgPaths.p16888980} />} right={<DashboardAlertsHeaderRight dropdownCaretPath={svgPaths.pf36e620} clearIconPath={svgPaths.p12771800} />} />
                    </DashboardAlertsStrip>
                  }
                  companyAnalysis={<DashboardResponsiveCompanyAnalysisSection cardA={<DashboardCompanyCardOpenCompanies iconPath={svgPaths.p3e906a80} value={companyAnalysisRuntimeModel.companiesWithOpenFindings} />} cardB={<DashboardCompanyCardOpenFindings iconPath={svgPaths.p31927d00} value={companyAnalysisRuntimeModel.openFindings} />} cardC={<DashboardCompanyCardOpenInspections iconPath={svgPaths.p1711cfc0} value={companyAnalysisRuntimeModel.openInspections} />} cardD={<DashboardCompanyCardOpenDays iconPath={svgPaths.p162f2a3a} value={companyAnalysisRuntimeModel.openDaysLabel} />} chart={<DashboardFigmaCompanyAnalysisChart rows={companyAnalysisRuntimeModel.chartRows} />} />}
                  openFindingsTable={<DashboardFigmaOpenFindingsDetailsTable rows={openFindingRows} severeOpenFindings={severeOpenFindings} openInspections={openInspections} sortIconPath={svgPaths.p2c5a2400} expandIconPath={svgPaths.pf36e620} isLoading={isOpenFindingsLoading} isError={isOpenFindingsError} />}
                />
              }
            />
          </DashboardMainContentShell>
        }
      />
    </div>
  );
}
