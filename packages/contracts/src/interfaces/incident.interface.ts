import type {
  IncidentActionPlanStatus,
  IncidentInvestigationMethod,
  IncidentLevelCode,
  IncidentStatus,
} from '../enums';
import type { ID, ISODateString } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface IncidentTypeCatalog extends BaseEntity {
  code: string;
  name: string;
  description: string | null;
  status: string;
}

export interface IncidentLevel extends BaseEntity {
  code: IncidentLevelCode;
  levelNumber: number;
  name: string;
  slaHours: number;
  requiresInvestigation: boolean;
  description: string | null;
  status: string;
}

export interface Incident extends BaseEntity {
  incidentTypeId: ID;
  incidentLevelId: ID;
  companyId: ID | null;
  areaId: ID | null;
  sectorId: ID | null;
  locationId: ID | null;
  reportedByUserId: ID | null;
  title: string;
  description: string;
  status: IncidentStatus;
  occurredAt: ISODateString;
  reportedAt: ISODateString;
  latitude: number | null;
  longitude: number | null;
  immediateResponseSummary: string | null;
  environmentalImpactSummary: string | null;
  slaDueAt: ISODateString | null;
  closedAt: ISODateString | null;
  closedByUserId: ID | null;
}

export interface IncidentImmediateAction extends BaseEntity {
  incidentId: ID;
  description: string;
  status: IncidentActionPlanStatus;
  performedByUserId: ID | null;
  performedAt: ISODateString | null;
}

export interface IncidentFlashReport extends BaseEntity {
  incidentId: ID;
  summary: string;
  immediateCauses: string | null;
  affectedComponents: string | null;
  potentialImpact: string | null;
  reporterName: string | null;
  generatedAt: ISODateString | null;
}

export interface IncidentInvestigation extends BaseEntity {
  incidentId: ID;
  method: IncidentInvestigationMethod;
  title: string;
  summary: string | null;
  status: string;
  leadUserId: ID | null;
  startedAt: ISODateString | null;
  completedAt: ISODateString | null;
}

export interface IncidentActionPlan extends BaseEntity {
  incidentId: ID;
  investigationId: ID | null;
  title: string;
  description: string;
  ownerUserId: ID | null;
  dueAt: ISODateString | null;
  status: IncidentActionPlanStatus;
  completedAt: ISODateString | null;
  closedByUserId: ID | null;
}
