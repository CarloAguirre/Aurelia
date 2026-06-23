import type { IncidentRiskLevel, IncidentType } from '../../enums';
import type { ID, ISODateString } from '../../types/common';

export interface CreateIncidentRequest {
  title: string;
  description: string;
  type: IncidentType;
  riskLevel: IncidentRiskLevel;
  areaId: ID;
  mueId: ID;
  occurredAt: ISODateString;
}
