import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  InspectionAnswerValue,
  InspectionType,
  type InspectionChecklistItem,
  type InspectionChecklistTemplateResponse,
} from '@aurelia/contracts';
import {
  getCompanyUsers,
  getInspectionFindingSeverities,
  getInspectionFindingTypes,
  getInspectionTemplates,
  getOrganizationAreas,
  getOrganizationSectors,
  getResponsibleCompanies,
} from '../../../../shared/services/inspections.service';
import { useNewInspectionLocation } from '../hooks/useNewInspectionLocation';
import {
  type NewInspectionFindingObservationDraft,
  type NewInspectionPickedAsset,
  useNewInspectionDraftStore,
} from '../state/newInspectionDraft.store';

interface AssistantChatStepProps {
  onBack: () => void;
  onSave: () => void;
  onCancelInspection: () => void;
  saving: boolean;
  errorMessage: string | null;
}

type AssistantStage =
  | 'area'
  | 'sector'
  | 'type'
  | 'date'
  | 'location'
  | 'finding-type'
  | 'finding-condition'
  | 'finding-photo'
  | 'finding-measure'
  | 'finding-severity'
  | 'finding-next'
  | 'finding-company'
  | 'finding-people'
  | 'template'
  | 'checklist-general-photo'
  | 'checklist-question'
  | 'checklist-condition'
  | 'checklist-measure'
  | 'checklist-item-photo'
  | 'checklist-company'
  | 'checklist-people'
  | 'summary';

type ChecklistRow = InspectionChecklistItem & { index: number; sectionTitle: string };

const STEP_LABELS = ['Identificacion', 'Observacion', 'Medida y criticidad', 'Mas observaciones', 'Empresa y personal', 'Resumen', 'Completado'];
const STEP_PCT = ['14%', '28%', '42%', '57%', '71%', '86%', '100%'];

const BOT_TEXT = {
  area: 'Hola, soy AurelIA. ¿En qué área estás hoy?',
  sector: 'Selecciona el sector.',
  type: 'Selecciona el tipo de inspección.',
  date: 'Selecciona la fecha de inspección.',
  location: 'Capturemos la ubicación obligatoria.',
  findingType: 'Selecciona el tipo de hallazgo.',
  template: 'Te sugiero esta plantilla normativa.',
  chooseTemplate: 'Elige una plantilla.',
  findingCondition: 'Describe la condición detectada.',
  findingPhoto: 'Adjunta fotografía del hallazgo.',
  findingMeasure: 'Escribe o confirma la medida correctiva.',
  findingSeverity: 'Define criticidad para esta observación.',
  findingNext: '¿Deseas agregar otra observación?',
  company: 'Selecciona empresa responsable de los hallazgos.',
  people: 'Selecciona personal encargado de los hallazgos.',
  generalPhoto: 'Adjunta la foto general obligatoria.',
  checklistIntro: 'Responderemos los ítems de la plantilla seleccionada.',
  checklistCondition: 'Describe la condición detectada.',
  checklistMeasure: 'Indica la medida correctiva propuesta.',
  checklistPhoto: 'Adjunta foto para este hallazgo.',
  summary: 'Perfecto. Revisa el resumen antes de guardar.',
};

function buildDateOptions() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  });
}

function rowsOf(template: InspectionChecklistTemplateResponse | null): ChecklistRow[] {
  if (!template) return [];
  return template.sections
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((section) =>
      section.items
        .slice()
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((item) => ({ ...item, sectionTitle: section.title, index: 0 })),
    )
    .map((item, index) => ({ ...item, index }));
}

function answerLabel(value?: InspectionAnswerValue) {
  if (value === InspectionAnswerValue.COMPLIANT) return 'SÍ';
  if (value === InspectionAnswerValue.NOT_COMPLIANT) return 'NO';
  if (value === InspectionAnswerValue.NOT_APPLICABLE) return 'N/A';
  return 'Pendiente';
}

function stepIndexForStage(stage: AssistantStage) {
  if (stage === 'area' || stage === 'sector' || stage === 'type' || stage === 'date' || stage === 'location') return 0;
  if (stage === 'finding-type' || stage === 'template' || stage === 'checklist-general-photo' || stage === 'checklist-question') return 1;
  if (stage === 'finding-condition' || stage === 'finding-photo' || stage === 'checklist-condition' || stage === 'checklist-measure' || stage === 'checklist-item-photo') return 2;
  if (stage === 'finding-measure' || stage === 'finding-severity') return 2;
  if (stage === 'finding-next') return 3;
  if (stage === 'finding-company' || stage === 'finding-people' || stage === 'checklist-company' || stage === 'checklist-people') return 4;
  return 5;
}

function SparklesIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={(size * 18) / 20} viewBox="0 0 20 18" aria-hidden="true">
      <path
        d="M13.2344 2.6625C13.0938 2.71562 13 2.85 13 3C13 3.15 13.0938 3.28438 13.2344 3.3375L15 4L15.6625 5.76562C15.7156 5.90625 15.85 6 16 6C16.15 6 16.2844 5.90625 16.3375 5.76562L17 4L18.7656 3.3375C18.9062 3.28438 19 3.15 19 3C19 2.85 18.9062 2.71562 18.7656 2.6625L17 2L16.3375 0.234375C16.2844 0.09375 16.15 0 16 0C15.85 0 15.7156 0.09375 15.6625 0.234375L15 2L13.2344 2.6625ZM7.45312 3.29063C7.37187 3.1125 7.19375 3 7 3C6.80625 3 6.62813 3.1125 6.54688 3.29063L4.8875 6.88438L1.29375 8.54375C1.1125 8.62813 1 8.80625 1 9C1 9.19375 1.1125 9.37187 1.29063 9.45312L4.88438 11.1125L6.54375 14.7063C6.625 14.8844 6.80312 14.9969 6.99687 14.9969C7.19062 14.9969 7.36875 14.8844 7.45 14.7063L9.10938 11.1125L12.7031 9.45312C12.8813 9.37187 12.9937 9.19375 12.9937 9C12.9937 8.80625 12.8813 8.62813 12.7031 8.54688L9.10938 6.8875L7.45 3.29375L7.45312 3.29063ZM14 14L12.2344 14.6625C12.0938 14.7156 12 14.85 12 15C12 15.15 12.0938 15.2844 12.2344 15.3375L14 16L14.6625 17.7656C14.7156 17.9062 14.85 18 15 18C15.15 18 15.2844 17.9062 15.3375 17.7656L16 16L17.7656 15.3375C17.9062 15.2844 18 15.15 18 15C18 14.85 17.9062 14.7156 17.7656 14.6625L16 14L15.3375 12.2344C15.2844 12.0938 15.15 12 15 12C14.85 12 14.7156 12.0938 14.6625 12.2344L14 14Z"
        fill={color}
      />
    </svg>
  );
}

function EllipsisVerticalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="3" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="13" r="1.3" fill="currentColor" />
    </svg>
  );
}

function Icon({ name, color = 'currentColor', size = 12 }: { name: 'map-marker' | 'crosshairs' | 'check-circle' | 'check' | 'list' | 'search' | 'clipboard-check'; color?: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true as const };

  if (name === 'map-marker') {
    return <svg {...props}><path d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.05 3.1 6.67 4.08 7.74a.56.56 0 0 0 .84 0C9.4 12.67 12.5 9.05 12.5 6A4.5 4.5 0 0 0 8 1.5Zm0 6.1A1.6 1.6 0 1 1 8 4.4a1.6 1.6 0 0 1 0 3.2Z" fill={color} /></svg>;
  }

  if (name === 'crosshairs') {
    return <svg {...props}><circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" fill="none" /><circle cx="8" cy="8" r="1" fill={color} /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
  }

  if (name === 'check-circle') {
    return <svg {...props}><circle cx="8" cy="8" r="6.5" fill={color} /><path d="m5.3 8.1 1.8 1.8 3.6-4" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
  }

  if (name === 'check') {
    return <svg {...props}><path d="m3.5 8.2 2.3 2.3 4.7-5.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
  }

  if (name === 'list') {
    return <svg {...props}><path d="M3 4h10M3 8h10M3 12h10" stroke={color} strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }

  if (name === 'clipboard-check') {
    return <svg {...props}><path d="M5.5 2.5h5a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 12V4a1.5 1.5 0 0 1 1.5-1.5Z" stroke={color} strokeWidth="1.4" fill="none"/><path d="M6.5 2.5h3v1.4h-3z" fill={color} /><path d="m6.3 8.1 1.2 1.2 2.3-2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>;
  }

  return <svg {...props}><circle cx="7" cy="7" r="4.5" stroke={color} strokeWidth="1.5" fill="none" /><path d="m10.5 10.5 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function quickOptionIconName(label: string, icon?: string) {
  const normalizedLabel = label.toLowerCase();
  if (icon === 'clipboard-check' || normalizedLabel.includes('checklist')) return 'clipboard-check' as const;
  if (icon === 'list' || normalizedLabel.includes('otra')) return 'list' as const;
  if (icon === 'check' || normalizedLabel.includes('confirmar')) return 'check' as const;
  return 'search' as const;
}

function Chip({
  active,
  label,
  onClick,
  icon,
  variant = 'gold',
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon?: string;
  variant?: 'gold' | 'navy';
}) {
  const selectedClass = variant === 'navy'
    ? 'border-[#052B63] bg-[#052B63] text-white'
    : 'border-[#C8A064] bg-[#C8A064] text-[#052B63]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-[6px] rounded-full border-[1.5px] px-[12px] py-[6px] text-[11px] font-semibold ${
        active ? selectedClass : 'border-[#D1D1D1] bg-white text-[#646464]'
      }`}
    >
      {icon ? <span className="text-[11px]">{icon}</span> : null}
      {label}
    </button>
  );
}

function QuickOption({
  label,
  onClick,
  selected = false,
  icon,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  icon?: string;
  disabled?: boolean;
}) {
  const iconName = icon ? quickOptionIconName(label, icon) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-[6px] rounded-[9999px] border-[1.5px] px-[14px] py-[7px] text-[12px] font-semibold transition-colors disabled:opacity-60 ${selected ? 'border-[#002659] bg-[#002659] text-white' : 'border-[#D1D1D1] bg-white text-[#24588B] hover:border-[#C8A064] hover:text-[#8E6E3E]'}`}
    >
      {iconName ? <Icon name={iconName} size={10} color={selected ? '#FFFFFF' : '#24588B'} /> : null}
      {label}
    </button>
  );
}

