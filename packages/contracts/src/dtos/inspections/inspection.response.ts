import type {
  Inspection,
  InspectionChecklistAnswer,
  InspectionChecklistItem,
  InspectionChecklistSection,
  InspectionChecklistTemplate,
  InspectionFinding,
  InspectionFollowup,
  InspectionTypeRecord,
} from '../../interfaces/inspection.interface';
import type { InspectionFindingSeverity, InspectionFindingStatus, InspectionStatus } from '../../enums';

export type InspectionResponse = Inspection;
export type InspectionTypeResponse = InspectionTypeRecord;
export type InspectionChecklistAnswerResponse = InspectionChecklistAnswer;
export type InspectionFindingResponse = InspectionFinding;
export type InspectionFollowupResponse = InspectionFollowup;

export interface InspectionChecklistSectionResponse extends InspectionChecklistSection {
  items: InspectionChecklistItem[];
}

export interface InspectionChecklistTemplateResponse extends InspectionChecklistTemplate {
  sections: InspectionChecklistSectionResponse[];
}

export interface InspectionDashboardSummaryResponse {
  inspections: {
    total: number;
    byStatus: Record<InspectionStatus, number>;
    withOpenFindings: number;
    closedRate: number;
  };
  findings: {
    total: number;
    byStatus: Record<InspectionFindingStatus, number>;
    bySeverity: Record<InspectionFindingSeverity, number>;
    open: number;
    overdue: number;
    dueSoonNext7Days: number;
  };
}
