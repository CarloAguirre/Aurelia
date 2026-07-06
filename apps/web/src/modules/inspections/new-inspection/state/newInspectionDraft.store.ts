import { create } from 'zustand';
import { InspectionAnswerValue, InspectionType } from '@aurelia/contracts';

const NEW_INSPECTION_DRAFT_STORAGE_KEY = 'aurelia:new-inspection-draft:v1';

interface NewInspectionLocationInput {
  label: string;
  accuracy: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
}

export interface NewInspectionPickedAsset {
  name: string;
  file?: File;
}

export interface NewInspectionChecklistItemDetail {
  comment?: string;
  detectedCondition?: string;
  correctiveAction?: string;
  evidence?: NewInspectionPickedAsset | null;
  severityId?: string | null;
  severityLabel?: string | null;
  severityClosureTimeLabel?: string | null;
  slaLabel?: string | null;
}

export interface NewInspectionFindingObservationDraft {
  id: string;
  detectedCondition: string;
  correctiveAction: string;
  evidence: NewInspectionPickedAsset | null;
  severityId: string | null;
  severityLabel: string | null;
  severityClosureTimeLabel: string | null;
  saved: boolean;
}

export interface NewInspectionDraft {
  inspectorName: string;
  inspectorCompanyName: string;
  areaId: string | null;
  areaName: string | null;
  sectorId: string | null;
  sectorName: string | null;
  inspectionDate: string;
  locationLabel: string;
  locationAccuracyLabel: string;
  locationCaptured: boolean;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  locationCapturedAt: string | null;
  inspectionType: InspectionType;
  inspectionTypeLabel: string;
  findingTypeId: string | null;
  findingTypeLabel: string | null;
  findingObservations: NewInspectionFindingObservationDraft[];
  templateId: string | null;
  templateName: string | null;
  templateCode: string | null;
  templateItemsCount: number | null;
  answersByItemId: Record<string, InspectionAnswerValue>;
  detailsByItemId: Record<string, NewInspectionChecklistItemDetail>;
  generalPhoto: NewInspectionPickedAsset | null;
  findingCompanyId: string | null;
  findingCompanyName: string | null;
  findingResponsibleIds: string[];
}

interface NewInspectionDraftState extends NewInspectionDraft {
  setInspector: (name: string, companyName: string) => void;
  setArea: (id: string, name: string) => void;
  setSector: (id: string, name: string) => void;
  setInspectionDate: (value: string) => void;
  setLocation: (input: NewInspectionLocationInput) => void;
  setInspectionType: (type: InspectionType, label: string) => void;
  setFindingType: (id: string | null, label: string | null) => void;
  addFindingObservation: () => string;
  updateFindingObservation: (id: string, patch: Partial<Omit<NewInspectionFindingObservationDraft, 'id'>>) => void;
  removeFindingObservation: (id: string) => void;
  setTemplate: (input: { id: string; name: string; code: string; itemsCount: number }) => void;
  setAnswer: (itemId: string, value: InspectionAnswerValue) => void;
  setItemDetail: (itemId: string, detail: Partial<NewInspectionChecklistItemDetail>) => void;
  setGeneralPhoto: (asset: NewInspectionPickedAsset | null) => void;
  setFindingCompany: (id: string | null, name: string | null) => void;
  setFindingResponsibles: (ids: string[]) => void;
  hydrate: (draft: NewInspectionDraft) => void;
  reset: () => void;
}

type NewInspectionDraftStoreHook = {
  (): NewInspectionDraftState;
  <T>(selector: (state: NewInspectionDraftState) => T): T;
  getState: () => NewInspectionDraftState;
  subscribe: (listener: (state: NewInspectionDraftState) => void) => () => void;
};

