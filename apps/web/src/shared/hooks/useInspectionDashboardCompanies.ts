import { useQuery } from '@tanstack/react-query';
import { getInspectionDashboardCompanies } from '../services/inspections.service';

export function useInspectionDashboardCompanies() {
  return useQuery({
    queryKey: ['inspections', 'dashboard', 'companies'],
    queryFn: getInspectionDashboardCompanies,
  });
}
