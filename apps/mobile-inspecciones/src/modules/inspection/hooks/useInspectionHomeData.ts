import { useQuery } from '@tanstack/react-query';
import { fetchInspections } from '../../../shared/services/inspections.api';
import { fetchInspectionHomeSummary } from '../../../shared/services/api/inspection-home.api';

export function useInspectionHomeSummary() {
  return useQuery({
    queryKey: ['mobile-inspecciones', 'inspection-home-summary'],
    queryFn: fetchInspectionHomeSummary,
  });
}

export function useMobileInspections() {
  return useQuery({
    queryKey: ['mobile-inspecciones', 'inspections'],
    queryFn: fetchInspections,
  });
}
