import React from 'react';
import { InspectionType } from '@aurelia/contracts';
import { useManualInspectionDraft } from './manualInspection.store';
import { ManualFindingSummaryScreen } from './ManualFindingSummaryScreen';
import { ManualInspectionSummaryFixedScreen } from './ManualInspectionSummaryFixedScreen';

export function ManualSummaryRouter() {
  const inspectionType = useManualInspectionDraft((state) => state.inspectionType);
  if (inspectionType === InspectionType.ENVIRONMENTAL) return <ManualFindingSummaryScreen />;
  return <ManualInspectionSummaryFixedScreen />;
}
