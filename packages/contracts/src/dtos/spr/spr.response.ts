import type {
  SprConsolidationRule,
  SprMeasureGroup,
  SprMonthlyRecord,
  SprParameter,
  SprParameterAreaAssignment,
  SprRecordApproval,
  SprUnit,
} from '../../interfaces';

export type SprMeasureGroupResponse = SprMeasureGroup;
export type SprUnitResponse = SprUnit;
export type SprParameterResponse = SprParameter;
export type SprParameterAreaAssignmentResponse = SprParameterAreaAssignment;
export type SprMonthlyRecordResponse = SprMonthlyRecord;
export type SprRecordApprovalResponse = SprRecordApproval;
export type SprConsolidationRuleResponse = SprConsolidationRule;

export interface SprDashboardSummaryResponse {
  parameters: {
    total: number;
    sox: number;
    requiringEvidence: number;
  };
  records: {
    total: number;
    byStatus: Record<string, number>;
    missingEvidence: number;
  };
}
