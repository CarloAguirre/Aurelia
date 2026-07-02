import { useMemo } from 'react';
import { useInspectionDashboardSummary } from '../../../shared/hooks/useInspectionDashboardSummary';
import { useInspectionsList } from '../../../shared/hooks/useInspectionsList';
import {
  buildDashboardRuntimeModel,
  DASHBOARD_OPEN_DETAILS_ROW_COUNT,
  getOpenDetailRow,
} from '../dashboardRuntime';

export function useDashboardOpenFindings() {
  const summaryQuery = useInspectionDashboardSummary();
  const inspectionsQuery = useInspectionsList();

  const runtimeModel = useMemo(
    () => buildDashboardRuntimeModel(summaryQuery.data, inspectionsQuery.data),
    [inspectionsQuery.data, summaryQuery.data],
  );

  const inspectionNumbers = useMemo(
    () => Array.from({ length: DASHBOARD_OPEN_DETAILS_ROW_COUNT }, (_, index) => getOpenDetailRow(runtimeModel, index).inspectionNumber),
    [runtimeModel],
  );

  const companyNames = useMemo(
    () => Array.from({ length: DASHBOARD_OPEN_DETAILS_ROW_COUNT }, (_, index) => getOpenDetailRow(runtimeModel, index).company),
    [runtimeModel],
  );

  const areaNames = useMemo(
    () => Array.from({ length: DASHBOARD_OPEN_DETAILS_ROW_COUNT }, (_, index) => getOpenDetailRow(runtimeModel, index).area),
    [runtimeModel],
  );

  const ageDays = useMemo(
    () => Array.from({ length: DASHBOARD_OPEN_DETAILS_ROW_COUNT }, (_, index) => getOpenDetailRow(runtimeModel, index).ageDays),
    [runtimeModel],
  );

  const openFindingsValues = useMemo(
    () => Array.from({ length: DASHBOARD_OPEN_DETAILS_ROW_COUNT }, (_, index) => getOpenDetailRow(runtimeModel, index).openFindings),
    [runtimeModel],
  );

  return {
    runtimeModel,
    inspectionNumbers,
    companyNames,
    areaNames,
    ageDays,
    openFindingsValues,
    openDetailsRowCount: DASHBOARD_OPEN_DETAILS_ROW_COUNT,
    isLoading: summaryQuery.isLoading || inspectionsQuery.isLoading,
    isError: summaryQuery.isError || inspectionsQuery.isError,
  };
}
