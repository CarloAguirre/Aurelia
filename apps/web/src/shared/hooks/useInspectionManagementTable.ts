import { useQuery } from '@tanstack/react-query';
import { getInspectionManagementTable } from '../services/inspections.service';

export function useInspectionManagementTable() {
  return useQuery({
    queryKey: ['inspections', 'management', 'table'],
    queryFn: getInspectionManagementTable,
  });
}
