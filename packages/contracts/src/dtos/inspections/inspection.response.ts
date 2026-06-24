import type {
  Inspection,
  InspectionChecklistAnswer,
  InspectionChecklistItem,
  InspectionChecklistSection,
  InspectionChecklistTemplate,
  InspectionTypeRecord,
} from '../../interfaces/inspection.interface';

export type InspectionResponse = Inspection;
export type InspectionTypeResponse = InspectionTypeRecord;
export type InspectionChecklistAnswerResponse = InspectionChecklistAnswer;

export interface InspectionChecklistSectionResponse extends InspectionChecklistSection {
  items: InspectionChecklistItem[];
}

export interface InspectionChecklistTemplateResponse extends InspectionChecklistTemplate {
  sections: InspectionChecklistSectionResponse[];
}
