import { useQuery } from '@tanstack/react-query';
import { fetchAreas, fetchSectors } from '../../shared/services/api/organization.api';
import { useManualInspectionDraft } from './manualInspection.store';

export const manualInspectionCatalogKeys = {
  areas: ['manual-inspection', 'areas'] as const,
  sectors: (areaId: string | null) => ['manual-inspection', 'sectors', areaId] as const,
};

export function useManualInspectionCatalogs() {
  const areaId = useManualInspectionDraft((state) => state.areaId);

  const areasQuery = useQuery({
    queryKey: manualInspectionCatalogKeys.areas,
    queryFn: fetchAreas,
  });

  const sectorsQuery = useQuery({
    queryKey: manualInspectionCatalogKeys.sectors(areaId),
    queryFn: () => fetchSectors(areaId ?? ''),
    enabled: areaId !== null,
  });

  return {
    areasQuery,
    sectorsQuery,
    areas: areasQuery.data ?? [],
    sectors: sectorsQuery.data ?? [],
    loadingAreas: areasQuery.isLoading,
    loadingSectors: sectorsQuery.isLoading,
  };
}
