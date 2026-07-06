import { useMemo } from 'react';
import { useSessionStore } from '../../../../shared/stores/session.store';
import { useNewInspectionCatalogs } from '../hooks/useNewInspectionCatalogs';
import { useNewInspectionLocation } from '../hooks/useNewInspectionLocation';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';
import { useNewInspectionFlowStore } from '../state/newInspectionFlow.store';
import { ManualFormStepper } from '../components/ManualFormStepper';
import { SelectSheet, type SelectSheetOption } from '../components/SelectSheet';

interface IdentificationStepProps {
  onCancel: () => void;
  onNext: () => void;
}

function formatDate(value: Date): string {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}-${month}-${year}`;
}

function buildDateOptions(): SelectSheetOption[] {
  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const label = formatDate(date);
    const description =
      index === 0
        ? 'Hoy'
        : index === 1
        ? 'Ayer'
        : new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(date);

    return { id: label, label, description };
  });
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <p className="text-[13px] font-bold text-[#131313]">{label}</p>
      {children}
    </div>
  );
}

function FieldBox({ value, interactive = false, disabled = false, right, onClick }: { value: string; interactive?: boolean; disabled?: boolean; right?: React.ReactNode; onClick?: () => void; }) {
  return (
    <button
      type="button"
      className={`flex h-[50px] w-full items-center justify-between gap-[8px] rounded-[10px] px-[13px] text-left ${
        interactive ? 'border-[1.5px] border-[#b4d1ed] bg-[#F6FAFF]' : 'bg-[#EEEEEE]'
      } ${disabled ? 'opacity-65' : ''}`}
      onClick={onClick}
      disabled={!onClick || disabled}
    >
      <span className="truncate text-[14px] font-medium text-[#131313]">{value}</span>
      {right}
    </button>
  );
}

export function IdentificationStep({ onCancel, onNext }: IdentificationStepProps) {
  const user = useSessionStore((state) => state.user);
  const draft = useNewInspectionDraftStore();
  const flow = useNewInspectionFlowStore();
  const { areas, sectors, loadingAreas, loadingSectors, catalogErrorMessage } = useNewInspectionCatalogs();
  const { captureLocation, capturing, locationError } = useNewInspectionLocation();

  const areaOptions = useMemo<SelectSheetOption[]>(
    () => areas.map((area) => ({ id: area.id, label: area.name, description: area.code })),
    [areas],
  );

  const sectorOptions = useMemo<SelectSheetOption[]>(
    () => sectors.map((sector) => ({ id: sector.id, label: sector.name, description: sector.code })),
    [sectors],
  );

  const dateOptions = useMemo<SelectSheetOption[]>(buildDateOptions, []);
  const inspectorName = user?.fullName ?? draft.inspectorName;
  const inspectorCompanyName = draft.inspectorCompanyName;
  const canContinue = Boolean(draft.areaId && draft.sectorId && draft.inspectionDate && draft.locationCaptured);

  function selectArea(option: SelectSheetOption) {
    draft.setArea(option.id, option.label);
    flow.closePicker();
  }

  function selectSector(option: SelectSheetOption) {
    draft.setSector(option.id, option.label);
    flow.closePicker();
  }

  function selectDate(option: SelectSheetOption) {
    draft.setInspectionDate(option.label);
    flow.closePicker();
  }

  async function handleCaptureLocation() {
    await captureLocation();
  }

  function handleNext() {
    if (!canContinue) return;
    onNext();
  }

  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[12px] py-[6px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center">
          <div className="w-[42px]" />
          <div className="flex-1 px-[4px]">
            <p className="text-[18px] font-semibold">Identificacion</p>
            <p className="mt-[1px] text-[14px] text-[rgba(255,255,255,0.55)]">Paso 1 de 5</p>
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

      <ManualFormStepper activeStep={1} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        <div>
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Identificacion</p>
          <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">
            Completa los datos del inspector y de la inspeccion antes de continuar
          </p>
        </div>

        <div className="mt-[12px] rounded-[12px] border border-[#e3e3e3] bg-white p-[15px]">
          <div className="flex items-center gap-[7px] pb-[2px]">
            <span className="text-[11px] text-[#24588b]">🏷</span>
            <p className="text-[11px] font-bold uppercase tracking-[0.66px] text-[#646464]">Datos del inspector</p>
          </div>
          <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">¿Quien esta realizando esta inspeccion?</p>

          <div className="mt-[10px] grid gap-[10px]">
            <LabeledField label="Inspector *">
              <FieldBox value={inspectorName} />
            </LabeledField>
            <LabeledField label="Empresa del inspector *">
              <FieldBox value={inspectorCompanyName} />
            </LabeledField>
          </div>
        </div>

        <div className="mt-[12px] rounded-[12px] border border-[#e3e3e3] bg-white p-[15px]">
          <div className="flex items-center gap-[7px] pb-[2px]">
            <span className="text-[11px] text-[#00b398]">📍</span>
            <p className="text-[11px] font-bold uppercase tracking-[0.66px] text-[#646464]">Datos de la inspeccion</p>
          </div>
          <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">¿Donde y cuando se realiza esta inspeccion?</p>

          <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
            <LabeledField label="Area *">
              <FieldBox
                value={loadingAreas ? 'Cargando...' : draft.areaName ?? '-Seleccionar-'}
                interactive
                right={<span className="text-[14px]">⌄</span>}
                onClick={() => flow.openPicker('area')}
              />
            </LabeledField>
            <LabeledField label="Sector *">
              <FieldBox
                value={loadingSectors ? 'Cargando...' : draft.sectorName ?? '-Seleccionar-'}
                interactive
                disabled={!draft.areaId}
                right={<span className="text-[14px]">⌄</span>}
                onClick={() => flow.openPicker('sector')}
              />
            </LabeledField>
          </div>

          <div className="mt-[10px]">
            <LabeledField label="Fecha de inspeccion *">
              <FieldBox
                value={draft.inspectionDate}
                interactive
                right={<span className="text-[16px]">🗓</span>}
                onClick={() => flow.openPicker('date')}
              />
            </LabeledField>
          </div>

          <div className="mt-[10px] flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#131313]">Ubicacion *</p>
            <button type="button" className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-[1.5px] border-[#24588b] text-[12px] text-[#24588b]">i</button>
          </div>

          <button
            type="button"
            className={`mt-[6px] flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[10px] text-[13px] font-bold text-white ${
              draft.locationCaptured ? 'bg-[#3A9B3A]' : 'bg-[#C8A064]'
            }`}
            onClick={handleCaptureLocation}
            disabled={capturing}
          >
            <span>{draft.locationCaptured ? '✓' : '◎'}</span>
            {capturing ? 'Capturando ubicacion...' : draft.locationCaptured ? 'Ubicacion capturada' : 'Capturar ubicacion'}
          </button>

          {locationError ? <p className="mt-[6px] text-[11px] text-[#BD3B5B]">{locationError}</p> : null}
          {catalogErrorMessage ? <p className="mt-[6px] text-[11px] text-[#BD3B5B]">{catalogErrorMessage}</p> : null}

          <div className="mt-[10px] flex h-[50px] items-center justify-between rounded-[10px] bg-[#F6FAFF] px-[13px] text-[14px] font-medium text-[#131313]">
            <span className="truncate">{draft.locationLabel}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[20px] text-[14px] font-bold text-[#C8A064]"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`flex h-[50px] flex-1 items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold ${
              canContinue ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'
            }`}
            onClick={handleNext}
            disabled={!canContinue}
          >
            Continuar
            <span>→</span>
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>

      <SelectSheet
        visible={flow.activePicker === 'area'}
        title="Seleccionar area"
        subtitle="Catalogo online/cache local"
        options={areaOptions}
        selectedId={draft.areaId}
        loading={loadingAreas}
        emptyText="No hay catalogos disponibles"
        onClose={flow.closePicker}
        onSelect={selectArea}
      />

      <SelectSheet
        visible={flow.activePicker === 'sector'}
        title="Seleccionar sector"
        subtitle={draft.areaName ?? 'Selecciona un area primero'}
        options={sectorOptions}
        selectedId={draft.sectorId}
        loading={loadingSectors}
        emptyText="No hay catalogos disponibles"
        onClose={flow.closePicker}
        onSelect={selectSector}
      />

      <SelectSheet
        visible={flow.activePicker === 'date'}
        title="Fecha de inspeccion"
        subtitle="Selecciona la fecha del registro"
        options={dateOptions}
        selectedId={draft.inspectionDate}
        onClose={flow.closePicker}
        onSelect={selectDate}
      />
    </>
  );
}
