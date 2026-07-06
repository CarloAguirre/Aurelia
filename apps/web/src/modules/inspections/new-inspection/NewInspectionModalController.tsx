import { useEffect } from 'react';
import { InspectionType } from '@aurelia/contracts';
import { useSessionStore } from '../../../shared/stores/session.store';
import { StartStep } from './steps/StartStep';
import { AssistantChatStep } from './steps/AssistantChatStep';
import { IdentificationStep } from './steps/IdentificationStep';
import { TypeStep } from './steps/TypeStep';
import { FindingObservationsStep } from './steps/FindingObservationsStep';
import { ChecklistObservationsStep } from './steps/ChecklistObservationsStep';
import { SummaryStep } from './steps/SummaryStep';
import { SavedStep } from './steps/SavedStep';
import { useSubmitNewInspection } from './hooks/useSubmitNewInspection';
import { useNewInspectionDraftStore } from './state/newInspectionDraft.store';
import { useNewInspectionFlowStore } from './state/newInspectionFlow.store';

interface NewInspectionModalControllerProps {
  open: boolean;
  onClose: () => void;
}

export function NewInspectionModalController({ open, onClose }: NewInspectionModalControllerProps) {
  const user = useSessionStore((state) => state.user);
  const setInspector = useNewInspectionDraftStore((state) => state.setInspector);
  const resetDraft = useNewInspectionDraftStore((state) => state.reset);
  const selectedInspectionType = useNewInspectionDraftStore((state) => state.inspectionType);
  const draft = useNewInspectionDraftStore();
  const routeStep = useNewInspectionFlowStore((state) => state.routeStep);
  const goToStart = useNewInspectionFlowStore((state) => state.goToStart);
  const goToAssistantChat = useNewInspectionFlowStore((state) => state.goToAssistantChat);
  const goToIdentification = useNewInspectionFlowStore((state) => state.goToIdentification);
  const goToType = useNewInspectionFlowStore((state) => state.goToType);
  const goToFindingObservations = useNewInspectionFlowStore((state) => state.goToFindingObservations);
  const goToChecklistObservations = useNewInspectionFlowStore((state) => state.goToChecklistObservations);
  const goToSummary = useNewInspectionFlowStore((state) => state.goToSummary);
  const goToSaved = useNewInspectionFlowStore((state) => state.goToSaved);
  const resetFlow = useNewInspectionFlowStore((state) => state.reset);
  const submitMutation = useSubmitNewInspection();

  useEffect(() => {
    if (!open) return;
    const fullName = user?.fullName ?? 'Karen Opazo S.';
    const companyName = 'Gold Fields';
    setInspector(fullName, companyName);
    goToStart();
  }, [goToStart, open, setInspector, user?.fullName]);

  function handleClose() {
    onClose();
    resetFlow();
    resetDraft();
  }

  function handleTypeNext() {
    if (selectedInspectionType === InspectionType.ENVIRONMENTAL) {
      goToFindingObservations();
      return;
    }
    goToChecklistObservations();
  }

  function handleSave() {
    submitMutation.mutate(draft, {
      onSuccess: () => {
        goToSaved();
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <div className="relative flex h-[calc(100vh-32px)] max-h-[920px] w-[430px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        {routeStep === 'start' ? (
          <StartStep onStartAssistant={goToAssistantChat} onStartManual={goToIdentification} onCancelInspection={handleClose} />
        ) : null}

        {routeStep === 'assistant-chat' ? (
          <AssistantChatStep
            onBack={goToStart}
            onSave={handleSave}
            onCancelInspection={handleClose}
            saving={submitMutation.isPending}
            errorMessage={submitMutation.error instanceof Error ? submitMutation.error.message : null}
          />
        ) : null}

        {routeStep === 'identification' ? (
          <IdentificationStep onCancel={handleClose} onNext={goToType} />
        ) : null}

        {routeStep === 'type' ? <TypeStep onBack={goToIdentification} onNext={handleTypeNext} /> : null}

        {routeStep === 'observations-finding' ? (
          <FindingObservationsStep onBack={goToType} onNext={goToSummary} />
        ) : null}

        {routeStep === 'observations-checklist' ? (
          <ChecklistObservationsStep onBack={goToType} onNext={goToSummary} />
        ) : null}

        {routeStep === 'summary' ? (
          <SummaryStep
            onBack={selectedInspectionType === InspectionType.ENVIRONMENTAL ? goToFindingObservations : goToChecklistObservations}
            onSave={handleSave}
            saving={submitMutation.isPending}
            errorMessage={submitMutation.error instanceof Error ? submitMutation.error.message : null}
          />
        ) : null}

        {routeStep === 'saved' ? <SavedStep onClose={handleClose} onCreateAnother={goToStart} /> : null}
        </div>
      </div>
    </div>
  );
}
