import type { InspectionType } from '../../enums';
import type { ID, ISODateString } from '../../types/common';

export interface CreateInspectionRequest {
  title: string;
  type: InspectionType;
  areaId: ID;
  mueId: ID;
  criticalControlId?: ID;
  scheduledFor?: ISODateString;
  notes?: string;
}
