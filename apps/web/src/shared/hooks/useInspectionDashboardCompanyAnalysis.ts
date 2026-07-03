import { useQuery } from '@tanstack/react-query';
import { getInspectionDashboardCompanyAnalysis } from '../services/inspections.service';

export function useInspectionDashboardCompanyAnalysis() {
  return useQuery({
    queryKey: ['inspections', 'dashboard', 'company-analysis'],
    queryFn: () => getInspectionDashboardCompanyAnalysis(),
  });
}
