import { create } from 'zustand';
import { InspectionAnswerValue, InspectionType } from '@aurelia/contracts';

export type ManualChecklistAnswers = Record<string, InspectionAnswerValue>;

export interface ManualPickedAsset {
  uri: string;
  name: string;
}

export interface ManualChecklistItemDetail {
  comment?: string;
  detectedCondition?: string;
  correctiveAction?: string;
  evidence?: ManualPickedAsset | null;
}

export interface ManualInspectionDraft {
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
  templateId: string | null;
  templateName: string | null;
  templateCode: string | null;
  templateItemsCount: number | null;
  answersByItemId: ManualChecklistAnswers;
  detailsByItemId: Record<string, ManualChecklistItemDetail>;
  generalPhoto: ManualPickedAsset | null;
  findingCompanyId: string | null;
  findingCompanyName: string | null;
  findingResponsibleIds: string[];
}

interface ManualInspectionLocationInput {
  label: string;
  accuracy: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
}

interface ManualInspectionState extends ManualInspectionDraft {
  setArea: (id: string, name: string) => void;
  setSector: (id: string, name: string) => void;
  setInspectionDate: (value: string) => void;
  setLocation: (input: ManualInspectionLocationInput) => void;
  setInspectionType: (type: InspectionType, label: string) => void;
  setTemplate: (input: { id: string; name: string; code: string; itemsCount: number }) => void;
  setAnswer: (itemId: string, value: InspectionAnswerValue) => void;
  setItemDetail: (itemId: string, detail: Partial<ManualChecklistItemDetail>) => void;
  setGeneralPhoto: (asset: ManualPickedAsset | null) => void;
  setFindingCompany: (id: string | null, name: string | null) => void;
  setFindingResponsibles: (ids: string[]) => void;
  reset: () => void;
}

const initialDraft: ManualInspectionDraft = {
  inspectorName: 'Karen Opazo S.',
  inspectorCompanyName: 'Gold Fields',
  areaId: null,
  areaName: null,
  sectorId: null,
  sectorName: null,
  inspectionDate: new Intl.DateTimeFormat('es-CL').format(new Date()),
  locationLabel: 'Ubicación no capturada',
  locationAccuracyLabel: 'Sin precisión',
  locationCaptured: false,
  latitude: null,
  longitude: null,
  altitude: null,
  locationCapturedAt: null,
  inspectionType: InspectionType.REGULATORY,
  inspectionTypeLabel: 'Checklist normativo',
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

export const useManualInspectionDraft = create<ManualInspectionState>((set) => ({
  ...initialDraft,
  setArea: (id, name) => set({ areaId: id, areaName: name, sectorId: null, sectorName: null }),
  setSector: (id, name) => set({ sectorId: id, sectorName: name }),
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
    set({ inspectionType, inspectionTypeLabel, templateId: null, templateName: null, templateCode: null, templateItemsCount: null, answersByItemId: {}, detailsByItemId: {}, generalPhoto: null }),
  setTemplate: ({ id, name, code, itemsCount }) => set({ templateId: id, templateName: name, templateCode: code, templateItemsCount: itemsCount, answersByItemId: {}, detailsByItemId: {}, generalPhoto: null }),
  setAnswer: (itemId, value) => set((state) => ({ answersByItemId: { ...state.answersByItemId, [itemId]: value } })),
  setItemDetail: (itemId, detail) => set((state) => ({ detailsByItemId: { ...state.detailsByItemId, [itemId]: { ...state.detailsByItemId[itemId], ...detail } } })),
  setGeneralPhoto: (generalPhoto) => set({ generalPhoto }),
  setFindingCompany: (findingCompanyId, findingCompanyName) => set({ findingCompanyId, findingCompanyName }),
  setFindingResponsibles: (findingResponsibleIds) => set({ findingResponsibleIds }),
  reset: () => set(initialDraft),
}));
