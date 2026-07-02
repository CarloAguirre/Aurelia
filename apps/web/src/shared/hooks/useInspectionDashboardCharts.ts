import { useQuery } from '@tanstack/react-query';
import { getInspectionDashboardCharts } from '../services/inspections.service';

export function useInspectionDashboardCharts() {
  return useQuery({
    queryKey: ['inspections', 'dashboard', 'charts'],
    queryFn: () => getInspectionDashboardCharts(),
  });
}
