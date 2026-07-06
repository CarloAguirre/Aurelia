import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ManualFormStepper } from '../components/ManualFormStepper';
import { SelectSheet, type SelectSheetOption } from '../components/SelectSheet';
import {
  type NewInspectionFindingObservationDraft,
  useNewInspectionDraftStore,
} from '../state/newInspectionDraft.store';
import {
  getCompanyUsers,
  getResponsibleCompanies,
  getInspectionFindingSeverities,
  getInspectionFindingTypes,
} from '../../../../shared/services/inspections.service';

interface FindingObservationsStepProps {
  onBack: () => void;
  onNext: () => void;
}

type FindingPicker = 'finding-type' | 'severity' | 'company' | 'users' | null;

function findSeverityLabel(optionId: string, options: SelectSheetOption[]) {
  return options.find((item) => item.id === optionId)?.label ?? null;
}

function pluralizeObservation(count: number) {
  return count === 1 ? '1 observacion' : `${count} observaciones`;
}

function EmptyObservationsCard() {
  return (
    <div className="flex min-h-[90px] items-start gap-[12px] rounded-[12px] bg-[#4A90C4] px-[14px] py-[12px] text-white">
      <div className="mt-[1px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[11px] text-[#4A90C4]">i</div>
      <div className="flex-1">
        <p className="text-[13px] font-bold">Sin observaciones aun</p>
        <p className="mt-[2px] text-[11px] leading-[15px] text-[rgba(255,255,255,0.88)]">
          Agrega al menos una observacion para continuar. Puedes registrar todas las que encontraste en esta visita.
        </p>
      </div>
    </div>
  );
}

