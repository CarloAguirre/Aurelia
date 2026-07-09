import { useQuery } from '@tanstack/react-query';
import { getSprAssignments } from '../services/spr.service';

export function useSprAssignments() {
  return useQuery({
    queryKey: ['spr', 'assignments'],
    queryFn: getSprAssignments,
  });
}
