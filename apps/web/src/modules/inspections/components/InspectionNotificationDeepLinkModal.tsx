import type { InspectionDetailFindingGroupKey } from '@aurelia/contracts';
import { useLocation, useNavigate } from 'react-router-dom';
import type { InspectionDetailModalRecord } from './InspectionDetailModal';
import { InspectionDetailModalDataBridge } from './InspectionDetailModalDataBridge';

function normalizeInspectionNumber(value: string | null) {
  if (!value) return '#—';
  return value.startsWith('#') ? value : `#${value}`;
}

function parseFindingGroup(value: string | null): InspectionDetailFindingGroupKey | undefined {
  if (value === 'executed' || value === 'open' || value === 'closed' || value === 'rejected') return value;
  return undefined;
}

function buildFallbackRecord(params: URLSearchParams): InspectionDetailModalRecord {
  return {
    id: normalizeInspectionNumber(params.get('inspectionNumber')),
    title: 'Detalle de inspección',
    kind: 'finding',
    metadataLine1: 'Inspección desde notificación',
    metadataLine2: 'Cargando detalle real',
    progressPercent: 0,
    counts: { executed: 0, open: 0, closed: 0, rejected: 0 },
  };
}

function removeDeepLinkParams(search: string) {
  const params = new URLSearchParams(search);
  ['notification', 'inspectionId', 'inspectionNumber', 'findingId', 'group', 'notificationId'].forEach((key) => params.delete(key));
  const nextSearch = params.toString();
  return nextSearch ? `?${nextSearch}` : '';
}

export function InspectionNotificationDeepLinkModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const notificationSource = params.get('notification') === '1';
  const inspectionId = notificationSource ? params.get('inspectionId') : null;
  const initialFindingGroup = parseFindingGroup(params.get('group'));

  function closeModal() {
    navigate({ pathname: location.pathname, search: removeDeepLinkParams(location.search) }, { replace: true });
  }

  if (!inspectionId) return null;
  return <InspectionDetailModalDataBridge open inspectionId={inspectionId} record={buildFallbackRecord(params)} initialFindingGroup={initialFindingGroup} onClose={closeModal} />;
}
