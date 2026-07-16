import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInspectionAssignmentScope } from '../../../shared/services/inspection-assignment-scope.service';
import { useSessionStore } from '../../../shared/stores/session.store';
import { useNewInspectionDraftStore } from '../new-inspection/state/newInspectionDraft.store';

const draftQueueStorageKey = 'aurelia:new-inspection-drafts:v1';
const legacyDraftStorageKey = 'aurelia:new-inspection-draft:v1';

type DraftState = ReturnType<typeof useNewInspectionDraftStore.getState>;
type StoredDraftSnapshot = { draft?: Partial<DraftState> };

function text(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function hasInspectionInput(draft: Partial<DraftState>) {
  return Boolean(
    draft.areaId ||
    draft.sectorId ||
    draft.inspectionDateSelected ||
    draft.locationCaptured ||
    draft.inspectionTypeSelected ||
    draft.findingTypeId ||
    (draft.findingObservations?.length ?? 0) > 0 ||
    draft.templateId ||
    Object.keys(draft.answersByItemId ?? {}).length > 0 ||
    draft.generalPhoto,
  );
}

function removeAssignmentOnlyDrafts() {
  if (typeof window === 'undefined') return;

  const rawQueue = window.localStorage.getItem(draftQueueStorageKey);
  if (rawQueue) {
    try {
      const parsed = JSON.parse(rawQueue) as unknown;
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((item) => {
          if (!item || typeof item !== 'object') return true;
          const draft = (item as StoredDraftSnapshot).draft;
          return !draft || hasInspectionInput(draft);
        });
        if (filtered.length === 0) window.localStorage.removeItem(draftQueueStorageKey);
        else if (filtered.length !== parsed.length) window.localStorage.setItem(draftQueueStorageKey, JSON.stringify(filtered));
      }
    } catch {
      window.localStorage.removeItem(draftQueueStorageKey);
    }
  }

  const rawLegacy = window.localStorage.getItem(legacyDraftStorageKey);
  if (!rawLegacy) return;
  try {
    const parsed = JSON.parse(rawLegacy) as StoredDraftSnapshot;
    if (parsed.draft && !hasInspectionInput(parsed.draft)) window.localStorage.removeItem(legacyDraftStorageKey);
  } catch {
    window.localStorage.removeItem(legacyDraftStorageKey);
  }
}

function manualCompanyButtons(root: ParentNode) {
  return Array.from(root.querySelectorAll('button')).filter((button) =>
    text(button.previousElementSibling?.textContent) === 'Empresa encargada de los hallazgos',
  ) as HTMLButtonElement[];
}

function findChatButton(root: ParentNode, label: string) {
  return Array.from(root.querySelectorAll('button')).find((button) => text(button.textContent) === label) as HTMLButtonElement | undefined;
}

function applyLockedCompanyUi(companyName: string) {
  const panel = document.querySelector('.new-inspection-modal-panel');
  if (!panel) return;

  manualCompanyButtons(panel).forEach((button) => {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  });

  const confirmButton = findChatButton(panel, 'Confirmar empresa');
  if (confirmButton && confirmButton.dataset.assignmentScopeHandled !== 'true') {
    const card = confirmButton.closest('div');
    const cardText = text(card?.textContent);
    confirmButton.dataset.assignmentScopeHandled = 'true';
    if (cardText.includes(companyName)) {
      confirmButton.click();
    } else {
      const otherButton = findChatButton(card ?? panel, 'Elegir otra');
      otherButton?.click();
    }
  }

  const companyButton = Array.from(panel.querySelectorAll('button')).find(
    (button) => text(button.textContent) === companyName && button.dataset.assignmentScopeHandled !== 'true',
  ) as HTMLButtonElement | undefined;
  if (companyButton) {
    companyButton.dataset.assignmentScopeHandled = 'true';
    companyButton.click();
  }

  Array.from(panel.querySelectorAll('button')).forEach((button) => {
    const label = text(button.textContent);
    if (label === 'Elegir otra' || label === 'Elegir otra empresa') {
      const element = button as HTMLButtonElement;
      element.disabled = true;
      element.style.display = 'none';
    }
  });
}

export function InspectionAssignmentScopeBridge() {
  const user = useSessionStore((state) => state.user);
  const scopeQuery = useQuery({
    queryKey: ['inspections', 'assignment-scope', user?.id],
    queryFn: getInspectionAssignmentScope,
    enabled: Boolean(user),
    staleTime: 300000,
  });

  useEffect(() => {
    removeAssignmentOnlyDrafts();
  }, []);

  useEffect(() => {
    const scope = scopeQuery.data;
    if (!scope || scope.canSelectCompany || !scope.companyId || !scope.companyName) return undefined;

    const lockDraftCompany = () => {
      const state = useNewInspectionDraftStore.getState();
      if (!hasInspectionInput(state)) return;
      if (state.findingCompanyId === scope.companyId && state.findingCompanyName === scope.companyName) return;
      state.setFindingCompany(scope.companyId, scope.companyName);
    };

    const syncUi = () => {
      lockDraftCompany();
      applyLockedCompanyUi(scope.companyName as string);
    };

    syncUi();
    const unsubscribe = useNewInspectionDraftStore.subscribe(lockDraftCompany);
    const observer = new MutationObserver(syncUi);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(syncUi, 150);

    return () => {
      unsubscribe();
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [scopeQuery.data]);

  return null;
}
