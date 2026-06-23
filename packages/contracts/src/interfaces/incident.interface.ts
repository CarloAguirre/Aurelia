import type { IncidentRiskLevel, IncidentStatus, IncidentType } from '../enums';
import type { ID, ISODateString } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface Incident extends BaseEntity {
  title: string;
  description: string;
  type: IncidentType;
  riskLevel: IncidentRiskLevel;
  status: IncidentStatus;
  areaId: ID;
  mueId: ID;
  reportedById: ID;
  occurredAt: ISODateString;
}
