import { create } from 'zustand';

export type FlowStep =
  | 'area'
  | 'sector'
  | 'tipo'
  | 'obs_desc'
  | 'obs_foto'
  | 'obs_ai_suggest'
  | 'obs_medida'
  | 'criticidad'
  | 'sla'
  | 'more_obs'
  | 'empresa'
  | 'personal'
  | 'resumen'
  | 'done';

export interface ObservacionDraft {
  desc: string | null;
  foto: boolean;
  medida: string | null;
  medidaOrigen: 'ia' | 'manual' | null;
  prob: number | null;
  cons: number | null;
  nivel: string | null;
  sla: number;
}

export interface InspectionFlowState {
  step: FlowStep;
  progressStep: number;

  area: string | null;
  sector: string | null;
  tipo: string | null;

  observaciones: ObservacionDraft[];
  currentObs: ObservacionDraft;

  empresa: string | null;
  personalSel: string[];

  aiSuggestion: string | null;
  aiLoading: boolean;

  // Actions
  setArea: (area: string) => void;
  setSector: (sector: string) => void;
  setTipo: (tipo: string) => void;
  setObsDesc: (desc: string) => void;
  setObsFoto: () => void;
  setAiSuggestion: (text: string | null, loading?: boolean) => void;
  acceptMedida: (medida: string, origen: 'ia' | 'manual') => void;
  setProb: (prob: number) => void;
  setCons: (cons: number) => void;
  setSla: (sla: number) => void;
  addMoreObs: () => void;
  finishObs: () => void;
  setEmpresa: (empresa: string) => void;
  togglePersonal: (name: string) => void;
  goToResumen: () => void;
  reset: () => void;
}

function emptyObs(): ObservacionDraft {
  return { desc: null, foto: false, medida: null, medidaOrigen: null, prob: null, cons: null, nivel: null, sla: 7 };
}

export const useInspectionFlow = create<InspectionFlowState>((set) => ({
  step: 'area',
  progressStep: 0,

  area: null,
  sector: null,
  tipo: null,

  observaciones: [],
  currentObs: emptyObs(),

  empresa: null,
  personalSel: [],

  aiSuggestion: null,
  aiLoading: false,

  setArea: (area) => set({ area, step: 'sector' }),
  setSector: (sector) => set({ sector, step: 'tipo' }),
  setTipo: (tipo) => set({ tipo, step: 'obs_desc', progressStep: 1 }),
  setObsDesc: (desc) =>
    set((s) => ({ currentObs: { ...s.currentObs, desc }, step: 'obs_foto' })),
  setObsFoto: () =>
    set((s) => ({ currentObs: { ...s.currentObs, foto: true }, step: 'obs_ai_suggest', aiLoading: true })),
  setAiSuggestion: (text, loading = false) =>
    set({ aiSuggestion: text, aiLoading: loading, step: loading ? 'obs_ai_suggest' : 'obs_medida' }),
  acceptMedida: (medida, origen) =>
    set((s) => ({
      currentObs: { ...s.currentObs, medida, medidaOrigen: origen },
      step: 'criticidad',
      progressStep: 2,
    })),
  setProb: (prob) => set((s) => ({ currentObs: { ...s.currentObs, prob } })),
  setCons: (cons, ) =>
    set((s) => {
      const p = s.currentObs.prob ?? 1;
      const nivel = calcNivel(p, cons);
      const sla = defaultSla(nivel);
      return { currentObs: { ...s.currentObs, cons, nivel, sla }, step: 'sla' };
    }),
  setSla: (sla) => set((s) => ({ currentObs: { ...s.currentObs, sla } })),
  addMoreObs: () =>
    set((s) => ({
      observaciones: [...s.observaciones, s.currentObs],
      currentObs: emptyObs(),
      step: 'obs_desc',
      progressStep: 3,
    })),
  finishObs: () =>
    set((s) => ({
      observaciones: [...s.observaciones, s.currentObs],
      currentObs: emptyObs(),
      step: 'empresa',
      progressStep: 4,
    })),
  setEmpresa: (empresa) => set({ empresa, step: 'personal' }),
  togglePersonal: (name) =>
    set((s) => ({
      personalSel: s.personalSel.includes(name)
        ? s.personalSel.filter((n) => n !== name)
        : [...s.personalSel, name],
    })),
  goToResumen: () => set({ step: 'resumen', progressStep: 5 }),
  reset: () =>
    set({
      step: 'area',
      progressStep: 0,
      area: null,
      sector: null,
      tipo: null,
      observaciones: [],
      currentObs: emptyObs(),
      empresa: null,
      personalSel: [],
      aiSuggestion: null,
      aiLoading: false,
    }),
}));

function calcNivel(p: number, c: number): string {
  const s = (p - 1) + (c - 1);
  if (s <= 1) return 'Bajo';
  if (s <= 3) return 'Medio';
  if (s <= 5) return 'Alto';
  return 'Crítico';
}

function defaultSla(nivel: string): number {
  return ({ Bajo: 14, Medio: 7, Alto: 3, Crítico: 1 } as Record<string, number>)[nivel] ?? 7;
}
