import { useEffect } from 'react';
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

function statusLabelForGroup(value: InspectionDetailFindingGroupKey | undefined) {
  if (value === 'executed') return 'ejecutadas';
  if (value === 'open') return 'abiertas';
  if (value === 'closed') return 'cerradas';
  if (value === 'rejected') return 'rechazadas';
  return null;
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

function clickStatusRow(group: InspectionDetailFindingGroupKey | undefined) {
  const label = statusLabelForGroup(group);
  if (!label) return false;
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'));
  const target = buttons.find((button) => button.textContent?.toLowerCase().includes(label));
  if (!target) return false;
  if (target.getAttribute('aria-expanded') !== 'true') target.click();
  return true;
}

export function InspectionNotificationDeepLinkModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const notificationSource = params.get('notification') === '1';
  const inspectionId = notificationSource ? params.get('inspectionId') : null;
  const initialFindingGroup = parseFindingGroup(params.get('group'));

  useEffect(() => {
    if (!inspectionId || !initialFindingGroup) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (clickStatusRow(initialFindingGroup) || attempts >= 20) window.clearInterval(timer);
    }, 120);
    return () => window.clearInterval(timer);
  }, [inspectionId, initialFindingGroup]);

  function closeModal() {
    navigate({ pathname: location.pathname, search: removeDeepLinkParams(location.search) }, { replace: true });
  }

  if (!inspectionId) return null;
  return <InspectionDetailModalDataBridge open inspectionId={inspectionId} record={buildFallbackRecord(params)} onClose={closeModal} />;
}
