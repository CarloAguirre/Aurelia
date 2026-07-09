import type { InspectionDetailResponse } from '@aurelia/contracts';
import { useInspectionDetail } from '../../../shared/hooks/useInspectionDetail';
import { InspectionDetailModal, type InspectionDetailModalRecord } from './InspectionDetailModal';
import { InspectionDetailRealDataModal } from './InspectionDetailRealDataModal';

type InspectionDetailModalDataBridgeProps = {
  open: boolean;
  inspectionId: string | null;
  record: InspectionDetailModalRecord | null;
  onClose: () => void;
};

function formatInspectionNumber(value: string) {
  return value.startsWith('#') ? value : `#${value}`;
}

function buildRecordFromDetail(detail: InspectionDetailResponse, fallback: InspectionDetailModalRecord): InspectionDetailModalRecord {
  return {
    ...fallback,
    id: formatInspectionNumber(detail.header.inspectionNumber),
    title: detail.header.title || fallback.title,
    kind: detail.header.kind,
    metadataLine1: detail.header.metadataLine1 || fallback.metadataLine1,
    metadataLine2: detail.header.metadataLine2 ?? fallback.metadataLine2,
    progressPercent: detail.header.progressPercent,
    counts: detail.header.counts,
  };
}

export function InspectionDetailModalDataBridge({ open, inspectionId, record, onClose }: InspectionDetailModalDataBridgeProps) {
  const detailQuery = useInspectionDetail(inspectionId, open && Boolean(record));
  const resolvedRecord = detailQuery.data && record ? buildRecordFromDetail(detailQuery.data, record) : record;
  if (detailQuery.data && resolvedRecord) return <InspectionDetailRealDataModal open={open} record={resolvedRecord} detail={detailQuery.data} onClose={onClose} />;
  return <InspectionDetailModal open={open} record={resolvedRecord} onClose={onClose} />;
}
