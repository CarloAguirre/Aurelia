import { useMemo } from 'react';
import type { InspectionDashboardChartsResponse } from '@aurelia/contracts';
import { useInspectionDashboardCharts } from '../../../shared/hooks/useInspectionDashboardCharts';
import { useInspectionsList } from '../../../shared/hooks/useInspectionsList';
import {
  buildAreaObservationsRows,
  buildClosureMetrics,
  type DashboardMonthlySeriesRow,
} from '../dashboardRuntime';

function buildMonthlySeriesRowsFromCharts(data: InspectionDashboardChartsResponse | undefined): DashboardMonthlySeriesRow[] {
  if (!data) {
    return Array.from({ length: 12 }, (_, index) => ({
      month: new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(new Date().getFullYear(), index, 1)).replace('.', ''),
      inspections: 0,
      findings: 0,
      closedFindings: 0,
      openFindings: 0,
    }));
  }

  return data.monthlyFindings.map((row) => ({
    month: row.label,
    inspections: 0,
    findings: row.closed + row.open,
    closedFindings: row.closed,
    openFindings: row.open,
  }));
}

export function useDashboardCharts() {
  const chartsQuery = useInspectionDashboardCharts();
  const inspectionsQuery = useInspectionsList();
  const inspections = inspectionsQuery.data ?? [];

  const annualInspectionRows = useMemo(
    () => chartsQuery.data?.annualInspections ?? [],
    [chartsQuery.data],
  );

  const monthlySeriesRows = useMemo(
    () => buildMonthlySeriesRowsFromCharts(chartsQuery.data),
    [chartsQuery.data],
  );

  const areaObservationRows = useMemo(
    () => buildAreaObservationsRows(inspectionsQuery.data),
    [inspectionsQuery.data],
  );

  const closureMetrics = useMemo(
    () => chartsQuery.data
      ? {
          historicalClosureRate: chartsQuery.data.closure.historicalRate,
          periodClosureRate: chartsQuery.data.closure.periodRate,
          periodLabel: chartsQuery.data.closure.periodLabel,
        }
      : buildClosureMetrics(undefined, inspectionsQuery.data),
    [chartsQuery.data, inspectionsQuery.data],
  );

  return {
    inspections,
    annualInspectionRows,
    monthlySeriesRows,
    areaObservationRows,
    closureMetrics,
    isLoading: chartsQuery.isLoading || inspectionsQuery.isLoading,
    isError: chartsQuery.isError || inspectionsQuery.isError,
  };
}
