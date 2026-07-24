import { useLocalSearchParams } from 'expo-router';
import { InspectionDetailFigmaScreen } from '../../../src/modules/inspection/InspectionDetailFigmaScreen';

export default function InspectionDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const inspectionId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <InspectionDetailFigmaScreen inspectionId={inspectionId ?? ''} />;
}