function newObservationId() {
  return `finding-observation-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function currentDateLabel() {
  return new Intl.DateTimeFormat('es-CL').format(new Date());
}

const initialDraft: NewInspectionDraft = {
  inspectorName: 'Karen Opazo S.',
  inspectorCompanyName: 'Gold Fields',
  areaId: null,
  areaName: null,
  sectorId: null,
  sectorName: null,
  inspectionDate: currentDateLabel(),
  locationLabel: 'Ubicacion no capturada',
  locationAccuracyLabel: 'Sin precision',
  locationCaptured: false,
  latitude: null,
  longitude: null,
  altitude: null,
  locationCapturedAt: null,
  inspectionType: InspectionType.REGULATORY,
  inspectionTypeLabel: 'Checklist normativo',
  findingTypeId: null,
  findingTypeLabel: null,
  findingObservations: [],
  templateId: null,
  templateName: null,
  templateCode: null,
  templateItemsCount: null,
  answersByItemId: {},
  detailsByItemId: {},
  generalPhoto: null,
  findingCompanyId: null,
  findingCompanyName: null,
  findingResponsibleIds: [],
};

function stripAsset(asset: NewInspectionPickedAsset | null | undefined): NewInspectionPickedAsset | null {
  if (!asset?.name) return null;
  return { name: asset.name };
}

function serializableDraft(draft: NewInspectionDraft): NewInspectionDraft {
  return {
    ...draft,
    generalPhoto: stripAsset(draft.generalPhoto),
    detailsByItemId: Object.fromEntries(
      Object.entries(draft.detailsByItemId).map(([itemId, detail]) => [
        itemId,
        {
          ...detail,
          evidence: stripAsset(detail.evidence),
        },
      ]),
    ),
    findingObservations: draft.findingObservations.map((observation) => ({
      ...observation,
      evidence: stripAsset(observation.evidence),
    })),
  };
}

export function hasNewInspectionDraftProgress(draft: NewInspectionDraft): boolean {
  return Boolean(
    draft.areaId ||
    draft.sectorId ||
    draft.locationCaptured ||
    draft.findingTypeId ||
    draft.findingObservations.length > 0 ||
    draft.templateId ||
    Object.keys(draft.answersByItemId).length > 0 ||
    draft.generalPhoto ||
    draft.findingCompanyId ||
    draft.findingResponsibleIds.length > 0,
  );
}

export function saveNewInspectionDraftSnapshot(draft: NewInspectionDraft) {
  if (typeof window === 'undefined') return;
  if (!hasNewInspectionDraftProgress(draft)) return;
  window.localStorage.setItem(
    NEW_INSPECTION_DRAFT_STORAGE_KEY,
    JSON.stringify({ savedAt: new Date().toISOString(), draft: serializableDraft(draft) }),
  );
}

export function loadNewInspectionDraftSnapshot(): { savedAt: string; draft: NewInspectionDraft } | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(NEW_INSPECTION_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: string; draft?: NewInspectionDraft };
    if (!parsed.savedAt || !parsed.draft) return null;
    if (!hasNewInspectionDraftProgress(parsed.draft)) return null;
    return { savedAt: parsed.savedAt, draft: serializableDraft(parsed.draft) };
  } catch {
    return null;
  }
}

export function clearNewInspectionDraftSnapshot() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(NEW_INSPECTION_DRAFT_STORAGE_KEY);
}

export function hasNewInspectionDraftSnapshot() {
  return loadNewInspectionDraftSnapshot() !== null;
}

export const useNewInspectionDraftStore = create<NewInspectionDraftState>((set) => ({
  ...initialDraft,
  setInspector: (inspectorName, inspectorCompanyName) => set({ inspectorName, inspectorCompanyName }),
  setArea: (areaId, areaName) => set({ areaId, areaName, sectorId: null, sectorName: null }),
  setSector: (sectorId, sectorName) => set({ sectorId, sectorName }),
  setInspectionDate: (inspectionDate) => set({ inspectionDate }),
  setLocation: ({ label, accuracy, latitude, longitude, altitude }) =>
    set({
      locationLabel: label,
      locationAccuracyLabel: accuracy,
      locationCaptured: true,
      latitude,
      longitude,
      altitude,
      locationCapturedAt: new Date().toISOString(),
    }),
  setInspectionType: (inspectionType, inspectionTypeLabel) =>
    set({
      inspectionType,
      inspectionTypeLabel,
      findingTypeId: null,
      findingTypeLabel: null,
      findingObservations: [],
      templateId: null,
      templateName: null,
      templateCode: null,
      templateItemsCount: null,
      answersByItemId: {},
      detailsByItemId: {},
      generalPhoto: null,
      findingCompanyId: null,
      findingCompanyName: null,
      findingResponsibleIds: [],
    }),
  setFindingType: (findingTypeId, findingTypeLabel) => set({ findingTypeId, findingTypeLabel }),
  addFindingObservation: () => {
    const id = newObservationId();
    set((state) => ({
      findingObservations: [
        ...state.findingObservations,
        {
          id,
          detectedCondition: '',
          correctiveAction: '',
          evidence: null,
          severityId: null,
          severityLabel: null,
          severityClosureTimeLabel: null,
          saved: false,
        },
      ],
    }));
    return id;
  },
  updateFindingObservation: (id, patch) =>
    set((state) => ({
      findingObservations: state.findingObservations.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),
  removeFindingObservation: (id) =>
    set((state) => ({ findingObservations: state.findingObservations.filter((item) => item.id !== id) })),
  setTemplate: ({ id, name, code, itemsCount }) =>
    set({
      templateId: id,
      templateName: name,
      templateCode: code,
      templateItemsCount: itemsCount,
      answersByItemId: {},
      detailsByItemId: {},
      generalPhoto: null,
      findingCompanyId: null,
      findingCompanyName: null,
      findingResponsibleIds: [],
    }),
  setAnswer: (itemId, value) =>
    set((state) => ({ answersByItemId: { ...state.answersByItemId, [itemId]: value } })),
  setItemDetail: (itemId, detail) =>
    set((state) => ({
      detailsByItemId: {
        ...state.detailsByItemId,
        [itemId]: {
          ...state.detailsByItemId[itemId],
          ...detail,
        },
      },
    })),
  setGeneralPhoto: (generalPhoto) => set({ generalPhoto }),
  setFindingCompany: (findingCompanyId, findingCompanyName) =>
    set({ findingCompanyId, findingCompanyName, findingResponsibleIds: [] }),
  setFindingResponsibles: (findingResponsibleIds) => set({ findingResponsibleIds }),
  hydrate: (draft) => set(serializableDraft(draft)),
  reset: () => set(initialDraft),
})) as NewInspectionDraftStoreHook;