function BotBubble({ children }: { children: ReactNode }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="mb-[10px] flex w-full items-end gap-[7px]">
      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#CAA262] text-[11px] text-[#0A2E63]"><SparklesIcon size={10} color="#001E39" /></div>
      <div className="max-w-[85%] rounded-[16px] rounded-bl-[4px] border border-[#E3E3E3] bg-white px-[12px] py-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div>{children}</div>
        <p className="mt-[6px] text-[11px] text-[#99A0AF]">{timeStr}</p>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="mb-[10px] ml-auto max-w-[78%] rounded-[16px] rounded-br-[4px] bg-[#002659] px-[12px] py-[10px]">
      <div className="font-medium">{children}</div>
      <p className="mt-[6px] text-[11px] text-[rgba(255,255,255,0.38)]">{timeStr}</p>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="mb-[10px] flex w-full items-end gap-[7px]">
      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#CAA262] text-[11px] text-[#0A2E63]"><SparklesIcon size={10} color="#001E39" /></div>
      <div className="inline-flex items-center gap-[4px] rounded-[14px] rounded-bl-[4px] border border-[#D3D7DE] bg-white px-[14px] py-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
        <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:150ms] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
        <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:300ms] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
      </div>
    </div>
  );
}

function TextResponseCard({ value, placeholder, buttonLabel, onChange, onSubmit }: {
  value: string;
  placeholder: string;
  buttonLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mb-[10px] ml-[33px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
      <textarea
        className="min-h-[82px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] py-[10px] text-[13px] text-[#131313] outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        className={`mt-[8px] h-[40px] w-full rounded-[10px] text-[13px] font-bold ${value.trim() ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function PhotoUploadCard({ label, asset, onPick }: {
  label: string;
  asset: NewInspectionPickedAsset | null | undefined;
  onPick: (asset: NewInspectionPickedAsset) => void;
}) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onPick({ name: file.name, file });
    event.target.value = '';
  }

  return (
    <div className="mb-[10px] ml-[33px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
      <label className={`flex cursor-pointer items-center rounded-[10px] border-[1.5px] px-[12px] py-[10px] ${asset ? 'border-0 bg-[#35A137] text-white' : 'min-h-[84px] border-dashed border-[#D1D1D1] bg-[#F6FAFF]'}`}>
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] ${asset ? 'bg-[rgba(255,255,255,0.24)]' : 'bg-white'} text-[16px]`}>📷</span>
        <span className="ml-[10px] flex min-w-0 flex-col">
          <span className={`truncate text-[13px] font-semibold ${asset ? 'text-white' : 'text-[#646464]'}`}>{asset?.name ?? label}</span>
          {!asset ? <span className="mt-[2px] text-[11px] text-[#B7B7B7]">Fecha, hora y GPS automaticos</span> : null}
        </span>
      </label>
    </div>
  );
}

function SavedObservationCard({ observation, index }: { observation: NewInspectionFindingObservationDraft; index: number }) {
  return (
    <div className="mb-[10px] ml-[33px] rounded-[12px] border border-[#E1E1E1] bg-white px-[12px] py-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-[7px] flex items-center gap-[7px]">
        <span className="rounded-[8px] bg-[#DDF0FF] px-[8px] py-[4px] text-[11px] font-bold text-[#1E5A92]">Obs. {index + 1}</span>
        <span className="rounded-[8px] bg-[#FFE2CF] px-[8px] py-[4px] text-[11px] font-bold text-[#5E3B24]">{observation.severityLabel ?? 'Sin criticidad'}</span>
      </div>
      <p className="text-[12px] leading-[17px] text-[#131313]">{observation.detectedCondition}</p>
      <p className="mt-[6px] text-[11px] leading-[16px] text-[#646464]">{observation.correctiveAction}</p>
      {observation.evidence ? <p className="mt-[6px] text-[11px] font-semibold text-[#35A137]">📷 {observation.evidence.name}</p> : null}
    </div>
  );
}

function PeoplePicker({ users, selectedIds, onToggle, onContinue }: {
  users: Array<{ id: string; fullName: string; position?: string | null }>;
  selectedIds: string[];
  onToggle: (userId: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="mb-[10px] ml-[33px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
      <div className="flex flex-wrap gap-[8px]">
        {users.map((user) => (
          <Chip
            key={user.id}
            active={selectedIds.includes(user.id)}
            variant="navy"
            label={user.fullName}
            onClick={() => onToggle(user.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={selectedIds.length === 0}
        className={`mt-[10px] h-[42px] w-full rounded-[10px] text-[13px] font-bold ${selectedIds.length > 0 ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'}`}
      >
        Continuar a resumen
      </button>
    </div>
  );
}

