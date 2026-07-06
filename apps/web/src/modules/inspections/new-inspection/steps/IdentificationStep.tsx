import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSessionStore } from '../../../../shared/stores/session.store';
import { useNewInspectionCatalogs } from '../hooks/useNewInspectionCatalogs';
import { useNewInspectionLocation } from '../hooks/useNewInspectionLocation';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';
import { useNewInspectionFlowStore } from '../state/newInspectionFlow.store';
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

function displayDate(value: string) {
  return value.replaceAll('-', '/');
}

function HeaderIcon({ tone }: { tone: 'inspector' | 'inspection' }) {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      {tone === 'inspector' ? (
        <path d="M7 5.7a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Zm-4.8 5.1c.5-2.1 2.4-3.6 4.8-3.6s4.3 1.5 4.8 3.6" fill="#24588B" />
      ) : (
        <path d="M2 2.5h5.3v2H2v-2Zm6.6.4 1.1-1.1 1.2 1.2 2-2 1.1 1.1-3.1 3.1-2.3-2.3ZM2 6.4h10v1.4H2V6.4Zm0 3h7v1.4H2V9.4Z" fill="#00B398" />
      )}
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none" aria-hidden="true">
      <path d="m1 1 11 9M2.2 4.1c2.5-1.8 5.8-1.8 8.3 0M4.5 6.1c1.2-.7 2.7-.7 3.9 0" stroke="#C8A064" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.8" stroke="#24588B" strokeWidth="1.5" />
      <path d="M9 7.5v5" stroke="#24588B" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="5.1" r="1" fill="#24588B" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="12" height="11" rx="1.6" stroke="#131313" strokeWidth="1.5" />
      <path d="M3 7h12M6 2.8v2.4M12 2.8v2.4" stroke="#131313" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <path d="M1 7h15M10.5 1.5 16 7l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaretDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m4.5 7 4.5 4 4.5-4" stroke="#131313" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPreview() {
  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[linear-gradient(158deg,#2A4A3A_0%,#1E3A2E_30%,#2A4A3A_50%,#1A3228_100%)]">
      <div className="absolute inset-0 opacity-90 bg-[linear-gradient(158deg,#1E4A2E_0%,#2A5A3A_40%,#1A3828_70%,#243E30_100%)]" />
      <div className="absolute left-[58px] top-[35px] h-[3px] w-[178px] rounded-[2px] bg-[rgba(255,200,100,0.4)]" />
      <div className="absolute left-[30px] top-[70px] h-[2px] w-[118px] rounded-[2px] bg-[rgba(255,200,100,0.3)]" />
      <div className="absolute left-[134px] top-[31px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 2.5c-5 0-9 3.9-9 8.8 0 6.7 9 14.2 9 14.2s9-7.5 9-14.2c0-4.9-4-8.8-9-8.8Z" fill="#BD3B5B" />
          <circle cx="14" cy="11.2" r="2.4" fill="#2A1A04" />
        </svg>
      </div>
      <div className="absolute bottom-[11px] left-[8px] rounded-[4px] bg-[rgba(0,0,0,0.6)] px-[8px] py-[3px] text-[10px] font-semibold leading-[12px] text-white">Salares Norte · 4.500 msnm</div>
      <div className="absolute bottom-[11px] right-[8px] rounded-[4px] bg-[rgba(0,179,152,0.8)] px-[8px] py-[3px] text-[10px] font-semibold leading-[12px] text-white">± 12.4 m</div>
    </div>
  );
}

function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

function SectionCard({ icon, title, subtitle, children, heightClass }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode; heightClass?: string }) {
  return (
    <div className={`w-full rounded-[12px] border border-[#E3E3E3] bg-white p-[15px] shadow-[0_1px_1.5px_rgba(0,0,0,0.05)] ${heightClass ?? ''}`}>
      <div className="flex h-[15px] items-center gap-[7px] pb-[2px]">
        {icon}
        <p className="text-[11px] font-bold uppercase leading-none tracking-[0.66px] text-[#646464]">{title}</p>
      </div>
      <p className="mt-[4px] text-[12px] leading-[16.8px] text-[#646464]">{subtitle}</p>
      {children}
    </div>
  );
}

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <p className="text-[13px] font-bold leading-[15.5px] text-[#131313]">{label}</p>
      {children}
    </div>
  );
}

