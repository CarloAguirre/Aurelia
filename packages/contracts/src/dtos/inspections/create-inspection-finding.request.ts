import type { InspectionFindingSeverity } from '../../enums';
import type { ID, ISODateString } from '../../types/common';

export interface CreateInspectionFindingRequest {
  checklistItemId?: ID | null;
  title: string;
  description?: string | null;
  severity: InspectionFindingSeverity;
  ownerUserId?: ID | null;
  dueAt?: ISODateString | null;
}
