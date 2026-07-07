import { useEffect, useRef, useState } from 'react';
import { InspectionType } from '@aurelia/contracts';
import { useSessionStore } from '../../../shared/stores/session.store';
import { StartStep } from './steps/StartStep';
import { AssistantChatStep } from './steps/AssistantChatStepV4';
import { IdentificationStep } from './steps/IdentificationStep';
import { TypeStep } from './steps/TypeStep';
import { FindingObservationsStep } from './steps/FindingObservationsStep';
import { ChecklistObservationsStep } from './steps/ChecklistObservationsStep';
import { SummaryStep } from './steps/SummaryStep';
import { SavedStep } from './steps/SavedStep';
import { useSubmitNewInspection } from './hooks/useSubmitNewInspection';
import {
  activateNewInspectionDraftSnapshot,
  beginNewInspectionDraftSession,
  clearActiveNewInspectionDraftSession,
  clearNewInspectionDraftSnapshot,
  loadNewInspectionDraftSnapshot,
  saveNewInspectionDraftSnapshot,
  type NewInspectionDraft,
  useNewInspectionDraftStore,
} from './state/newInspectionDraft.store';
import { useNewInspectionFlowStore } from './state/newInspectionFlow.store';
import './assistant-chat-visual-parity.css';
import './assistant-chat-fidelity-tweaks.css';

interface NewInspectionModalControllerProps {
  open: boolean;
  onClose: () => void;
}

const resumeDraftEventName = 'aurelia:resume-new-inspection-draft';
const resumeDraftStorageKey = 'aurelia:resume-new-inspection-draft';

function shouldResumeStoredDraft() {
  return typeof window !== 'undefined' && window.sessionStorage.getItem(resumeDraftStorageKey) === '1';
}

function clearResumeStoredDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(resumeDraftStorageKey);
}

function normalizeDraftForResume(draft: NewInspectionDraft): NewInspectionDraft {
  if (draft.flowMode === 'assistant' && !draft.inspectionTypeSelected) {
    return { ...draft, inspectionType: InspectionType.ENVIRONMENTAL, inspectionTypeLabel: '' };
  }
  return draft;
}

