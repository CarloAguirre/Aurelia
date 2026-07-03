import { useQuery } from '@tanstack/react-query';
import { getInspectionDashboardOpenFindings } from '../services/inspections.service';

export function useInspectionDashboardOpenFindings() {
  return useQuery({
    queryKey: ['inspections', 'dashboard', 'open-findings'],
    queryFn: () => getInspectionDashboardOpenFindings(),
  });
}
