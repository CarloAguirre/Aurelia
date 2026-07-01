import React from 'react';
import { useManualInspectionDraft } from './manualInspection.store';
import { ManualFindingSummaryScreen } from './ManualFindingSummaryScreen';
import { ManualInspectionSummaryFixedScreen } from './ManualInspectionSummaryFixedScreen';

export function ManualSummaryRouter() {
  const inspectionTypeLabel = useManualInspectionDraft((state) => state.inspectionTypeLabel);
  if (inspectionTypeLabel === 'Hallazgo') return <ManualFindingSummaryScreen />;
  return <ManualInspectionSummaryFixedScreen />;
}
