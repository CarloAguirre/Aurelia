import type { IncidentRiskLevel, InspectionStatus } from '../../enums';
import type { ID, ISODateString } from '../../types/common';

export interface ReportFilterRequest {
  mueId?: ID;
  areaId?: ID;
  responsibleId?: ID;
  status?: InspectionStatus;
  riskLevel?: IncidentRiskLevel;
  from?: ISODateString;
  to?: ISODateString;
}
