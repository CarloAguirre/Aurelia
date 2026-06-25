import { create } from 'zustand';
import { InspectionType } from '@aurelia/contracts';

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
  setInspectionType: (inspectionType, inspectionTypeLabel) => set({ inspectionType, inspectionTypeLabel }),
  reset: () => set(initialDraft),
}));
