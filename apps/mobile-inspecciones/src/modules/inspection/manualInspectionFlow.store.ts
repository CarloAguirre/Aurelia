import { create } from 'zustand';

export type ManualInspectionPicker = 'area' | 'sector' | 'date' | 'template' | 'company' | null;

interface ManualInspectionFlowState {
  currentStep: number;
  activePicker: ManualInspectionPicker;
  setCurrentStep: (step: number) => void;
  goToIdentification: () => void;
  goToType: () => void;
  goToObservations: () => void;
  openPicker: (picker: Exclude<ManualInspectionPicker, null>) => void;
  closePicker: () => void;
  resetFlow: () => void;
}

export const useManualInspectionFlowStore = create<ManualInspectionFlowState>((set) => ({
  currentStep: 1,
  activePicker: null,
  setCurrentStep: (currentStep) => set({ currentStep }),
  goToIdentification: () => set({ currentStep: 1, activePicker: null }),
  goToType: () => set({ currentStep: 2, activePicker: null }),
  goToObservations: () => set({ currentStep: 3, activePicker: null }),
  openPicker: (activePicker) => set({ activePicker }),
  closePicker: () => set({ activePicker: null }),
  resetFlow: () => set({ currentStep: 1, activePicker: null }),
}));
