import svgPaths from "./svg-gaoncjys4y";
import { useDashboardCharts } from './hooks/useDashboardCharts';
import { useDashboardCompanyAnalysis } from './hooks/useDashboardCompanyAnalysis';
import { useDashboardKpis } from './hooks/useDashboardKpis';
import { useDashboardOpenFindings } from './hooks/useDashboardOpenFindings';
import {
  DashboardAreaObservationsCard,
  DashboardAreaObservationsHeaderPrimary,
  DashboardAreaObservationsHeaderSecondary,
  DashboardAnnualKpiClosedCard,
  DashboardAnnualKpiFindingsCard,
  DashboardCoreAnalysisSection,
  DashboardAnnualHeaderLeft,
  DashboardAnnualHeaderRight,
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
  DashboardOpenFindingsDetailsTable,
  DashboardSecondaryPanelStack,
  DashboardOpenFindingsTable,
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
import {
  DashboardCompanyCardOpenCompanies,
  DashboardCompanyCardOpenDays,
  DashboardCompanyCardOpenFindings,
  DashboardCompanyCardOpenInspections,
} from './components/DashboardFigmaCompanyKpiCards';

export function DashboardPage() {
  const { runtimeModel: kpisRuntimeModel, isLoading: isKpisLoading, isError: isKpisError } = useDashboardKpis();
  const { annualInspectionRows, monthlySeriesRows, areaObservationRows, closureMetrics, isLoading: isChartsLoading, isError: isChartsError } = useDashboardCharts();
  const { runtimeModel: companyAnalysisRuntimeModel } = useDashboardCompanyAnalysis();
  const {
    runtimeModel: openFindingsRuntimeModel,
    inspectionNumbers,
    companyNames,
    areaNames,
    ageDays,
    openFindingsValues,
    openDetailsRowCount,
    isLoading: isOpenFindingsLoading,
    isError: isOpenFindingsError,
  } = useDashboardOpenFindings();

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
                      <DashboardAnnualHeaderLeft iconPath={svgPaths.p26a85e00} />
                      <DashboardAnnualHeaderRight dropdownCaretPath={svgPaths.pf36e620} clearIconPath={svgPaths.p12771800} />
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
                  companyAnalysis={<DashboardResponsiveCompanyAnalysisSection cardA={<DashboardCompanyCardOpenCompanies iconPath={svgPaths.p3e906a80} value={companyAnalysisRuntimeModel.companiesWithOpenFindings} />} cardB={<DashboardCompanyCardOpenFindings iconPath={svgPaths.p31927d00} value={companyAnalysisRuntimeModel.openFindings} />} cardC={<DashboardCompanyCardOpenInspections iconPath={svgPaths.p1711cfc0} value={companyAnalysisRuntimeModel.openInspections} />} cardD={<DashboardCompanyCardOpenDays iconPath={svgPaths.p162f2a3a} value={companyAnalysisRuntimeModel.openDaysLabel} />} chart={<DashboardFigmaCompanyAnalysisChart />} />}
                  openFindingsTable={
                    <DashboardOpenFindingsTable>
                      <DashboardOpenFindingsDetailsTable
                        criticalOpenFindings={openFindingsRuntimeModel.criticalOpenFindings}
                        openInspections={openFindingsRuntimeModel.openInspections}
                        inspectionNumbers={inspectionNumbers}
                        companies={companyNames}
                        areas={areaNames}
                        ageDays={ageDays}
                        openFindings={openFindingsValues}
                        rowCount={openDetailsRowCount}
                        sortIconPath={svgPaths.p2c5a2400}
                        expandIconPath={svgPaths.pf36e620}
                      />
                      {isOpenFindingsLoading ? <div className="px-[18px] py-[14px] text-[12px] text-[#646464]">Cargando detalle de observaciones...</div> : null}
                      {isOpenFindingsError ? <div className="px-[18px] py-[14px] text-[12px] text-[#570b1d]">Error al cargar detalle de observaciones.</div> : null}
                    </DashboardOpenFindingsTable>
                  }
                />
              }
            />
          </DashboardMainContentShell>
        }
      />
    </div>
  );
}
