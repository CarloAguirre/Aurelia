import { useEffect } from 'react';
import { useManualInspectionDraft } from '../manualInspection.store';
import { useManualInspectionFlowStore } from '../manualInspectionFlow.store';
import { saveManualInspectionDraftSnapshot } from '../manualInspectionDrafts.storage';

function shouldPersistDraft(payload: ReturnType<typeof useManualInspectionDraft.getState>): boolean {
  return Boolean(
    payload.areaId ||
    payload.sectorId ||
    payload.locationCaptured ||
    payload.findingObservations.length > 0 ||
    payload.templateId ||
    Object.keys(payload.answersByItemId).length > 0 ||
    payload.findingCompanyId ||
    payload.findingResponsibleIds.length > 0,
  );
}

export function usePersistManualInspectionDraft() {
  const draft = useManualInspectionDraft();
  const setDraftId = useManualInspectionDraft((state) => state.setDraftId);
  const currentStep = useManualInspectionFlowStore((state) => state.currentStep);

  useEffect(() => {
    if (!shouldPersistDraft(draft)) return;

    const timeoutId = setTimeout(() => {
      void saveManualInspectionDraftSnapshot({ draftId: draft.draftId, mode: 'manual', draft, currentStep }).then((saved) => {
        if (!draft.draftId) setDraftId(saved.draftId);
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [currentStep, draft, setDraftId]);
}