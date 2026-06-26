import { useQuery } from '@tanstack/react-query';
import { getInspectionDashboardSummary } from '../services/inspections.service';

export function useInspectionDashboardSummary() {
  return useQuery({
    queryKey: ['inspections', 'dashboard', 'summary'],
    queryFn: () => getInspectionDashboardSummary(),
  });
}