function FieldBox({ value, interactive = false, disabled = false, right, onClick }: { value: string; interactive?: boolean; disabled?: boolean; right?: ReactNode; onClick?: () => void; }) {
  return (
    <button
      type="button"
      className={`flex h-[50px] w-full items-center justify-between gap-[8px] rounded-[10px] px-[12px] text-left ${
        interactive ? 'border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF]' : 'bg-[#EEEEEE]'
      } ${disabled ? 'opacity-65' : ''}`}
      onClick={onClick}
      disabled={!onClick || disabled}
    >
      <span className="truncate text-[14px] font-medium leading-none text-[#131313]">{value}</span>
      {right}
    </button>
  );
}

function ManualStepper() {
  const steps = [
    { label: 'Datos', active: true },
    { label: 'Tipo', active: false },
    { label: 'Obs.', active: false },
    { label: 'Resumen', active: false },
  ];

  return (
    <div className="shrink-0 border-b border-[#E3E3E3] bg-white px-[14px] pb-[9px] pt-[10px]">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="relative h-[35px] w-[83px] shrink-0">
            {index < steps.length - 1 ? <div className="absolute left-[33px] top-[11px] h-[2px] w-[73px] bg-[#D1D1D1]" /> : null}
            <div className={`absolute left-[22.2px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[9px] font-bold ${step.active ? 'border-[2px] border-[#C8A064] text-[#C8A064]' : 'border-[1.5px] border-[#D1D1D1] text-[#ACACAC]'}`}>{index + 1}</div>
            <p className={`absolute top-[25px] w-full text-center text-[8px] leading-[9.6px] ${step.active ? 'font-semibold text-[#8E6E3E]' : 'text-[#ACACAC]'}`}>{step.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-[6px] h-[2px] w-full overflow-hidden rounded-[2px] bg-[#E3E3E3]">
        <div className="h-[2px] w-[10px] rounded-[2px] bg-gradient-to-r from-[#8E6E3E] to-[#C8A064]" />
      </div>
    </div>
  );
}

export function IdentificationStep({ onCancel, onNext }: IdentificationStepProps) {
  const user = useSessionStore((state) => state.user);
  const draft = useNewInspectionDraftStore();
  const flow = useNewInspectionFlowStore();
  const online = useOnlineStatus();
  const { areas, sectors, loadingAreas, loadingSectors, catalogErrorMessage } = useNewInspectionCatalogs();
  const { captureLocation, capturing, locationError } = useNewInspectionLocation();

  const areaOptions = useMemo<SelectSheetOption[]>(
    () => areas.map((area) => ({ id: area.id, label: area.name })),
    [areas],
  );

  const sectorOptions = useMemo<SelectSheetOption[]>(
    () => sectors.map((sector) => ({ id: sector.id, label: sector.name })),
    [sectors],
  );

  const dateOptions = useMemo<SelectSheetOption[]>(buildDateOptions, []);
  const inspectorName = user?.fullName ?? draft.inspectorName;
  const inspectorCompanyName = draft.inspectorCompanyName;
  const canContinue = Boolean(draft.areaId && draft.sectorId && draft.inspectionDate && draft.locationCaptured);
  const showOfflineBanner = !online || !user;

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
      <div className="h-[56px] shrink-0 bg-[#002659] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center gap-[4px] px-[4px]">
          <div className="min-w-0 flex-1 px-[4px]">
            <p className="truncate text-[14px] font-semibold leading-[17px] text-white">Identificación</p>
            <p className="mt-[1px] truncate text-[11px] leading-[14px] text-[rgba(255,255,255,0.55)]">Paso 1 de 5</p>
          </div>
          <div className="pr-[4px]">
            <div className="flex h-[20px] w-[56px] items-center justify-center rounded-[16px] bg-[#C8A064]">
              <span className="text-[10px] font-bold leading-none text-[#001E39]">GF HSE</span>
            </div>
          </div>
        </div>
      </div>

      {showOfflineBanner ? (
        <div className="flex h-[23px] shrink-0 items-center gap-[7px] border-b border-[#C8A064] bg-[#2A1A04] px-[16px] pb-[6px] pt-[5px]">
          <OfflineIcon />
          <span className="text-[11px] font-semibold leading-none text-[#C8A064]">Sin red · guardando localmente</span>
        </div>
      ) : null}

      <ManualStepper />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        <div>
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Identificación</p>
          <p className="mt-[4px] w-[329px] text-[12px] leading-[16.8px] text-[#646464]">
            Completa los datos del inspector y de la inspección antes de continuar
          </p>
        </div>

        <SectionCard icon={<HeaderIcon tone="inspector" />} title="Datos del inspector" subtitle="¿Quién está realizando esta inspección?" heightClass="mt-[12px]">
          <div className="mt-[10px] grid gap-[10px]">
            <LabeledField label="Inspector *">
              <FieldBox value={inspectorName} />
            </LabeledField>
            <LabeledField label="Empresa del inspector *">
              <FieldBox value={inspectorCompanyName} />
            </LabeledField>
          </div>
        </SectionCard>

        <SectionCard icon={<HeaderIcon tone="inspection" />} title="Datos de la inspección" subtitle="¿Dónde y cuándo se realiza esta inspección?" heightClass="mt-[12px]">
          <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
            <LabeledField label="Área *">
              <FieldBox
                value={loadingAreas ? 'Cargando...' : draft.areaName ?? '-Seleccionar-'}
                interactive
                right={<CaretDown />}
                onClick={() => flow.openPicker('area')}
              />
            </LabeledField>
            <LabeledField label="Sector *">
              <FieldBox
                value={loadingSectors ? 'Cargando...' : draft.sectorName ?? '-Seleccionar-'}
                interactive
                disabled={!draft.areaId}
                right={<CaretDown />}
                onClick={() => flow.openPicker('sector')}
              />
            </LabeledField>
          </div>

          <div className="mt-[10px]">
            <LabeledField label="Fecha de inspección *">
              <FieldBox
                value={displayDate(draft.inspectionDate)}
                interactive
                right={<CalendarIcon />}
                onClick={() => flow.openPicker('date')}
              />
            </LabeledField>
          </div>

          <div className="mt-[10px] flex items-center justify-between">
            <p className="text-[13px] font-bold leading-[15.5px] text-[#131313]">Ubicación *</p>
            <button type="button" className="flex h-[20px] w-[20px] items-center justify-center rounded-full" aria-label="Información de ubicación"><InfoIcon /></button>
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
            {capturing ? 'Capturando ubicación...' : draft.locationCaptured ? 'Ubicación capturada' : 'Capturar ubicación'}
          </button>

          {locationError ? <p className="mt-[6px] text-[11px] text-[#BD3B5B]">{locationError}</p> : null}
          {catalogErrorMessage ? <p className="mt-[6px] text-[11px] text-[#BD3B5B]">{catalogErrorMessage}</p> : null}

          <div className="mt-[8px] flex h-[50px] items-center rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] text-[14px] font-normal text-[#131313]">
            <span className="truncate">{draft.locationLabel}</span>
          </div>
          <div className="mt-[8px]">
            <MapPreview />
          </div>
          <div className="mt-[8px] flex h-[16px] items-center gap-[4px] text-[11px] leading-[14.3px] text-[#646464]">
            <span className="text-[#24588B]">↳</span>
            <span className="truncate">Arrastra el pin para ajustar la ubicación manualmente</span>
          </div>
        </SectionCard>
      </div>

      <div className="shrink-0 border-t border-[#E3E3E3] bg-white pb-[8px] pt-[10px]">
        <div className="flex w-full gap-[10px] px-[14px]">
          <button
            type="button"
            className="!flex !h-[50px] !w-auto !min-w-0 !shrink-0 !items-center !justify-center !rounded-[14px] !border-[2px] !border-[#C8A064] !bg-white !px-[20px] !text-[14px] !font-bold !text-[#C8A064]"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`!flex !h-[50px] !w-auto !min-w-0 !flex-1 !items-center !justify-center !gap-[8px] !rounded-[14px] !text-[14px] !font-bold !shadow-[0_2px_4px_rgba(200,160,100,0.25)] ${
              canContinue ? '!bg-[#C8A064] !text-white' : '!bg-[#E3E3E3] !text-[#9AA0A6] !shadow-none'
            }`}
            onClick={handleNext}
            disabled={!canContinue}
          >
            Continuar
            <ArrowRightIcon />
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" />
      </div>

      <SelectSheet
        visible={flow.activePicker === 'area'}
        title="Seleccionar área"
        subtitle="Catálogo online/cache local"
        options={areaOptions}
        selectedId={draft.areaId}
        loading={loadingAreas}
        emptyText="No hay catálogos disponibles"
        onClose={flow.closePicker}
        onSelect={selectArea}
      />

      <SelectSheet
        visible={flow.activePicker === 'sector'}
        title="Seleccionar sector"
        subtitle={draft.areaName ?? 'Selecciona un área primero'}
        options={sectorOptions}
        selectedId={draft.sectorId}
        loading={loadingSectors}
        emptyText="No hay sectores disponibles"
        onClose={flow.closePicker}
        onSelect={selectSector}
      />

      <SelectSheet
        visible={flow.activePicker === 'date'}
        title="Fecha de inspección"
        subtitle="Selecciona una fecha reciente"
        options={dateOptions}
        selectedId={draft.inspectionDate}
        loading={false}
        emptyText="Sin fechas disponibles"
        onClose={flow.closePicker}
        onSelect={selectDate}
      />
    </>
  );
}
