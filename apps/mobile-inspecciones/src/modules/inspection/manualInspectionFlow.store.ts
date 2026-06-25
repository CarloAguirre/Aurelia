import { create } from 'zustand';

export type ManualInspectionPicker = 'area' | 'sector' | 'date' | null;

interface ManualInspectionFlowState {
  currentStep: number;
  activePicker: ManualInspectionPicker;
  setCurrentStep: (step: number) => void;
  openPicker: (picker: Exclude<ManualInspectionPicker, null>) => void;
  closePicker: () => void;
  resetFlow: () => void;
}

export const useManualInspectionFlowStore = create<ManualInspectionFlowState>((set) => ({
  currentStep: 1,
  activePicker: null,
  setCurrentStep: (currentStep) => set({ currentStep }),
  openPicker: (activePicker) => set({ activePicker }),
  closePicker: () => set({ activePicker: null }),
  resetFlow: () => set({ currentStep: 1, activePicker: null }),
}));
