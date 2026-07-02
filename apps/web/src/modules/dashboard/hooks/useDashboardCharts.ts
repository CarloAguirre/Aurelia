import { useMemo } from 'react';
import { useInspectionDashboardSummary } from '../../../shared/hooks/useInspectionDashboardSummary';
import { useInspectionsList } from '../../../shared/hooks/useInspectionsList';
import {
  buildAreaObservationsRows,
  buildClosureMetrics,
  buildMonthlySeriesRows,
} from '../dashboardRuntime';

export function useDashboardCharts() {
  const summaryQuery = useInspectionDashboardSummary();
  const inspectionsQuery = useInspectionsList();

  const monthlySeriesRows = useMemo(
    () => buildMonthlySeriesRows(inspectionsQuery.data),
    [inspectionsQuery.data],
  );

  const areaObservationRows = useMemo(
    () => buildAreaObservationsRows(inspectionsQuery.data),
    [inspectionsQuery.data],
  );

  const closureMetrics = useMemo(
    () => buildClosureMetrics(summaryQuery.data, inspectionsQuery.data),
    [inspectionsQuery.data, summaryQuery.data],
  );

  return {
    monthlySeriesRows,
    areaObservationRows,
    closureMetrics,
    isLoading: summaryQuery.isLoading || inspectionsQuery.isLoading,
    isError: summaryQuery.isError || inspectionsQuery.isError,
  };
}