function ObservationCard({
  observation,
  severityOptions,
  onOpenSeverity,
  onChange,
  onSave,
  onRemove,
}: {
  observation: NewInspectionFindingObservationDraft;
  severityOptions: SelectSheetOption[];
  onOpenSeverity: () => void;
  onChange: (patch: Partial<Omit<NewInspectionFindingObservationDraft, 'id'>>) => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onChange({ evidence: { name: file.name, file } });
  }

  const complete = Boolean(
    observation.detectedCondition.trim() &&
      observation.correctiveAction.trim() &&
      observation.evidence &&
      observation.severityId,
  );

  return (
    <div className="rounded-[12px] border-[1.5px] border-[#C8A064] bg-white p-[12px]">
      <div className="mb-[8px] flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-[0.3px] text-[#9B7440]">Nueva observacion</p>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-[#FFD4E0] text-[14px] text-[#7A0E23]"
        >
          🗑
        </button>
      </div>

      <div className="grid gap-[8px]">
        <div>
          <p className="text-[13px] font-bold text-[#131313]">Condicion detectada *</p>
          <textarea
            className="mt-[4px] min-h-[70px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] py-[10px] text-[13px] text-[#131313] outline-none"
            placeholder="Describe la condicion subestandar..."
            value={observation.detectedCondition}
            onChange={(event) => onChange({ detectedCondition: event.target.value })}
          />
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#131313]">Fotografia antes *</p>
          <label
            className={`mt-[4px] flex cursor-pointer items-center rounded-[10px] border-[1.5px] px-[12px] py-[8px] ${
              observation.evidence
                ? 'min-h-[58px] border-0 bg-[#35A137] text-white'
                : 'min-h-[90px] border-dashed border-[#D1D1D1] bg-[#F6FAFF]'
            }`}
          >
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            {observation.evidence ? <span className="mr-[10px] flex h-[42px] w-[42px] items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.24)] text-[15px]">📷</span> : <span className="text-[22px]">📷</span>}
            <span className="ml-[8px] flex flex-col">
              <span className={`text-[13px] font-semibold ${observation.evidence ? 'text-white text-left' : 'text-[#646464]'}`}>
                {observation.evidence?.name ?? 'Tomar foto o galeria'}
              </span>
              {!observation.evidence ? <span className="mt-[2px] text-[11px] text-[#B7B7B7]">Fecha, hora y GPS automaticos</span> : null}
            </span>
          </label>
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#131313]">Medida correctiva propuesta *</p>
          <textarea
            className="mt-[4px] min-h-[70px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] py-[10px] text-[13px] text-[#131313] outline-none"
            placeholder="Que debe hacer la EECC..."
            value={observation.correctiveAction}
            onChange={(event) => onChange({ correctiveAction: event.target.value })}
          />
        </div>

        <div>
          <p className="text-[18px] font-bold leading-[22px] text-[#131313]">Seleccione la criticidad</p>
          <p className="mt-[2px] text-[12px] leading-[16px] text-[#646464]">
            Califica el riesgo global de esta visita · aplica a las observaciones registradas
          </p>
          <button
            type="button"
            onClick={onOpenSeverity}
            className="mt-[4px] flex h-[48px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px]"
          >
            <span className="truncate text-[14px] font-medium text-[#131313]">
              {observation.severityLabel ?? 'Seleccione criticidad'}
            </span>
            <span>⌄</span>
          </button>
          {observation.severityId ? (
            <div className="mt-[8px] flex items-center justify-between rounded-[10px] border-[1.5px] border-[#F29A5B] bg-[#FFDCC4] px-[12px] py-[10px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#5E3B24]">SLA calculado</span>
              <span className="text-[20px] font-bold text-[#5E3B24]">
                {findSeverityLabel(observation.severityId, severityOptions) ?? observation.severityClosureTimeLabel ?? 'N/D'}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-[8px] pt-[4px]">
          <button
            type="button"
            onClick={onSave}
            disabled={!complete}
            className={`h-[40px] rounded-[10px] px-[14px] text-[13px] font-bold text-white ${
              complete ? 'bg-[#C8A064]' : 'bg-[#D1D1D1]'
            }`}
          >
            Guardar observacion
          </button>
        </div>
      </div>
    </div>
  );
}

export function FindingObservationsStep({ onBack, onNext }: FindingObservationsStepProps) {
  const draft = useNewInspectionDraftStore();
  const [picker, setPicker] = useState<FindingPicker>(null);
  const [observationIdForSeverity, setObservationIdForSeverity] = useState<string | null>(null);

  const setFindingType = useNewInspectionDraftStore((state) => state.setFindingType);
  const addFindingObservation = useNewInspectionDraftStore((state) => state.addFindingObservation);
  const updateFindingObservation = useNewInspectionDraftStore((state) => state.updateFindingObservation);
  const removeFindingObservation = useNewInspectionDraftStore((state) => state.removeFindingObservation);
  const setFindingCompany = useNewInspectionDraftStore((state) => state.setFindingCompany);
  const setFindingResponsibles = useNewInspectionDraftStore((state) => state.setFindingResponsibles);

  const findingTypesQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'finding-types'],
    queryFn: getInspectionFindingTypes,
  });

  const severitiesQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'finding-severities'],
    queryFn: getInspectionFindingSeverities,
  });

  const companiesQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'companies'],
    queryFn: getResponsibleCompanies,
  });

  const usersByCompanyQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'company-users', draft.findingCompanyId],
    queryFn: () => getCompanyUsers(draft.findingCompanyId ?? ''),
    enabled: Boolean(draft.findingCompanyId),
  });

  const findingTypeOptions = useMemo<SelectSheetOption[]>(
    () =>
      (findingTypesQuery.data ?? []).map((item) => ({
        id: item.id,
        label: item.name,
      })),
    [findingTypesQuery.data],
  );

  const severityOptions = useMemo<SelectSheetOption[]>(
    () =>
      (severitiesQuery.data ?? []).map((item) => ({
        id: item.id,
        label: item.name,
        description: item.description,
      })),
    [severitiesQuery.data],
  );

  const companyOptions = useMemo<SelectSheetOption[]>(
    () =>
      (companiesQuery.data ?? []).map((item) => ({
        id: item.id,
        label: item.name,
        description: item.code ?? undefined,
      })),
    [companiesQuery.data],
  );

  const userOptions = useMemo<SelectSheetOption[]>(
    () =>
      (usersByCompanyQuery.data ?? []).map((item) => ({
        id: item.id,
        label: item.fullName,
        description: item.position ?? undefined,
      })),
    [usersByCompanyQuery.data],
  );

  function onSelectFindingType(option: SelectSheetOption) {
    setFindingType(option.id, option.label);
    setPicker(null);
  }

  function onSelectCompany(option: SelectSheetOption) {
    setFindingCompany(option.id, option.label);
    setPicker(null);
  }

  function onSelectSeverity(option: SelectSheetOption) {
    if (!observationIdForSeverity) return;
    updateFindingObservation(observationIdForSeverity, {
      severityId: option.id,
      severityLabel: option.label,
      severityClosureTimeLabel: option.description ?? null,
    });
    setPicker(null);
    setObservationIdForSeverity(null);
  }

  function toggleResponsible(userId: string) {
    const next = draft.findingResponsibleIds.includes(userId)
      ? draft.findingResponsibleIds.filter((id) => id !== userId)
      : [...draft.findingResponsibleIds, userId];
    setFindingResponsibles(next);
  }

  function addObservation() {
    if (!draft.findingTypeId) return;
    addFindingObservation();
  }

  const hasSavedObservation = draft.findingObservations.some((item) => item.saved);
  const savedObservationsCount = draft.findingObservations.filter((item) => item.saved).length;
  const hasActiveObservation = draft.findingObservations.some((item) => !item.saved);
  const showInitialSelector = !hasSavedObservation && !hasActiveObservation;
  const canContinue = Boolean(hasSavedObservation && draft.findingCompanyId && draft.findingResponsibleIds.length > 0);

  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[12px] py-[6px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center">
          <button type="button" className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px]" onClick={onBack}>
            ←
          </button>
          <div className="flex-1 px-[4px]">
            <p className="text-[18px] font-semibold">Observaciones</p>
            <p className="mt-[1px] text-[14px] text-[rgba(255,255,255,0.55)]">Paso 3 de 5</p>
          </div>
          <div className="mr-[4px] rounded-[16px] bg-[#C8A064] px-[10px] py-[2px]">
            <span className="text-[10px] font-bold text-[#001E39]">GF HSE</span>
          </div>
        </div>
      </div>

      <div className="flex h-[23px] items-center gap-[7px] border-b border-[#C8A064] bg-[#2A1A04] px-[16px]">
        <span className="text-[11px] text-[#C8A064]">☁</span>
        <span className="text-[11px] font-semibold text-[#C8A064]">Sin red · guardando localmente</span>
      </div>

      <ManualFormStepper activeStep={3} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        {showInitialSelector ? (
          <>
            <div>
              <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Tipo de hallazgo</p>
              <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">
                Seleccione el tipo de hallazgo antes de continuar con las observaciones para esta inspeccion.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPicker('finding-type')}
              className="mt-[8px] flex h-[48px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px]"
            >
              <span className="truncate text-[14px] font-medium text-[#131313]">{draft.findingTypeLabel ?? 'Seleccione'}</span>
              <span>⌄</span>
            </button>
          </>
        ) : null}

        <div className={showInitialSelector ? 'mt-[12px]' : ''}>
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Observaciones</p>
          <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">
            Registra cada condicion detectada en esta visita · una a una
          </p>
        </div>

        {!hasSavedObservation && !hasActiveObservation ? <EmptyObservationsCard /> : null}

        {hasSavedObservation ? (
          <div className="mt-[12px] flex min-h-[58px] items-center gap-[16px] rounded-[12px] bg-[#4A90C4] px-[20px] py-[10px] text-white">
            <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white text-[12px] text-[#4A90C4]">i</span>
            <span className="text-[14px] font-bold">La inspeccion contiene: {pluralizeObservation(savedObservationsCount)}</span>
          </div>
        ) : null}

        <div className="mt-[12px] grid gap-[12px]">
          {draft.findingObservations.map((observation, observationIndex) => {
            if (observation.saved) {
              return (
                <div
                  key={observation.id}
                  className="rounded-[12px] border border-[#E1E1E1] bg-white px-[14px] pb-[16px] pt-[14px] shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-[8px] flex items-center justify-between">
                    <div className="flex items-center gap-[8px]">
                      <span className="rounded-[8px] bg-[#DDF0FF] px-[10px] py-[5px] text-[12px] font-bold text-[#1E5A92]">Obs. {observationIndex + 1}</span>
                      <span className="rounded-[8px] bg-[#FFE2CF] px-[8px] py-[4px] text-[12px] font-bold text-[#5E3B24]">{observation.severityLabel ?? 'Sin criticidad'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFindingObservation(observation.id)}
                      className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[#FFD4E0] text-[14px] text-[#7A0E23]"
                    >
                      🗑
                    </button>
                  </div>
                  <div className="rounded-[8px] border border-[#E1E1E1] p-[10px]">
                    <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#646464]">Condicion detectada</p>
                    <p className="mt-[6px] text-[13px] text-[#131313]">{observation.detectedCondition || 'Sin descripcion'}</p>
                  </div>
                  <div className="mt-[8px] rounded-[8px] bg-[#F4F4F4] p-[10px]">
                    <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#646464]">Medida correctiva propuesta</p>
                    <p className="mt-[6px] text-[13px] text-[#131313]">{observation.correctiveAction || 'Sin medida correctiva'}</p>
                  </div>
                  <div className="mt-[8px] h-[2px] bg-[#C8A064]/80" />
                  {observation.evidence ? (
                      <div className="mt-[8px] flex min-h-[72px] items-center gap-[12px] rounded-[8px] bg-[#35A137] px-[14px] py-[8px] text-white">
                        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.24)] text-[16px]">📷</span>
                        <span className="text-[14px] font-bold">{observation.evidence.name}</span>
                    </div>
                  ) : null}
                  <div className="mt-[8px] flex items-center justify-between border-t border-[#E1E1E1] px-[4px] pt-[12px]">
                    <span className="text-[14px] text-[#646464]">SLA calculado</span>
                    <span className="text-[14px] font-bold text-[#131313]">{observation.severityClosureTimeLabel ?? observation.severityLabel ?? 'N/D'}</span>
                  </div>
                </div>
              );
            }

            return (
              <ObservationCard
                key={observation.id}
                observation={observation}
                severityOptions={severityOptions}
                onOpenSeverity={() => {
                  setObservationIdForSeverity(observation.id);
                  setPicker('severity');
                }}
                onChange={(patch) => updateFindingObservation(observation.id, patch)}
                onSave={() => {
                  const complete = Boolean(
                    observation.detectedCondition.trim() &&
                    observation.correctiveAction.trim() &&
                    observation.evidence &&
                    observation.severityId,
                  );
                  if (!complete) return;
                  updateFindingObservation(observation.id, { saved: true });
                }}
                onRemove={() => removeFindingObservation(observation.id)}
              />
            );
          })}

          <button
            type="button"
            onClick={addObservation}
            disabled={!draft.findingTypeId || draft.findingObservations.some((item) => !item.saved)}
            className="flex h-[58px] w-full items-center justify-center gap-[8px] rounded-[10px] border-[2px] border-dashed border-[#D1D1D1] bg-[#F6FAFF] text-[16px] font-bold text-[#1E5A92] disabled:text-[#D1D1D1]"
          >
            + Agregar observacion
          </button>
        </div>

        <div className="mt-[12px] rounded-[12px] border border-[#E1E1E1] bg-white p-[14px] shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
          <p className="text-[20px] font-bold leading-[24px] text-[#131313]">Responsables</p>
          <p className="mt-[8px] text-[13px] font-bold text-[#131313]">Empresa encargada de los hallazgos</p>
          <button
            type="button"
            onClick={() => setPicker('company')}
            className="mt-[4px] flex min-h-[58px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[14px]"
          >
            <span className="truncate text-[16px] font-medium leading-[20px] text-[#131313]">{draft.findingCompanyName ?? 'Seleccione empresa'}</span>
            <span>⌄</span>
          </button>

          <p className="mt-[10px] text-[13px] font-bold text-[#131313]">Personal encargado de los hallazgos</p>
          <button
            type="button"
            onClick={() => setPicker('users')}
            disabled={!draft.findingCompanyId}
            className="mt-[4px] flex min-h-[58px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[14px] disabled:opacity-70"
          >
            <span className="truncate text-[16px] font-medium leading-[20px] text-[#131313]">
              {draft.findingResponsibleIds.length > 0 ? `${draft.findingResponsibleIds.length} personas seleccionadas` : 'Seleccione personal'}
            </span>
            <span>⌄</span>
          </button>
        </div>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[20px] text-[14px] font-bold text-[#C8A064]"
            onClick={onBack}
          >
            Atras
          </button>
          <button
            type="button"
            className={`flex h-[50px] flex-1 items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold ${
              canContinue ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'
            }`}
            onClick={onNext}
            disabled={!canContinue}
          >
            Continuar
            <span>→</span>
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>

      <SelectSheet
        visible={picker === 'finding-type'}
        title="Tipo de hallazgo"
        options={findingTypeOptions}
        selectedId={draft.findingTypeId}
        loading={findingTypesQuery.isLoading}
        emptyText="No hay tipos disponibles"
        onClose={() => setPicker(null)}
        onSelect={onSelectFindingType}
      />

      {picker === 'severity' ? (
        <div className="fixed inset-0 z-[80] flex items-end">
          <button
            type="button"
            aria-label="Cerrar selector de criticidad"
            className="absolute inset-0 bg-[rgba(0,0,0,0.68)]"
            onClick={() => setPicker(null)}
          />
          <div className="relative max-h-[78vh] min-h-[420px] w-full overflow-hidden rounded-t-[20px] bg-white">
            <div className="flex min-h-[76px] items-center justify-between px-[22px] pt-[8px]">
              <p className="flex-1 text-[18px] font-bold text-[#131313]">Seleccionar criticidad</p>
              <button
                type="button"
                aria-label="Cerrar"
                className="flex h-[38px] w-[38px] items-center justify-center text-[22px] text-[#131313]"
                onClick={() => setPicker(null)}
              >
                ×
              </button>
            </div>

            <div className="max-h-[56vh] overflow-y-auto">
              {severitiesQuery.isLoading ? (
                <div className="flex min-h-[120px] items-center justify-center border-t border-[#E0E0E0] px-[24px]">
                  <p className="text-[14px] text-[#646464]">Cargando opciones...</p>
                </div>
              ) : null}

              {severitiesQuery.isError ? (
                <div className="flex min-h-[120px] items-center justify-center border-t border-[#E0E0E0] px-[24px]">
                  <p className="text-center text-[14px] leading-[20px] text-[#646464]">
                    No se pudo cargar la criticidad desde catalogos.
                  </p>
                </div>
              ) : null}

              {!severitiesQuery.isLoading && !severitiesQuery.isError && severityOptions.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center border-t border-[#E0E0E0] px-[24px]">
                  <p className="text-center text-[14px] leading-[20px] text-[#646464]">No hay criticidades disponibles.</p>
                </div>
              ) : null}

              {!severitiesQuery.isLoading && !severitiesQuery.isError
                ? severityOptions.map((option) => {
                    const selectedId = observationIdForSeverity
                      ? draft.findingObservations.find((item) => item.id === observationIdForSeverity)?.severityId
                      : null;
                    const selected = option.id === selectedId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectSeverity(option)}
                        className={`flex min-h-[88px] w-full flex-col items-start justify-center border-t border-[#E0E0E0] px-[22px] py-[14px] text-left ${
                          selected ? 'bg-[#FAFAFA]' : ''
                        }`}
                      >
                        <span className={`text-[16px] leading-[24px] ${option.description ? 'font-bold' : 'font-normal'} text-[#131313]`}>{option.label}</span>
                        {option.description ? <span className="mt-[12px] text-[15px] leading-[22px] text-[#131313]">{option.description}</span> : null}
                      </button>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      ) : null}

      {picker === 'company' ? (
        <div className="fixed inset-0 z-[80] flex items-end">
          <button
            type="button"
            aria-label="Cerrar selector de empresa"
            className="absolute inset-0 bg-[rgba(0,0,0,0.32)]"
            onClick={() => setPicker(null)}
          />
          <div className="relative max-h-[86vh] w-full rounded-t-[16px] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.24)]">
            <div className="mx-auto mb-[22px] mt-[22px] h-[4px] w-[40px] rounded-[2px] bg-[#D1D1D1]" />
            <p className="px-[22px] pb-[14px] text-[14px] font-bold text-[#131313]">Seleccione la empresa encargada</p>

            <div className="max-h-[48vh] overflow-y-auto px-[8px] py-[8px]">
              {companiesQuery.isLoading ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">Cargando empresas...</p>
              ) : null}

              {companiesQuery.isError ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">
                  No se pudieron cargar las empresas desde catalogos.
                </p>
              ) : null}

              {!companiesQuery.isLoading && !companiesQuery.isError && companyOptions.length === 0 ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">No hay empresas disponibles.</p>
              ) : null}

              {companyOptions.map((company) => {
                const selected = company.id === draft.findingCompanyId;
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => onSelectCompany(company)}
                    className={`mb-[6px] flex h-[40px] w-full items-center rounded-[8px] px-[8px] text-left ${
                      selected ? 'bg-[#F6FAFF]' : ''
                    }`}
                  >
                    <span className="flex-1 text-[14px] leading-[22px] tracking-[0.28px] text-[#131313]">{company.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#E3E3E3] px-[20px] pb-[14px] pt-[15px]">
              <button
                type="button"
                className="h-[44px] w-full rounded-[14px] border-[2px] border-[#C8A064] bg-white text-[13px] font-bold text-[#7A5A2B]"
                onClick={() => setPicker(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {picker === 'users' ? (
        <div className="fixed inset-0 z-[80] flex items-end">
          <button
            type="button"
            aria-label="Cerrar selector de personal"
            className="absolute inset-0 bg-[rgba(0,0,0,0.32)]"
            onClick={() => setPicker(null)}
          />
          <div className="relative max-h-[86vh] w-full rounded-t-[16px] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.24)]">
            <div className="mx-auto mb-[22px] mt-[22px] h-[4px] w-[40px] rounded-[2px] bg-[#D1D1D1]" />
            <p className="px-[22px] pb-[14px] text-[14px] font-bold text-[#131313]">Seleccione al personal encargado</p>

            <div className="max-h-[48vh] overflow-y-auto px-[8px] py-[8px]">
              {!draft.findingCompanyId ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">
                  Seleccione una empresa para cargar el personal.
                </p>
              ) : null}

              {draft.findingCompanyId && usersByCompanyQuery.isLoading ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">Cargando personal...</p>
              ) : null}

              {draft.findingCompanyId && usersByCompanyQuery.isError ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">
                  No se pudo cargar el personal asociado.
                </p>
              ) : null}

              {draft.findingCompanyId && !usersByCompanyQuery.isLoading && !usersByCompanyQuery.isError && userOptions.length === 0 ? (
                <p className="px-[14px] py-[16px] text-[14px] leading-[20px] text-[#646464]">
                  No hay personal asociado a la empresa seleccionada.
                </p>
              ) : null}

              {userOptions.map((user) => {
                const selected = draft.findingResponsibleIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleResponsible(user.id)}
                    className="mb-[6px] flex min-h-[40px] w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] ${
                        selected ? 'border-[#C8A064] bg-[#C8A064] text-white' : 'border-[#001E39] bg-white'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </span>
                    <span className="flex-1 text-[14px] leading-[18px] text-[#131313]">
                      {user.label}
                      {user.description ? <span className="block text-[12px] text-[#646464]">{user.description}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#E3E3E3] px-[20px] pb-[14px] pt-[15px]">
              <button
                type="button"
                className="h-[44px] w-full rounded-[14px] border-[2px] border-[#C8A064] bg-white text-[13px] font-bold text-[#7A5A2B]"
                onClick={() => setPicker(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
