import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InspectionType } from '@aurelia/contracts';
import {
  getOrganizationAreas,
  getOrganizationSectors,
  getInspectionFindingTypes,
  getInspectionTemplates,
} from '../../../../shared/services/inspections.service';
import { useNewInspectionLocation } from '../hooks/useNewInspectionLocation';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';

interface AssistantChatStepProps {
  onBack: () => void;
  onContinueWizard: () => void;
  onCancelInspection: () => void;
}

type AssistantStage = 'area' | 'sector' | 'type' | 'date' | 'location' | 'finding-type' | 'template' | 'ready';
const STAGE_ORDER: AssistantStage[] = ['area', 'sector', 'type', 'date', 'location', 'finding-type', 'template', 'ready'];

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
  ready: 'Perfecto. Continuemos.',
};

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
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  icon?: string;
}) {
  const iconName = icon ? quickOptionIconName(label, icon) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-[6px] rounded-[9999px] border-[1.5px] px-[14px] py-[7px] text-[12px] font-semibold transition-colors ${selected ? 'border-[#002659] bg-[#002659] text-white' : 'border-[#D1D1D1] bg-white text-[#24588B] hover:border-[#C8A064] hover:text-[#8E6E3E]'}`}
    >
      {iconName ? <Icon name={iconName} size={10} color={selected ? '#FFFFFF' : '#24588B'} /> : null}
      {label}
    </button>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
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

function UserBubble({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="mb-[10px] ml-auto max-w-[78%] rounded-[16px] rounded-br-[4px] bg-[#002659] px-[12px] py-[10px]">
      <div className="font-medium">{children}</div>
      <p className="mt-[6px] text-[11px] text-[rgba(255,255,255,0.38)]">{timeStr}</p>
    </div>
  );
}

export function AssistantChatStep({ onBack, onContinueWizard, onCancelInspection }: AssistantChatStepProps) {
  const draft = useNewInspectionDraftStore();
  const setArea = useNewInspectionDraftStore((state) => state.setArea);
  const setSector = useNewInspectionDraftStore((state) => state.setSector);
  const setInspectionDate = useNewInspectionDraftStore((state) => state.setInspectionDate);
  const setInspectionType = useNewInspectionDraftStore((state) => state.setInspectionType);
  const setFindingType = useNewInspectionDraftStore((state) => state.setFindingType);
  const setTemplate = useNewInspectionDraftStore((state) => state.setTemplate);

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

  const dateOptions = useMemo(buildDateOptions, []);
  const areas = areasQuery.data ?? [];
  const sectors = sectorsQuery.data ?? [];
  const findingTypes = findingTypesQuery.data ?? [];

  const currentStage: AssistantStage = useMemo(() => {
    if (!confirmedAreaId) return 'area';
    if (!confirmedSectorId) return 'sector';
    if (!selectedType) return 'type';
    if (!confirmedDate) return 'date';
    if (!locationConfirmed) return 'location';
    if (selectedType === InspectionType.ENVIRONMENTAL && !confirmedFindingTypeId) return 'finding-type';
    if (selectedType === InspectionType.REGULATORY && !confirmedTemplateId) return 'template';
    return 'ready';
  }, [
    confirmedAreaId,
    confirmedDate,
    confirmedFindingTypeId,
    confirmedSectorId,
    confirmedTemplateId,
    locationConfirmed,
    selectedType,
  ]);

  const pathReady =
    selectedType === InspectionType.ENVIRONMENTAL
      ? Boolean(confirmedFindingTypeId)
      : selectedType === InspectionType.REGULATORY
        ? Boolean(confirmedTemplateId)
        : false;

  const canStart = Boolean(
    confirmedAreaId &&
      confirmedSectorId &&
      confirmedDate &&
      locationConfirmed &&
      selectedType &&
      pathReady,
  );

  const safeStepIndex = useMemo(() => {
    if (currentStage === 'area' || currentStage === 'sector' || currentStage === 'date' || currentStage === 'location' || currentStage === 'type') return 0;
    if (currentStage === 'finding-type' || currentStage === 'template') return 1;
    return 5;
  }, [currentStage]);

  const currentStageIndex = useMemo(() => STAGE_ORDER.indexOf(currentStage), [currentStage]);

  function reached(stage: AssistantStage) {
    return currentStageIndex >= STAGE_ORDER.indexOf(stage);
  }

  const shouldShowTypingForStage = currentStage === 'sector' || currentStage === 'type' || currentStage === 'finding-type' || currentStage === 'template';

  useEffect(() => {
    if (currentStage === previousStageRef.current) return;
    previousStageRef.current = currentStage;
    if (!shouldShowTypingForStage) {
      setShowTyping(false);
      return;
    }
    setShowTyping(true);
    const timer = setTimeout(() => setShowTyping(false), 320);
    return () => clearTimeout(timer);
  }, [currentStage, shouldShowTypingForStage]);

  function selectAreaOption(id: string, name: string) {
    setArea(id, name);
    setConfirmedAreaId(id);
    setConfirmedAreaName(name);
    setConfirmedSectorId(null);
    setConfirmedSectorName(null);
  }

  function selectSectorOption(id: string, name: string) {
    setSector(id, name);
    setConfirmedSectorId(id);
    setConfirmedSectorName(name);
  }

  function selectDateOption(value: string) {
    setInspectionDate(value);
    setConfirmedDate(value);
  }

  async function handleCaptureLocation() {
    const ok = await captureLocation();
    if (ok) setLocationConfirmed(true);
  }

  function selectInspectionType(type: InspectionType, label: string) {
    setInspectionType(type, label);
    setSelectedType(type);
    setSelectedTypeLabel(label);
    setConfirmedFindingTypeId(null);
    setConfirmedFindingTypeLabel(null);
    setConfirmedTemplateId(null);
    setConfirmedTemplateLabel(null);
    setShowAllTemplates(false);
  }

  function selectFindingTypeOption(id: string, label: string) {
    setFindingType(id, label);
    setConfirmedFindingTypeId(id);
    setConfirmedFindingTypeLabel(label);
  }

  function selectTemplateOption(input: { id: string; name: string; code: string; itemsCount: number }) {
    setTemplate(input);
    setConfirmedTemplateId(input.id);
    setConfirmedTemplateLabel(input.name);
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
        {showTyping ? (
          <div className="mb-[10px] flex w-full items-end gap-[7px]">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#CAA262] text-[11px] text-[#0A2E63]"><SparklesIcon size={10} color="#001E39" /></div>
            <div className="inline-flex items-center gap-[4px] rounded-[14px] rounded-bl-[4px] border border-[#D3D7DE] bg-white px-[14px] py-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
              <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:150ms] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
              <span className="inline-block h-[6px] w-[6px] animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:300ms] [animation-duration:780ms] [animation-timing-function:ease-in-out]" />
            </div>
          </div>
        ) : null}

        {reached('area') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.area}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'area' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {areasQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando áreas...</p> : null}
            {areasQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar áreas.</p> : null}
            {areas.map((area) => {
              const active = area.id === confirmedAreaId;
              return (
                <Chip
                  key={area.id}
                  active={active}
                  label={area.name}
                  onClick={() => selectAreaOption(area.id, area.name)}
                />
              );
            })}
          </div>
        ) : null}

        {confirmedAreaName ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">{confirmedAreaName}</p>
          </UserBubble>
        ) : null}

        {reached('sector') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.sector}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'sector' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {sectorsQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando sectores...</p> : null}
            {sectorsQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar sectores.</p> : null}
            {sectors.map((sector) => {
              const active = sector.id === confirmedSectorId;
              return (
                <Chip key={sector.id} active={active} label={sector.name} onClick={() => selectSectorOption(sector.id, sector.name)} />
              );
            })}
          </div>
        ) : null}

        {confirmedSectorName ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">{confirmedSectorName}</p>
          </UserBubble>
        ) : null}

        {reached('type') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.type}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'type' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
            <QuickOption
              label="Hallazgo"
              icon="search"
              onClick={() => selectInspectionType(InspectionType.ENVIRONMENTAL, 'Hallazgo')}
              selected={selectedType === InspectionType.ENVIRONMENTAL}
            />
            <QuickOption
              label="Checklist normativo"
              icon="clipboard-check"
              onClick={() => selectInspectionType(InspectionType.REGULATORY, 'Checklist normativo')}
              selected={selectedType === InspectionType.REGULATORY}
            />
          </div>
        ) : null}

        {selectedTypeLabel ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">{selectedTypeLabel}</p>
          </UserBubble>
        ) : null}

        {reached('date') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.date}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'date' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {dateOptions.map((dateValue) => (
              <Chip
                key={dateValue}
                active={confirmedDate === dateValue}
                label={dateValue}
                variant="navy"
                onClick={() => selectDateOption(dateValue)}
              />
            ))}
          </div>
        ) : null}

        {confirmedDate ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">{confirmedDate}</p>
          </UserBubble>
        ) : null}

        {reached('location') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.location}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'location' ? (
          <div className="mb-[10px] ml-[33px] mr-[12px] rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
            <div className="flex items-center gap-[8px]">
              <Icon name="map-marker" size={13} color="#006153" />
              <p className="text-[12px] font-bold text-[#131313]">Ubicación de la inspección</p>
            </div>
            <p className="mt-[8px] text-[11px] leading-[17px] text-[#646464]">La ubicación es obligatoria para Checklist normativo.</p>
            <button
              type="button"
              className={`mt-[8px] flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[10px] text-[12px] font-bold text-white ${
                locationConfirmed ? 'bg-[#3A9B3A]' : 'bg-[#C8A064]'
              }`}
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

        {locationConfirmed ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">Ubicación capturada · {draft.locationAccuracyLabel}</p>
          </UserBubble>
        ) : null}

        {selectedType === InspectionType.ENVIRONMENTAL && reached('finding-type') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.findingType}</p>
          </BotBubble>
        ) : null}

        {currentStage === 'finding-type' ? (
          <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
            {findingTypesQuery.isLoading ? <p className="text-[12px] text-[#646464]">Cargando tipos de hallazgo...</p> : null}
            {findingTypesQuery.isError ? <p className="text-[12px] text-[#BD3B5B]">No pude cargar tipos de hallazgo.</p> : null}
            {findingTypes.map((item) => {
              const active = draft.findingTypeId === item.id;
              return (
                <Chip key={item.id} active={active} variant="navy" label={item.name} onClick={() => selectFindingTypeOption(item.id, item.name)} />
              );
            })}
          </div>
        ) : null}

        {confirmedFindingTypeLabel ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">
              {confirmedFindingTypeLabel}
            </p>
          </UserBubble>
        ) : null}

        {selectedType === InspectionType.REGULATORY && reached('template') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.template}</p>
            {currentStage === 'template' ? <>{templatesQuery.isLoading ? <p className="mt-[8px] text-[12px] text-[#646464]">Cargando plantillas...</p> : null}</> : null}
            {currentStage === 'template' ? <>{templatesQuery.isError ? <p className="mt-[8px] text-[12px] text-[#BD3B5B]">No pude cargar plantillas normativas.</p> : null}</> : null}
          </BotBubble>
        ) : null}

        {currentStage === 'template' && !templatesQuery.isLoading && !templatesQuery.isError ? (
          (() => {
            const allTemplates = templatesQuery.data ?? [];
            const suggested = allTemplates[0];
            if (!suggested) return <p className="mb-[8px] ml-[33px] text-[12px] text-[#646464]">No hay plantillas disponibles.</p>;

            const suggestedItems = suggested.sections.reduce((total, section) => total + section.items.length, 0);

            return (
              <>
                    <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[6px]">
                  <QuickOption
                    label={`Confirmar ${suggested.name}`}
                    onClick={() => selectTemplateOption({ id: suggested.id, name: suggested.name, code: suggested.code, itemsCount: suggestedItems })}
                    selected={draft.templateId === suggested.id}
                    icon="check"
                  />
                  <QuickOption
                    label="Elegir otra"
                    onClick={() => setShowAllTemplates(true)}
                    selected={false}
                    icon="list"
                  />
                </div>

                {showAllTemplates ? (
                  <>
                    <BotBubble>
                      <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.chooseTemplate}</p>
                    </BotBubble>
                        <div className="mb-[10px] ml-[33px] flex flex-wrap gap-[8px]">
                      {allTemplates.map((template) => {
                        const itemsCount = template.sections.reduce((total, section) => total + section.items.length, 0);
                        const active = draft.templateId === template.id;
                        return (
                          <Chip
                            key={template.id}
                            active={active}
                            variant="navy"
                            label={`${template.name} (${itemsCount})`}
                            onClick={() => selectTemplateOption({ id: template.id, name: template.name, code: template.code, itemsCount })}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </>
            );
          })()
        ) : null}

        {confirmedTemplateLabel ? (
          <UserBubble>
            <p className="text-[13px] leading-[18px] text-white">{confirmedTemplateLabel}</p>
          </UserBubble>
        ) : null}

        {reached('ready') ? (
          <BotBubble>
            <p className="text-[13px] leading-[18px] text-[#131313]">{BOT_TEXT.ready}</p>
          </BotBubble>
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
          <button
            type="button"
            className={`flex h-[50px] flex-1 items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold ${
              canStart ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'
            }`}
            onClick={onContinueWizard}
            disabled={!canStart}
          >
            Continuar
            <span>→</span>
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
