import { useQuery } from '@tanstack/react-query';
import { fetchCompanies } from '../../../shared/services/api/organization.api';

export function useManualInspectionCompanies() {
  return useQuery({
    queryKey: ['mobile-inspecciones', 'manual-inspection', 'contractor-companies'],
    queryFn: () => fetchCompanies(true),
  });
}
