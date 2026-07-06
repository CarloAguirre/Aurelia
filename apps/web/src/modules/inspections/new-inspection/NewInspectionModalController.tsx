import { useEffect, useState } from 'react';
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
import {
  clearNewInspectionDraftSnapshot,
  loadNewInspectionDraftSnapshot,
  useNewInspectionDraftStore,
} from './state/newInspectionDraft.store';
import { useNewInspectionFlowStore } from './state/newInspectionFlow.store';
import './assistant-chat-visual-parity.css';

interface NewInspectionModalControllerProps {
  open: boolean;
  onClose: () => void;
}

export function NewInspectionModalController({ open, onClose }: NewInspectionModalControllerProps) {
  const user = useSessionStore((state) => state.user);
  const setInspector = useNewInspectionDraftStore((state) => state.setInspector);
  const hydrateDraft = useNewInspectionDraftStore((state) => state.hydrate);
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
  const [assistantDraftSavedAt, setAssistantDraftSavedAt] = useState<string | null>(null);
  const [resumeAssistantDraft, setResumeAssistantDraft] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fullName = user?.fullName ?? 'Karen Opazo S.';
    const companyName = 'Gold Fields';
    const snapshot = loadNewInspectionDraftSnapshot();
    setAssistantDraftSavedAt(snapshot?.savedAt ?? null);
    setResumeAssistantDraft(false);
    setInspector(fullName, companyName);
    goToStart();
  }, [goToStart, open, setInspector, user?.fullName]);

  function clearAssistantDraft() {
    clearNewInspectionDraftSnapshot();
    setAssistantDraftSavedAt(null);
  }

  function handleClose() {
    clearAssistantDraft();
    onClose();
    resetFlow();
    resetDraft();
    submitMutation.reset();
  }

  function handleCreateAnother() {
    clearAssistantDraft();
    resetDraft();
    submitMutation.reset();
    setResumeAssistantDraft(false);
    goToStart();
  }

  function handleStartAssistant() {
    clearAssistantDraft();
    resetDraft();
    submitMutation.reset();
    setResumeAssistantDraft(false);
    goToAssistantChat();
  }

  function handleResumeAssistant() {
    const snapshot = loadNewInspectionDraftSnapshot();
    if (!snapshot) {
      setAssistantDraftSavedAt(null);
      handleStartAssistant();
      return;
    }
    hydrateDraft(snapshot.draft);
    submitMutation.reset();
    setResumeAssistantDraft(true);
    goToAssistantChat();
  }

  function handleDiscardAssistantDraft() {
    clearAssistantDraft();
    resetDraft();
    setResumeAssistantDraft(false);
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
        clearAssistantDraft();
        setResumeAssistantDraft(false);
        goToSaved();
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <div className="new-inspection-modal-panel relative flex h-[calc(100vh-32px)] max-h-[920px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        {routeStep === 'start' ? (
          <StartStep
            onStartAssistant={handleStartAssistant}
            onResumeAssistant={handleResumeAssistant}
            onDiscardDraft={handleDiscardAssistantDraft}
            onStartManual={goToIdentification}
            onCancelInspection={handleClose}
            hasAssistantDraft={Boolean(assistantDraftSavedAt)}
            assistantDraftSavedAt={assistantDraftSavedAt}
          />
        ) : null}

        {routeStep === 'assistant-chat' ? (
          <AssistantChatStep
            onBack={goToStart}
            onSave={handleSave}
            onCancelInspection={handleClose}
            saving={submitMutation.isPending}
            errorMessage={submitMutation.error instanceof Error ? submitMutation.error.message : null}
            resumeFromDraft={resumeAssistantDraft}
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

        {routeStep === 'saved' ? <SavedStep onClose={handleClose} onCreateAnother={handleCreateAnother} /> : null}
        </div>
      </div>
    </div>
  );
}
