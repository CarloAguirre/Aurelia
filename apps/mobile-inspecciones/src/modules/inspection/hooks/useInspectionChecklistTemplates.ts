import { useQuery } from '@tanstack/react-query';
import { fetchInspectionChecklistTemplates } from '../../../shared/services/api/inspection-templates.api';

export function useInspectionChecklistTemplates() {
  return useQuery({
    queryKey: ['mobile-inspecciones', 'inspection-checklist-templates'],
    queryFn: fetchInspectionChecklistTemplates,
  });
}
