import { create } from 'zustand';

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
}

interface ManualInspectionState extends ManualInspectionDraft {
  setArea: (id: string, name: string) => void;
  setSector: (id: string, name: string) => void;
  setInspectionDate: (value: string) => void;
  setLocation: (label: string, accuracy: string) => void;
  reset: () => void;
}

const initialDraft: ManualInspectionDraft = {
  inspectorName: 'Karen Opazo S.',
  inspectorCompanyName: 'Gold Fields',
  areaId: null,
  areaName: null,
  sectorId: null,
  sectorName: null,
  inspectionDate: '10/06/2026',
  locationLabel: '19H 351376E 6295754N ± 12.4 m',
  locationAccuracyLabel: '± 12.4 m',
  locationCaptured: true,
};

export const useManualInspectionDraft = create<ManualInspectionState>((set) => ({
  ...initialDraft,
  setArea: (id, name) => set({ areaId: id, areaName: name, sectorId: null, sectorName: null }),
  setSector: (id, name) => set({ sectorId: id, sectorName: name }),
  setInspectionDate: (inspectionDate) => set({ inspectionDate }),
  setLocation: (locationLabel, locationAccuracyLabel) =>
    set({ locationLabel, locationAccuracyLabel, locationCaptured: true }),
  reset: () => set(initialDraft),
}));