export function NewInspectionModalController({ open, onClose }: NewInspectionModalControllerProps) {
  const user = useSessionStore((state) => state.user);
  const setInspector = useNewInspectionDraftStore((state) => state.setInspector);
  const setFlowMode = useNewInspectionDraftStore((state) => state.setFlowMode);
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
  const [initialized, setInitialized] = useState(false);
  const [resumeAssistantDraft, setResumeAssistantDraft] = useState(false);
  const resumeDraftOnOpenRef = useRef(false);
  const handledOpenRef = useRef(false);

  useEffect(() => {
    function requestDraftResume() {
      resumeDraftOnOpenRef.current = true;
    }
    window.addEventListener(resumeDraftEventName, requestDraftResume);
    return () => window.removeEventListener(resumeDraftEventName, requestDraftResume);
  }, []);

  useEffect(() => {
    if (!open) {
      handledOpenRef.current = false;
      setInitialized(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !initialized || routeStep === 'start') return undefined;
    return useNewInspectionDraftStore.subscribe((state) => saveNewInspectionDraftSnapshot(state));
  }, [initialized, open, routeStep]);

  function routeManualDraft(nextDraft: NewInspectionDraft) {
    if (!nextDraft.areaId || !nextDraft.sectorId) {
      goToIdentification();
      return;
    }
    if (!nextDraft.inspectionTypeSelected || (!nextDraft.findingTypeId && !nextDraft.templateId)) {
      goToType();
      return;
    }
    if (nextDraft.inspectionType === InspectionType.ENVIRONMENTAL) {
      if (nextDraft.findingObservations.length > 0 && nextDraft.findingCompanyId && nextDraft.findingResponsibleIds.length > 0) {
        goToSummary();
        return;
      }
      goToFindingObservations();
      return;
    }
    if (Object.keys(nextDraft.answersByItemId).length > 0 && nextDraft.findingCompanyId && nextDraft.findingResponsibleIds.length > 0) {
      goToSummary();
      return;
    }
    goToChecklistObservations();
  }

  useEffect(() => {
    if (!open || handledOpenRef.current) return;
    handledOpenRef.current = true;
    const fullName = user?.fullName ?? 'Karen Opazo S.';
    const companyName = 'Gold Fields';
    const snapshot = loadNewInspectionDraftSnapshot();
    const shouldResumeDraft = resumeDraftOnOpenRef.current || shouldResumeStoredDraft();
    setResumeAssistantDraft(false);
    if (shouldResumeDraft && snapshot) {
      const nextDraft = normalizeDraftForResume(snapshot.draft);
      resumeDraftOnOpenRef.current = false;
      clearResumeStoredDraft();
      activateNewInspectionDraftSnapshot(snapshot.id);
      hydrateDraft(nextDraft);
      saveNewInspectionDraftSnapshot(nextDraft);
      submitMutation.reset();
      if (nextDraft.flowMode === 'assistant') {
        setResumeAssistantDraft(true);
        goToAssistantChat();
        setInitialized(true);
        return;
      }
      routeManualDraft(nextDraft);
      setInitialized(true);
      return;
    }
    resumeDraftOnOpenRef.current = false;
    clearResumeStoredDraft();
    clearActiveNewInspectionDraftSession();
    resetFlow();
    resetDraft();
    submitMutation.reset();
    setInspector(fullName, companyName);
    goToStart();
    setInitialized(true);
  }, [goToAssistantChat, goToStart, hydrateDraft, open, resetDraft, resetFlow, setInspector, user?.fullName]);

  function discardActiveDraft() {
    clearNewInspectionDraftSnapshot();
    clearResumeStoredDraft();
  }

  function handleClose() {
    if (routeStep !== 'start') discardActiveDraft();
    else clearResumeStoredDraft();
    onClose();
    resetFlow();
    resetDraft();
    submitMutation.reset();
  }

  function handleAssistantBack() {
    if (resumeAssistantDraft) {
      discardActiveDraft();
      setResumeAssistantDraft(false);
      resetDraft();
      submitMutation.reset();
      goToStart();
      return;
    }
    goToStart();
  }

  function handleCreateAnother() {
    discardActiveDraft();
    resetDraft();
    submitMutation.reset();
    setResumeAssistantDraft(false);
    goToStart();
  }

  function handleStartAssistant() {
    clearResumeStoredDraft();
    beginNewInspectionDraftSession();
    resetDraft();
    setFlowMode('assistant');
    submitMutation.reset();
    setResumeAssistantDraft(false);
    goToAssistantChat();
  }

  function handleStartManual() {
    clearResumeStoredDraft();
    beginNewInspectionDraftSession();
    resetDraft();
    setFlowMode('manual');
    submitMutation.reset();
    setResumeAssistantDraft(false);
    goToIdentification();
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
        discardActiveDraft();
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
          {!initialized ? null : null}
          {initialized && routeStep === 'start' ? (
            <StartStep
              onStartAssistant={handleStartAssistant}
              onStartManual={handleStartManual}
              onCancelInspection={handleClose}
            />
          ) : null}

          {initialized && routeStep === 'assistant-chat' ? (
            <AssistantChatStep
              onBack={handleAssistantBack}
              onSave={handleSave}
              onCancelInspection={handleClose}
              saving={submitMutation.isPending}
              errorMessage={submitMutation.error instanceof Error ? submitMutation.error.message : null}
              resumeFromDraft={resumeAssistantDraft}
            />
          ) : null}

          {initialized && routeStep === 'identification' ? (
            <IdentificationStep onCancel={handleClose} onNext={goToType} />
          ) : null}

          {initialized && routeStep === 'type' ? <TypeStep onBack={goToIdentification} onNext={handleTypeNext} /> : null}

          {initialized && routeStep === 'observations-finding' ? (
            <FindingObservationsStep onBack={goToType} onNext={goToSummary} />
          ) : null}

          {initialized && routeStep === 'observations-checklist' ? (
            <ChecklistObservationsStep onBack={goToType} onNext={goToSummary} />
          ) : null}

          {initialized && routeStep === 'summary' ? (
            <SummaryStep
              onBack={selectedInspectionType === InspectionType.ENVIRONMENTAL ? goToFindingObservations : goToChecklistObservations}
              onSave={handleSave}
              saving={submitMutation.isPending}
              errorMessage={submitMutation.error instanceof Error ? submitMutation.error.message : null}
            />
          ) : null}

          {initialized && routeStep === 'saved' ? <SavedStep onClose={handleClose} onCreateAnother={handleCreateAnother} /> : null}
        </div>
      </div>
    </div>
  );
}
