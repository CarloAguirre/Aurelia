import { useEffect } from 'react';
import { InspectionType } from '@aurelia/contracts';
import { loadNewInspectionDraftSnapshot } from '../new-inspection/state/newInspectionDraft.store';

const hostId = 'aurelia-incomplete-inspection-draft-host';
export const openAssistantDraftEventName = 'aurelia:open-assistant-inspection-draft';

type DraftSnapshot = NonNullable<ReturnType<typeof loadNewInspectionDraftSnapshot>>;

type DraftProgress = {
  step: number;
  percent: number;
};

function resolveAssistantProgress(snapshot: DraftSnapshot): DraftProgress {
  const draft = snapshot.draft;
  const savedObservations = draft.findingObservations.filter((item) => item.saved);
  const currentObservation = draft.findingObservations.find((item) => !item.saved) ?? draft.findingObservations[draft.findingObservations.length - 1] ?? null;
  if (!draft.areaId || !draft.sectorId || !draft.inspectionTypeSelected || !draft.inspectionDateSelected || !draft.locationCaptured) return { step: 1, percent: 14 };
  if (!draft.findingTypeId) return { step: 2, percent: 28 };
  if (!currentObservation) return { step: 2, percent: 28 };
  if (!currentObservation.detectedCondition || !currentObservation.evidence) return { step: 2, percent: 28 };
  if (!currentObservation.correctiveAction || !currentObservation.severityId || !currentObservation.saved) return { step: 3, percent: 42 };
  if (savedObservations.length > 0 && !draft.findingCompanyId) return { step: 4, percent: 57 };
  if (draft.findingCompanyId && draft.findingResponsibleIds.length === 0) return { step: 5, percent: 71 };
  return { step: 5, percent: 86 };
}

function resolveManualProgress(snapshot: DraftSnapshot): DraftProgress {
  const draft = snapshot.draft;
  if (!draft.areaId || !draft.sectorId) return { step: 1, percent: 20 };
  if (!draft.inspectionTypeSelected || (!draft.findingTypeId && !draft.templateId)) return { step: 2, percent: 40 };
  if (draft.findingObservations.length === 0 && Object.keys(draft.answersByItemId).length === 0) return { step: 3, percent: 60 };
  if (!draft.findingCompanyId && draft.findingResponsibleIds.length === 0) return { step: 4, percent: 80 };
  return { step: 5, percent: 100 };
}

function resolveProgress(snapshot: DraftSnapshot): DraftProgress {
  if (snapshot.draft.flowMode === 'assistant') return resolveAssistantProgress(snapshot);
  if (snapshot.draft.inspectionType === InspectionType.ENVIRONMENTAL && snapshot.draft.findingTypeId) return resolveAssistantProgress(snapshot);
  return resolveManualProgress(snapshot);
}

function syncBannerProgress() {
  const host = document.getElementById(hostId);
  const snapshot = loadNewInspectionDraftSnapshot();
  if (!host || !snapshot) return;
  const progress = resolveProgress(snapshot);
  const spans = Array.from(host.querySelectorAll('span')) as HTMLElement[];
  const percentSpan = spans.find((item) => /^\d+%$/.test(item.textContent?.trim() ?? ''));
  const stepSpan = spans.find((item) => /^Paso \d+\/5$/.test(item.textContent?.trim() ?? ''));
  const bars = Array.from(host.querySelectorAll('div')).map((item) => item as HTMLElement);
  const progressBar = bars.find((item) => item.style.width.endsWith('%'));
  if (percentSpan) percentSpan.textContent = `${progress.percent}%`;
  if (stepSpan) stepSpan.textContent = `Paso ${progress.step}/5`;
  if (progressBar) progressBar.style.width = `${progress.percent}%`;
}

export function IncompleteDraftResumeControllerBridge() {
  useEffect(() => {
    syncBannerProgress();
    const interval = window.setInterval(syncBannerProgress, 500);
    window.addEventListener('storage', syncBannerProgress);
    window.addEventListener('focus', syncBannerProgress);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', syncBannerProgress);
      window.removeEventListener('focus', syncBannerProgress);
    };
  }, []);

  return null;
}
