import type { InspectionFindingSeverity, InspectionFindingStatus } from '../../enums';
import type { ID, ISODateString } from '../../types/common';

export interface UpdateInspectionFindingRequest {
  title?: string;
  description?: string | null;
  severity?: InspectionFindingSeverity;
  status?: InspectionFindingStatus;
  ownerUserId?: ID | null;
  dueAt?: ISODateString | null;
  reason?: string | null;
}
