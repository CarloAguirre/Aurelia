import type { EvidenceType } from '../../enums';
import type { GeoLocation, ID } from '../../types/common';

export interface CreateEvidenceRequest {
  type: EvidenceType;
  url: string;
  description?: string;
  location?: GeoLocation;
  inspectionId?: ID;
  incidentId?: ID;
}
