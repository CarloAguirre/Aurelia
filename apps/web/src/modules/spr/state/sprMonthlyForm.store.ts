import { create } from 'zustand';

// Estado de CLIENTE/UI del formulario de carga mensual SPR.
// Solo guarda lo que el usuario esta editando en pantalla (borrador en memoria)
// y la seleccion actual. Los datos del servidor (parametros, registros, unidades)
// viven en TanStack Query, nunca aca (ver STATE_MANAGEMENT.md).

export interface SprParameterFormEntry {
  // Valor tecleado por el usuario (string para respetar coma decimal del diseno).
  value: string;
  // PLACEHOLDER: flag "Sin consumo / No aplica" sin campo dedicado en backend.
  notApplicable: boolean;
  // PLACEHOLDER: "Fuente del dato" sin persistencia en backend.
  source: string;
  // Nota para el Gerente de Area -> se mapea a notes al guardar.
  note: string;
}

const emptyEntry: SprParameterFormEntry = {
  value: '',
  notApplicable: false,
  source: '',
  note: '',
};

interface SprMonthlyFormState {
  selectedParameterId: string | null;
  entries: Record<string, SprParameterFormEntry>;
  selectParameter: (parameterId: string) => void;
  setValue: (parameterId: string, value: string) => void;
  setNotApplicable: (parameterId: string, notApplicable: boolean) => void;
  setSource: (parameterId: string, source: string) => void;
  setNote: (parameterId: string, note: string) => void;
  reset: () => void;
}

function patchEntry(
  state: SprMonthlyFormState,
  parameterId: string,
  patch: Partial<SprParameterFormEntry>,
): Record<string, SprParameterFormEntry> {
  const current = state.entries[parameterId] ?? emptyEntry;
  return { ...state.entries, [parameterId]: { ...current, ...patch } };
}

export function getSprFormEntry(
  entries: Record<string, SprParameterFormEntry>,
  parameterId: string | null,
): SprParameterFormEntry {
  if (!parameterId) return emptyEntry;
  return entries[parameterId] ?? emptyEntry;
}

export const useSprMonthlyFormStore = create<SprMonthlyFormState>((set) => ({
  selectedParameterId: null,
  entries: {},
  selectParameter: (selectedParameterId) => set({ selectedParameterId }),
  setValue: (parameterId, value) => set((state) => ({ entries: patchEntry(state, parameterId, { value }) })),
  setNotApplicable: (parameterId, notApplicable) =>
    set((state) => ({ entries: patchEntry(state, parameterId, { notApplicable }) })),
  setSource: (parameterId, source) => set((state) => ({ entries: patchEntry(state, parameterId, { source }) })),
  setNote: (parameterId, note) => set((state) => ({ entries: patchEntry(state, parameterId, { note }) })),
  reset: () => set({ selectedParameterId: null, entries: {} }),
}));
