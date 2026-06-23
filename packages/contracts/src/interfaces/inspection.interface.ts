import type { InspectionStatus, InspectionType } from '../enums';
import type { ID, ISODateString } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface Inspection extends BaseEntity {
  title: string;
  type: InspectionType;
  status: InspectionStatus;
  areaId: ID;
  mueId: ID;
  criticalControlId: ID | null;
  inspectorId: ID;
  scheduledFor: ISODateString | null;
  notes: string | null;
}
