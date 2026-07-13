import { useQuery } from '@tanstack/react-query';
import { getSprParameters } from '../services/spr.service';

export function useSprParameters() {
  return useQuery({
    queryKey: ['spr', 'parameters'],
    queryFn: getSprParameters,
  });
}