function SummaryCard({ onSave, saving, errorMessage }: { onSave: () => void; saving: boolean; errorMessage: string | null }) {
  const draft = useNewInspectionDraftStore();
  const observationsCount = draft.inspectionType === InspectionType.ENVIRONMENTAL
    ? draft.findingObservations.filter((item) => item.saved).length
    : Object.values(draft.answersByItemId).filter((value) => value === InspectionAnswerValue.NOT_COMPLIANT).length;

  return (
    <div className="mb-[10px] ml-[33px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
      <div className="grid gap-[8px] text-[12px] text-[#131313]">
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Área</span><span className="text-right">{draft.areaName ?? 'N/D'}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Sector</span><span className="text-right">{draft.sectorName ?? 'N/D'}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Tipo</span><span className="text-right">{draft.inspectionTypeLabel}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Fecha</span><span className="text-right">{draft.inspectionDate}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Registro</span><span className="text-right">{draft.findingTypeLabel ?? draft.templateName ?? 'N/D'}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Observaciones</span><span className="text-right">{observationsCount}</span></div>
        <div className="flex justify-between gap-[12px]"><span className="font-bold text-[#646464]">Responsable</span><span className="text-right">{draft.findingCompanyName ?? 'Sin hallazgos'}</span></div>
      </div>
      {errorMessage ? <p className="mt-[10px] rounded-[8px] bg-[#FFD4E0] px-[10px] py-[8px] text-[12px] font-semibold text-[#7A0E23]">{errorMessage}</p> : null}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-[12px] h-[46px] w-full rounded-[12px] bg-[#C8A064] text-[14px] font-bold text-white disabled:opacity-70"
      >
        {saving ? 'Guardando...' : 'Guardar inspección'}
      </button>
    </div>
  );
}

export function AssistantChatStep({ onBack, onSave, onCancelInspection, saving, errorMessage }: AssistantChatStepProps) {
  const draft = useNewInspectionDraftStore();
  const setArea = useNewInspectionDraftStore((state) => state.setArea);
  const setSector = useNewInspectionDraftStore((state) => state.setSector);
  const setInspectionDate = useNewInspectionDraftStore((state) => state.setInspectionDate);
  const setInspectionType = useNewInspectionDraftStore((state) => state.setInspectionType);
  const setFindingType = useNewInspectionDraftStore((state) => state.setFindingType);
  const addFindingObservation = useNewInspectionDraftStore((state) => state.addFindingObservation);
  const updateFindingObservation = useNewInspectionDraftStore((state) => state.updateFindingObservation);
  const setTemplate = useNewInspectionDraftStore((state) => state.setTemplate);
  const setAnswer = useNewInspectionDraftStore((state) => state.setAnswer);
  const setItemDetail = useNewInspectionDraftStore((state) => state.setItemDetail);
  const setGeneralPhoto = useNewInspectionDraftStore((state) => state.setGeneralPhoto);
  const setFindingCompany = useNewInspectionDraftStore((state) => state.setFindingCompany);
  const setFindingResponsibles = useNewInspectionDraftStore((state) => state.setFindingResponsibles);

  const [stage, setStage] = useState<AssistantStage>('area');
  const [confirmedAreaId, setConfirmedAreaId] = useState<string | null>(null);
  const [confirmedAreaName, setConfirmedAreaName] = useState<string | null>(null);
  const [confirmedSectorId, setConfirmedSectorId] = useState<string | null>(null);
  const [confirmedSectorName, setConfirmedSectorName] = useState<string | null>(null);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [selectedType, setSelectedType] = useState<InspectionType | null>(null);
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string | null>(null);
  const [confirmedFindingTypeId, setConfirmedFindingTypeId] = useState<string | null>(null);
  const [confirmedFindingTypeLabel, setConfirmedFindingTypeLabel] = useState<string | null>(null);
  const [confirmedTemplateId, setConfirmedTemplateId] = useState<string | null>(null);
  const [confirmedTemplateLabel, setConfirmedTemplateLabel] = useState<string | null>(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [activeObservationId, setActiveObservationId] = useState<string | null>(null);
  const [activeChecklistIndex, setActiveChecklistIndex] = useState(0);
  const previousStageRef = useRef<AssistantStage>('area');
  const { captureLocation, capturing, locationError } = useNewInspectionLocation();

  const areasQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'areas'],
    queryFn: getOrganizationAreas,
  });

  const sectorsQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'sectors', draft.areaId],
    queryFn: () => getOrganizationSectors(draft.areaId),
    enabled: Boolean(draft.areaId),
  });

  const templatesQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'templates'],
    queryFn: getInspectionTemplates,
  });

  const findingTypesQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'finding-types'],
    queryFn: getInspectionFindingTypes,
  });

  const severitiesQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'finding-severities'],
    queryFn: getInspectionFindingSeverities,
  });

  const companiesQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'companies'],
    queryFn: getResponsibleCompanies,
    enabled: stage === 'finding-company' || stage === 'checklist-company' || stage === 'finding-people' || stage === 'checklist-people' || stage === 'summary',
  });

  const usersByCompanyQuery = useQuery({
    queryKey: ['inspections', 'assistant-chat', 'company-users', draft.findingCompanyId],
    queryFn: () => getCompanyUsers(draft.findingCompanyId ?? ''),
    enabled: Boolean(draft.findingCompanyId) && (stage === 'finding-people' || stage === 'checklist-people' || stage === 'summary'),
  });

  const dateOptions = useMemo(buildDateOptions, []);
  const areas = areasQuery.data ?? [];
  const sectors = sectorsQuery.data ?? [];
  const findingTypes = findingTypesQuery.data ?? [];
  const severities = severitiesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const users = usersByCompanyQuery.data ?? [];
  const activeTemplate = useMemo(
    () => (templatesQuery.data ?? []).find((item) => item.id === confirmedTemplateId) ?? null,
    [confirmedTemplateId, templatesQuery.data],
  );
  const checklistRows = useMemo(() => rowsOf(activeTemplate), [activeTemplate]);
  const activeChecklistRow = checklistRows[activeChecklistIndex] ?? null;
  const activeObservation = draft.findingObservations.find((item) => item.id === activeObservationId) ?? null;
  const savedFindingObservations = draft.findingObservations.filter((item) => item.saved);
  const checklistHasFindings = checklistRows.some((row) => draft.answersByItemId[row.id] === InspectionAnswerValue.NOT_COMPLIANT);
  const safeStepIndex = stepIndexForStage(stage);

  useEffect(() => {
    if (stage === previousStageRef.current) return;
    previousStageRef.current = stage;
    setShowTyping(true);
    const timer = setTimeout(() => setShowTyping(false), 260);
    return () => clearTimeout(timer);
  }, [stage]);

  function selectAreaOption(id: string, name: string) {
    setArea(id, name);
    setConfirmedAreaId(id);
    setConfirmedAreaName(name);
    setConfirmedSectorId(null);
    setConfirmedSectorName(null);
    setStage('sector');
  }

  function selectSectorOption(id: string, name: string) {
    setSector(id, name);
    setConfirmedSectorId(id);
    setConfirmedSectorName(name);
    setStage('type');
  }

  function selectInspectionTypeOption(type: InspectionType, label: string) {
    setInspectionType(type, label);
    setSelectedType(type);
    setSelectedTypeLabel(label);
    setConfirmedFindingTypeId(null);
    setConfirmedFindingTypeLabel(null);
    setConfirmedTemplateId(null);
    setConfirmedTemplateLabel(null);
    setShowAllTemplates(false);
    setStage('date');
  }

  function selectDateOption(value: string) {
    setInspectionDate(value);
    setConfirmedDate(value);
    setStage('location');
  }

  async function handleCaptureLocation() {
    const ok = await captureLocation();
    if (!ok) return;
    setLocationConfirmed(true);
    setStage(selectedType === InspectionType.ENVIRONMENTAL ? 'finding-type' : 'template');
  }

  function selectFindingTypeOption(id: string, label: string) {
    setFindingType(id, label);
    setConfirmedFindingTypeId(id);
    setConfirmedFindingTypeLabel(label);
    const observationId = addFindingObservation();
    setActiveObservationId(observationId);
    setTextInput('');
    setStage('finding-condition');
  }

  function selectTemplateOption(input: { id: string; name: string; code: string; itemsCount: number }) {
    setTemplate(input);
    setConfirmedTemplateId(input.id);
    setConfirmedTemplateLabel(input.name);
    setTextInput('');
    setActiveChecklistIndex(0);
    setStage('checklist-general-photo');
  }

  function submitFindingCondition() {
    if (!activeObservationId || !textInput.trim()) return;
    updateFindingObservation(activeObservationId, { detectedCondition: textInput.trim() });
    setTextInput('');
    setStage('finding-photo');
  }

  function submitFindingPhoto(asset: NewInspectionPickedAsset) {
    if (!activeObservationId) return;
    updateFindingObservation(activeObservationId, { evidence: asset });
    setStage('finding-measure');
  }

  function submitFindingMeasure() {
    if (!activeObservationId || !textInput.trim()) return;
    updateFindingObservation(activeObservationId, { correctiveAction: textInput.trim() });
    setTextInput('');
    setStage('finding-severity');
  }

  function selectFindingSeverity(id: string, label: string, closureTimeLabel: string | null) {
    if (!activeObservationId) return;
    updateFindingObservation(activeObservationId, {
      severityId: id,
      severityLabel: label,
      severityClosureTimeLabel: closureTimeLabel,
      saved: true,
    });
    setActiveObservationId(null);
    setStage('finding-next');
  }

  function addAnotherFindingObservation() {
    const observationId = addFindingObservation();
    setActiveObservationId(observationId);
    setTextInput('');
    setStage('finding-condition');
  }

  function continueFindingToCompany() {
    if (savedFindingObservations.length === 0) return;
    setStage('finding-company');
  }

  function submitChecklistGeneralPhoto(asset: NewInspectionPickedAsset) {
    setGeneralPhoto(asset);
    setActiveChecklistIndex(0);
    setStage('checklist-question');
  }

  function advanceChecklistAfter(index: number) {
    const nextIndex = index + 1;
    if (checklistRows[nextIndex]) {
      setActiveChecklistIndex(nextIndex);
      setStage('checklist-question');
      return;
    }
    setStage(checklistHasFindings ? 'checklist-company' : 'summary');
  }

  function answerChecklistItem(row: ChecklistRow, value: InspectionAnswerValue) {
    setAnswer(row.id, value);
    if (value === InspectionAnswerValue.NOT_COMPLIANT) {
      setTextInput('');
      setStage('checklist-condition');
      return;
    }
    advanceChecklistAfter(row.index);
  }

  function submitChecklistCondition() {
    if (!activeChecklistRow || !textInput.trim()) return;
    setItemDetail(activeChecklistRow.id, { detectedCondition: textInput.trim() });
    setTextInput('');
    setStage('checklist-measure');
  }

  function submitChecklistMeasure() {
    if (!activeChecklistRow || !textInput.trim()) return;
    setItemDetail(activeChecklistRow.id, { correctiveAction: textInput.trim() });
    setTextInput('');
    setStage('checklist-item-photo');
  }

  function submitChecklistItemPhoto(asset: NewInspectionPickedAsset) {
    if (!activeChecklistRow) return;
    setItemDetail(activeChecklistRow.id, { evidence: asset });
    advanceChecklistAfter(activeChecklistRow.index);
  }

  function selectCompanyOption(id: string, name: string) {
    setFindingCompany(id, name);
    setStage(selectedType === InspectionType.ENVIRONMENTAL ? 'finding-people' : 'checklist-people');
  }

  function toggleResponsible(userId: string) {
    const next = draft.findingResponsibleIds.includes(userId)
      ? draft.findingResponsibleIds.filter((id) => id !== userId)
      : [...draft.findingResponsibleIds, userId];
    setFindingResponsibles(next);
  }

  function continueToSummary() {
    if (draft.findingResponsibleIds.length === 0) return;
    setStage('summary');
  }

  return (
    <>
      <div className="bg-[#002659] pt-[0px] text-white">
        <div className="flex h-[56px] items-center justify-between gap-[8px] px-[8px]">
          <div className="flex flex-1 items-center gap-[8px] pl-[8px]">
            <div className="relative">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#C8A064] text-[16px] text-[#001E39]"><SparklesIcon size={28} color="#001E39" /></div>
              <div className="absolute bottom-[1px] right-[1px] h-[10px] w-[10px] rounded-full border-[2px] border-[#002659] bg-[#00B398]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">AurelIA</p>
              <div className="mt-[1px] flex items-center gap-[4px]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#00B398]" />
                <p className="text-[12px] text-[rgba(255,255,255,0.55)]">Activo</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={onCancelInspection} className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-[15px] text-[rgba(255,255,255,0.6)]">
            <EllipsisVerticalIcon />
          </button>
        </div>
        <div className="border-b border-[rgba(255,255,255,0.06)] px-[16px] pb-[7px]">
          <div className="mb-[5px] flex gap-[3px]">
            {STEP_LABELS.map((_, index) => {
              const dotClass = index < safeStepIndex
                ? 'bg-[#C8A064]'
                : index === safeStepIndex
                  ? 'bg-[rgba(200,160,100,0.5)]'
                  : 'bg-[rgba(255,255,255,0.22)]';
              return <div key={`assistant-step-dot-${index}`} className={`h-[3px] flex-1 rounded ${dotClass}`} />;
            })}
          </div>
          <div className="flex items-center justify-between text-white">
            <p className="text-[10px] text-[rgba(255,255,255,0.45)]"><span className="font-semibold text-[rgba(255,255,255,0.7)]">Paso {safeStepIndex + 1} · {STEP_LABELS[safeStepIndex]}</span></p>
            <p className="text-[10px] text-[rgba(255,255,255,0.45)]">{STEP_PCT[safeStepIndex]}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#D1D4DA] px-[10px] pb-[16px] pt-[12px]">
        {showTyping ? <TypingBubble /> : null}

        <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.area}</p></BotBubble>
        {stage === 'area' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {areasQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando áreas...</p> : null}
            {areasQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar áreas.</p> : null}
            {areas.map((area) => <Chip key={area.id} active={area.id === confirmedAreaId} label={area.name} onClick={() => selectAreaOption(area.id, area.name)} />)}
          </div>
        ) : null}

        {confirmedAreaName ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{confirmedAreaName}</p></UserBubble> : null}

        {confirmedAreaId ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.sector}</p></BotBubble> : null}
        {stage === 'sector' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {sectorsQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando sectores...</p> : null}
            {sectorsQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar sectores.</p> : null}
            {sectors.map((sector) => <Chip key={sector.id} active={sector.id === confirmedSectorId} label={sector.name} onClick={() => selectSectorOption(sector.id, sector.name)} />)}
          </div>
        ) : null}

        {confirmedSectorName ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{confirmedSectorName}</p></UserBubble> : null}

        {confirmedSectorId ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.type}</p></BotBubble> : null}
        {stage === 'type' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
            <QuickOption label="Hallazgo" icon="search" onClick={() => selectInspectionTypeOption(InspectionType.ENVIRONMENTAL, 'Hallazgo')} selected={selectedType === InspectionType.ENVIRONMENTAL} />
            <QuickOption label="Checklist normativo" icon="clipboard-check" onClick={() => selectInspectionTypeOption(InspectionType.REGULATORY, 'Checklist normativo')} selected={selectedType === InspectionType.REGULATORY} />
          </div>
        ) : null}

        {selectedTypeLabel ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{selectedTypeLabel}</p></UserBubble> : null}

        {selectedType ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.date}</p></BotBubble> : null}
        {stage === 'date' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {dateOptions.map((dateValue) => <Chip key={dateValue} active={confirmedDate === dateValue} label={dateValue} variant="navy" onClick={() => selectDateOption(dateValue)} />)}
          </div>
        ) : null}

        {confirmedDate ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{confirmedDate}</p></UserBubble> : null}

        {confirmedDate ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.location}</p></BotBubble> : null}
        {stage === 'location' ? (
          <div className="mb-[10px] ml-[33px] mr-[12px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
            <div className="flex items-center gap-[8px]"><Icon name="map-marker" size={13} color="#006153" /><p className="text-[12px] font-bold text-[#131313]">Ubicación de la inspección</p></div>
            <p className="mt-[8px] text-[11px] leading-[17px] text-[#646464]">La ubicación es obligatoria para continuar.</p>
            <button
              type="button"
              className={`mt-[8px] flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[10px] text-[12px] font-bold text-white ${locationConfirmed ? 'bg-[#3A9B3A]' : 'bg-[#C8A064]'}`}
              onClick={() => { void handleCaptureLocation(); }}
              disabled={capturing}
            >
              <Icon name={locationConfirmed ? 'check-circle' : 'crosshairs'} size={14} color="#FFFFFF" />
              {capturing ? 'Capturando ubicación...' : locationConfirmed ? 'Ubicación capturada' : 'Capturar ubicación'}
            </button>
            <div className="mt-[8px] rounded-[8px] border border-[#E3E3E3] bg-[#F4F6F9] px-[12px] py-[8px]">
              <p className="text-[11px] font-semibold text-[#131313]">{draft.locationLabel}</p>
              <p className="mt-[2px] text-[10px] text-[#646464]">{draft.locationAccuracyLabel}</p>
            </div>
            {locationError ? <p className="mt-[6px] text-[11px] text-[#BD3B5B]">{locationError}</p> : null}
          </div>
        ) : null}

        {locationConfirmed ? <UserBubble><p className="text-[13px] leading-[18px] text-white">Ubicación capturada · {draft.locationAccuracyLabel}</p></UserBubble> : null}

        {selectedType === InspectionType.ENVIRONMENTAL && locationConfirmed ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingType}</p></BotBubble> : null}
        {stage === 'finding-type' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {findingTypesQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando tipos de hallazgo...</p> : null}
            {findingTypesQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar tipos de hallazgo.</p> : null}
            {findingTypes.map((item) => <Chip key={item.id} active={draft.findingTypeId === item.id} variant="navy" label={item.name} onClick={() => selectFindingTypeOption(item.id, item.name)} />)}
          </div>
        ) : null}
        {confirmedFindingTypeLabel ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{confirmedFindingTypeLabel}</p></UserBubble> : null}

        {savedFindingObservations.map((observation, index) => <SavedObservationCard key={observation.id} observation={observation} index={index} />)}

        {activeObservation && (stage === 'finding-condition' || activeObservation.detectedCondition) ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingCondition}</p></BotBubble> : null}
        {stage === 'finding-condition' ? <TextResponseCard value={textInput} placeholder="Describe la condición subestandar..." buttonLabel="Registrar condición" onChange={setTextInput} onSubmit={submitFindingCondition} /> : null}
        {activeObservation?.detectedCondition ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{activeObservation.detectedCondition}</p></UserBubble> : null}

        {activeObservation && (stage === 'finding-photo' || activeObservation.evidence) ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingPhoto}</p></BotBubble> : null}
        {stage === 'finding-photo' ? <PhotoUploadCard label="Tomar foto o galeria" asset={activeObservation?.evidence} onPick={submitFindingPhoto} /> : null}
        {activeObservation?.evidence ? <UserBubble><p className="text-[13px] leading-[18px] text-white">Foto del hallazgo registrada · {activeObservation.evidence.name}</p></UserBubble> : null}

        {activeObservation && (stage === 'finding-measure' || activeObservation.correctiveAction) ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingMeasure}</p></BotBubble> : null}
        {stage === 'finding-measure' ? <TextResponseCard value={textInput} placeholder="Que debe hacer la EECC..." buttonLabel="Registrar medida" onChange={setTextInput} onSubmit={submitFindingMeasure} /> : null}
        {activeObservation?.correctiveAction ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{activeObservation.correctiveAction}</p></UserBubble> : null}

        {activeObservation && stage === 'finding-severity' ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingSeverity}</p></BotBubble> : null}
        {stage === 'finding-severity' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {severitiesQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando criticidades...</p> : null}
            {severities.map((severity) => <Chip key={severity.id} active={activeObservation?.severityId === severity.id} variant="navy" label={severity.name} onClick={() => selectFindingSeverity(severity.id, severity.name, severity.description ?? null)} />)}
          </div>
        ) : null}

        {stage === 'finding-next' ? (
          <>
            <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingNext}</p></BotBubble>
            <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
              <QuickOption label="Agregar otra observación" icon="list" onClick={addAnotherFindingObservation} />
              <QuickOption label="Continuar con responsables" icon="check" onClick={continueFindingToCompany} />
            </div>
          </>
        ) : null}

        {selectedType === InspectionType.REGULATORY && locationConfirmed ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.template}</p>
            {stage === 'template' && templatesQuery.isLoading ? <p className="mt-[8px] text-[12px] text-[#646464]">Cargando plantillas...</p> : null}
            {stage === 'template' && templatesQuery.isError ? <p className="mt-[8px] text-[12px] text-[#BD3B5B]">No pude cargar plantillas normativas.</p> : null}
          </BotBubble>
        ) : null}

        {stage === 'template' && !templatesQuery.isLoading && !templatesQuery.isError ? (
          (() => {
            const allTemplates = templatesQuery.data ?? [];
            const suggested = allTemplates[0];
            if (!suggested) return <p className="mb-[8px] ml-[33px] text-[12px] text-[#646464]">No hay plantillas disponibles.</p>;
            const suggestedItems = suggested.sections.reduce((total, section) => total + section.items.length, 0);
            return (
              <>
                <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
                  <QuickOption label={`Confirmar ${suggested.name}`} onClick={() => selectTemplateOption({ id: suggested.id, name: suggested.name, code: suggested.code, itemsCount: suggestedItems })} selected={draft.templateId === suggested.id} icon="check" />
                  <QuickOption label="Elegir otra" onClick={() => setShowAllTemplates(true)} selected={false} icon="list" />
                </div>
                {showAllTemplates ? (
                  <>
                    <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.chooseTemplate}</p></BotBubble>
                    <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
                      {allTemplates.map((template) => {
                        const itemsCount = template.sections.reduce((total, section) => total + section.items.length, 0);
                        return <Chip key={template.id} active={draft.templateId === template.id} variant="navy" label={`${template.name} (${itemsCount})`} onClick={() => selectTemplateOption({ id: template.id, name: template.name, code: template.code, itemsCount })} />;
                      })}
                    </div>
                  </>
                ) : null}
              </>
            );
          })()
        ) : null}

        {confirmedTemplateLabel ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{confirmedTemplateLabel}</p></UserBubble> : null}

        {confirmedTemplateId ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.generalPhoto}</p></BotBubble> : null}
        {stage === 'checklist-general-photo' ? <PhotoUploadCard label="Tomar foto o galeria" asset={draft.generalPhoto} onPick={submitChecklistGeneralPhoto} /> : null}
        {draft.generalPhoto ? <UserBubble><p className="text-[13px] leading-[18px] text-white">Foto general registrada · {draft.generalPhoto.name}</p></UserBubble> : null}

        {draft.generalPhoto && checklistRows.length > 0 ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.checklistIntro}</p></BotBubble> : null}
        {checklistRows.slice(0, activeChecklistIndex).map((row) => (
          <div key={`answered-${row.id}`}>
            <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{row.code}: {row.question}</p></BotBubble>
            <UserBubble><p className="text-[13px] leading-[18px] text-white">{row.code}: {answerLabel(draft.answersByItemId[row.id])}</p></UserBubble>
          </div>
        ))}

        {stage === 'checklist-question' && activeChecklistRow ? (
          <>
            <BotBubble>
              <p className="text-[13px] font-semibold leading-[18px] text-[#131313]">{activeChecklistRow.code}: {activeChecklistRow.question}</p>
              <p className="mt-[4px] text-[11px] leading-[15px] text-[#646464]">{activeChecklistRow.sectionTitle}</p>
            </BotBubble>
            <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
              <QuickOption label="SÍ" onClick={() => answerChecklistItem(activeChecklistRow, InspectionAnswerValue.COMPLIANT)} />
              <QuickOption label="NO" onClick={() => answerChecklistItem(activeChecklistRow, InspectionAnswerValue.NOT_COMPLIANT)} />
              <QuickOption label="N/A" onClick={() => answerChecklistItem(activeChecklistRow, InspectionAnswerValue.NOT_APPLICABLE)} />
            </div>
          </>
        ) : null}

        {activeChecklistRow && draft.answersByItemId[activeChecklistRow.id] ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{activeChecklistRow.code}: {answerLabel(draft.answersByItemId[activeChecklistRow.id])}</p></UserBubble> : null}

        {stage === 'checklist-condition' ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.checklistCondition}</p></BotBubble> : null}
        {stage === 'checklist-condition' ? <TextResponseCard value={textInput} placeholder="Describe la condición detectada..." buttonLabel="Registrar condición" onChange={setTextInput} onSubmit={submitChecklistCondition} /> : null}
        {stage === 'checklist-measure' ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.checklistMeasure}</p></BotBubble> : null}
        {stage === 'checklist-measure' ? <TextResponseCard value={textInput} placeholder="Indica la medida correctiva propuesta..." buttonLabel="Registrar medida" onChange={setTextInput} onSubmit={submitChecklistMeasure} /> : null}
        {stage === 'checklist-item-photo' ? <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.checklistPhoto}</p></BotBubble> : null}
        {stage === 'checklist-item-photo' ? <PhotoUploadCard label="Tomar foto o galeria" asset={activeChecklistRow ? draft.detailsByItemId[activeChecklistRow.id]?.evidence : null} onPick={submitChecklistItemPhoto} /> : null}

        {(stage === 'finding-company' || stage === 'checklist-company') ? (
          <>
            <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.company}</p></BotBubble>
            <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
              {companiesQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando empresas...</p> : null}
              {companiesQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar empresas.</p> : null}
              {companies.map((company) => <Chip key={company.id} active={draft.findingCompanyId === company.id} variant="navy" label={company.name} onClick={() => selectCompanyOption(company.id, company.name)} />)}
            </div>
          </>
        ) : null}

        {draft.findingCompanyName ? <UserBubble><p className="text-[13px] leading-[18px] text-white">{draft.findingCompanyName}</p></UserBubble> : null}

        {(stage === 'finding-people' || stage === 'checklist-people') ? (
          <>
            <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.people}</p></BotBubble>
            {usersByCompanyQuery.isLoading ? <p className="mb-[10px] ml-[33px] text-[12px] text-[#646464]">Cargando responsables...</p> : null}
            {usersByCompanyQuery.isError ? <p className="mb-[10px] ml-[33px] text-[12px] text-[#BD3B5B]">No pude cargar responsables.</p> : null}
            {!usersByCompanyQuery.isLoading && !usersByCompanyQuery.isError ? <PeoplePicker users={users} selectedIds={draft.findingResponsibleIds} onToggle={toggleResponsible} onContinue={continueToSummary} /> : null}
          </>
        ) : null}

        {stage === 'summary' ? (
          <>
            <BotBubble><p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.summary}</p></BotBubble>
            <SummaryCard onSave={onSave} saving={saving} errorMessage={errorMessage} />
          </>
        ) : null}
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[20px] text-[14px] font-bold text-[#C8A064]"
            onClick={onBack}
          >
            ←
          </button>
          <div className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] bg-[#F6FAFF] px-[12px] text-center text-[12px] font-semibold leading-[16px] text-[#646464]">
            El flujo continúa dentro del chat
          </div>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
