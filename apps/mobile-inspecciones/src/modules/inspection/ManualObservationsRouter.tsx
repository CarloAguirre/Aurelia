import React from 'react';
import { InspectionType } from '@aurelia/contracts';
import { useManualInspectionDraft } from './manualInspection.store';
import { ManualChecklistTemplateScreen } from './ManualChecklistTemplateScreen';
import { ManualFindingObservationsScreen } from './ManualFindingObservationsScreen';

export function ManualObservationsRouter() {
  const inspectionType = useManualInspectionDraft((state) => state.inspectionType);

  if (inspectionType === InspectionType.ENVIRONMENTAL) return <ManualFindingObservationsScreen />;

  return <ManualChecklistTemplateScreen />;
}
