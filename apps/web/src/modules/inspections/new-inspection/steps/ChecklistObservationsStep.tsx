import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InspectionAnswerValue, type InspectionChecklistItem, type InspectionChecklistTemplateResponse } from '@aurelia/contracts';
import { useSessionStore } from '../../../../shared/stores/session.store';
import { SelectSheet, type SelectSheetOption } from '../components/SelectSheet';
import {
  useNewInspectionDraftStore,
  type NewInspectionChecklistItemDetail,
} from '../state/newInspectionDraft.store';
import {
  getCompanyUsers,
  getResponsibleCompanies,
  getInspectionTemplates,
} from '../../../../shared/services/inspections.service';

interface ChecklistObservationsStepProps {
  onBack: () => void;
  onNext: () => void;
}

type ChecklistItemRow = InspectionChecklistItem & { sectionTitle: string };
type AttachmentInputVariant = 'photo' | 'field';

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

function getItemsCount(template: InspectionChecklistTemplateResponse) {
  return template.sections.reduce((total, section) => total + section.items.length, 0);
}

function getTemplateItems(template: InspectionChecklistTemplateResponse | undefined): ChecklistItemRow[] {
  if (!template) return [];
  return template.sections
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((section) =>
      section.items
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({ ...item, sectionTitle: section.title })),
    );
}

function getTemplateHeaderTitle(template: InspectionChecklistTemplateResponse | undefined, fallback: string | null) {
  const source = template?.name ?? fallback ?? 'Checklist normativo';
  return source.replace(/^Almacenamiento de\s+/i, '').replace(/\s*-\s*/g, ' – ').trim() || source;
}

function BackIcon() {
  return (
    <svg width="23" height="19" viewBox="0 0 23 19" fill="none" aria-hidden="true">
      <path d="M9.5 1.75 1.75 9.5l7.75 7.75M2.5 9.5h18.75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowLeftIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <path d="M17 7H2M7.5 1.5 2 7l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function CaretDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m4.5 7 4.5 4 4.5-4" stroke="#131313" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M4.6 1.4 3.4 10.6M10.6 1.4 9.4 10.6M1.8 4.2h10.8M1.4 7.8h10.8" stroke="#646464" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M2 3h1M5 3h7M2 6h1M5 6h7M2 9h1M5 9h7" stroke="#646464" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ManualStepper() {
  const steps = [
    { label: 'Datos', complete: true, active: false },
    { label: 'Tipo', complete: true, active: false },
    { label: 'Ítems', complete: false, active: true },
    { label: 'Resumen', complete: false, active: false },
  ];

  return (
    <div className="shrink-0 border-b border-[#E3E3E3] bg-white px-[14px] pb-[9px] pt-[10px]">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="relative h-[35px] w-[83px] shrink-0">
            {index < steps.length - 1 ? <div className={`absolute left-[33px] top-[11px] h-[2px] ${index === 2 ? 'w-[81px]' : 'w-[73px]'} ${step.complete ? 'bg-[#C8A064]' : 'bg-[#D1D1D1]'}`} /> : null}
            <div className={`absolute left-[22.2px] top-0 flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9px] font-bold ${step.complete ? 'border-[1.5px] border-[#C8A064] bg-[#C8A064] text-white' : step.active ? 'border-[2px] border-[#C8A064] bg-white text-[#C8A064]' : 'border-[1.5px] border-[#D1D1D1] bg-white text-[#ACACAC]'}`}>{step.complete ? '✓' : index + 1}</div>
            <p className={`absolute top-[25px] w-full text-center text-[8px] leading-[9.6px] ${step.complete || step.active ? 'font-semibold text-[#8E6E3E]' : 'text-[#ACACAC]'}`}>{step.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-[6px] h-[2px] w-full overflow-hidden rounded-[2px] bg-[#E3E3E3]">
        <div className="h-[2px] w-[249px] rounded-[2px] bg-gradient-to-r from-[#8E6E3E] to-[#C8A064]" />
      </div>
    </div>
  );
}

function ChecklistAnswerButton({ label, selected, tone, onPress }: { label: string; selected: boolean; tone: 'yes' | 'no' | 'na'; onPress: () => void }) {
  const selectedClass = tone === 'yes' ? 'border-[#35A137] bg-[#E4FBE5] text-[#247527]' : tone === 'no' ? 'border-[#BD3B5B] bg-[#FFE5EC] text-[#7A0E23]' : 'border-[#24588B] bg-[#E8F3FF] text-[#0F3F69]';
  return <button type="button" onClick={onPress} className={`flex h-[40px] flex-1 items-center justify-center rounded-[8px] border-[1.5px] px-[8px] text-center text-[12px] font-bold leading-none ${selected ? selectedClass : 'border-[#D1D1D1] bg-[#F6FAFF] text-[#131313]'}`}>{label}</button>;
}

function AttachmentInput({ value, emptyLabel, emptySubtitle, variant = 'field', onPick }: { value: string | null; emptyLabel: string; emptySubtitle?: string; variant?: AttachmentInputVariant; onPick: (name: string, file: File) => void }) {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onPick(file.name, file);
  }

  if (variant === 'photo') {
    return (
      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#D1D1D1] bg-[#F6FAFF] px-[16px] py-[24px] text-center">
        <input type="file" className="hidden" accept="image/*" onChange={onChange} />
        <span className="text-[28px] leading-none">📷</span>
        <span className={`mt-[6px] max-w-full truncate text-[13px] font-semibold leading-none ${value ? 'text-[#247527]' : 'text-[#646464]'}`}>{value ?? emptyLabel}</span>
        {!value && emptySubtitle ? <span className="mt-[3px] text-[11px] leading-none text-[#ACACAC]">{emptySubtitle}</span> : null}
      </label>
    );
  }

  return (
    <label className="mt-[4px] flex min-h-[48px] cursor-pointer items-center rounded-[10px] border-[1.5px] border-dashed border-[#D1D1D1] bg-[#F6FAFF] px-[12px] py-[8px]">
      <input type="file" className="hidden" accept="image/*" onChange={onChange} />
      <span className={`truncate text-[13px] font-semibold ${value ? 'text-[#1f6f23]' : 'text-[#646464]'}`}>{value ?? emptyLabel}</span>
    </label>
  );
}

function ChecklistItemCard({ item, index, answer, detail, onAnswer, onDetail }: { item: ChecklistItemRow; index: number; answer: InspectionAnswerValue | undefined; detail: NewInspectionChecklistItemDetail; onAnswer: (value: InspectionAnswerValue) => void; onDetail: (patch: Partial<NewInspectionChecklistItemDetail>) => void }) {
  const isNo = answer === InspectionAnswerValue.NOT_COMPLIANT;
  const isYes = answer === InspectionAnswerValue.COMPLIANT;

  return (
    <div className="border-b border-[#E3E3E3] pb-px last:border-b-0">
      <div className="flex items-start px-[12px] pb-[6px] pt-[11px]">
        <span className="shrink-0 pt-px text-[10px] font-bold leading-none text-[#ACACAC]">{index + 1}</span>
        <p className="ml-[2px] flex-1 text-[12px] font-normal leading-[18px] text-[#131313]">{item.question}</p>
      </div>
      <div className="flex w-full gap-[6px] pb-[10px] pl-[32px] pr-[12px]">
        <ChecklistAnswerButton label="SÍ" tone="yes" selected={answer === InspectionAnswerValue.COMPLIANT} onPress={() => onAnswer(InspectionAnswerValue.COMPLIANT)} />
        <ChecklistAnswerButton label="NO" tone="no" selected={answer === InspectionAnswerValue.NOT_COMPLIANT} onPress={() => onAnswer(InspectionAnswerValue.NOT_COMPLIANT)} />
        <ChecklistAnswerButton label="N/A" tone="na" selected={answer === InspectionAnswerValue.NOT_APPLICABLE} onPress={() => onAnswer(InspectionAnswerValue.NOT_APPLICABLE)} />
      </div>
      {isNo ? (
        <div className="mb-[10px] ml-[32px] mr-[12px] grid gap-[8px] rounded-[10px] border border-[#E3E3E3] bg-[#FAFAFA] p-[10px]">
          <div>
            <p className="text-[12px] font-bold text-[#131313]">Condición detectada *</p>
            <textarea className="mt-[4px] min-h-[64px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]" value={detail.detectedCondition ?? ''} onChange={(event) => onDetail({ detectedCondition: event.target.value })} placeholder="Describe la condición detectada" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#131313]">Medida correctiva propuesta *</p>
            <textarea className="mt-[4px] min-h-[64px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]" value={detail.correctiveAction ?? ''} onChange={(event) => onDetail({ correctiveAction: event.target.value })} placeholder="Indique la medida correctiva" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#131313]">Evidencia *</p>
            <AttachmentInput value={detail.evidence?.name ?? null} emptyLabel="Adjuntar foto" onPick={(name, file) => onDetail({ evidence: { name, file } })} />
          </div>
        </div>
      ) : null}
      {isYes ? (
        <div className="mb-[10px] ml-[32px] mr-[12px]">
          <p className="text-[12px] font-bold text-[#131313]">Comentario (Opcional)</p>
          <textarea className="mt-[4px] min-h-[54px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]" value={detail.comment ?? ''} onChange={(event) => onDetail({ comment: event.target.value })} placeholder="Comentario" />
        </div>
      ) : null}
    </div>
  );
}

function ProgressCard({ answeredCount, totalCount }: { answeredCount: number; totalCount: number }) {
  const width = totalCount ? `${(answeredCount / totalCount) * 100}%` : '0%';
  return (
    <div className="rounded-[12px] border border-[#E3E3E3] bg-white px-[15px] py-[13px] shadow-[0_1px_1.5px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-bold leading-none text-[#131313]">{answeredCount} de {totalCount} respondidos</p>
      <div className="mt-[8px] h-[6px] w-full overflow-hidden rounded-[4px] bg-[#E3E3E3]">
        <div className="h-[6px] rounded-[4px] bg-[#3A9B3A]" style={{ width }} />
      </div>
    </div>
  );
}

function ReferencePhotoBox({ value, onPick }: { value: string | null; onPick: (name: string, file: File) => void }) {
  return (
    <div className="grid gap-[6px]">
      <p className="text-[13px] font-bold leading-none text-[#131313]">Foto referencial general para la inspección *</p>
      <AttachmentInput value={value} emptyLabel="Tomar foto o galería" emptySubtitle="Fecha, hora y GPS automáticos" variant="photo" onPick={onPick} />
    </div>
  );
}

function ChecklistItemsCard({ title, code, items, draft, setAnswer, setItemDetail }: { title: string; code: string; items: ChecklistItemRow[]; draft: ReturnType<typeof useNewInspectionDraftStore>; setAnswer: (itemId: string, value: InspectionAnswerValue) => void; setItemDetail: (itemId: string, detail: Partial<NewInspectionChecklistItemDetail>) => void }) {
  return (
    <div className="min-h-px w-full overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between bg-[#001E39] px-[14px] py-[10px]">
        <p className="truncate text-[12px] font-bold leading-none text-white">{title}</p>
        <p className="ml-[10px] shrink-0 text-[10px] font-normal leading-none text-[rgba(255,255,255,0.45)]">{code}</p>
      </div>
      {items.length === 0 ? <p className="px-[12px] py-[14px] text-[12px] text-[#646464]">Esta plantilla no tiene ítems activos.</p> : null}
      {items.map((item, index) => (
        <ChecklistItemCard key={item.id} item={item} index={index} answer={draft.answersByItemId[item.id]} detail={draft.detailsByItemId[item.id] ?? {}} onAnswer={(value) => setAnswer(item.id, value)} onDetail={(patch) => setItemDetail(item.id, patch)} />
      ))}
    </div>
  );
}

function hasRequiredFindingDetail(detail: NewInspectionChecklistItemDetail | undefined) {
  return Boolean(detail?.detectedCondition?.trim() && detail.correctiveAction?.trim() && detail.evidence);
}

export function ChecklistObservationsStep({ onBack, onNext }: ChecklistObservationsStepProps) {
  const user = useSessionStore((state) => state.user);
  const online = useOnlineStatus();
  const draft = useNewInspectionDraftStore();
  const setTemplate = useNewInspectionDraftStore((state) => state.setTemplate);
  const setAnswer = useNewInspectionDraftStore((state) => state.setAnswer);
  const setItemDetail = useNewInspectionDraftStore((state) => state.setItemDetail);
  const setGeneralPhoto = useNewInspectionDraftStore((state) => state.setGeneralPhoto);
  const setFindingCompany = useNewInspectionDraftStore((state) => state.setFindingCompany);
  const setFindingResponsibles = useNewInspectionDraftStore((state) => state.setFindingResponsibles);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [usersPickerOpen, setUsersPickerOpen] = useState(false);

  const templatesQuery = useQuery({ queryKey: ['inspections', 'new-inspection', 'templates'], queryFn: getInspectionTemplates });
  const companiesQuery = useQuery({ queryKey: ['inspections', 'new-inspection', 'companies'], queryFn: getResponsibleCompanies });
  const usersByCompanyQuery = useQuery({ queryKey: ['inspections', 'new-inspection', 'company-users', draft.findingCompanyId], queryFn: () => getCompanyUsers(draft.findingCompanyId ?? ''), enabled: Boolean(draft.findingCompanyId) });

  const templates = templatesQuery.data ?? [];
  const selectedTemplate = templates.find((template) => template.id === draft.templateId);
  const items = useMemo(() => getTemplateItems(selectedTemplate), [selectedTemplate]);

  const templateOptions = useMemo<SelectSheetOption[]>(() => templates.map((template) => ({ id: template.id, label: template.name, description: `${template.code} · ${getItemsCount(template)} ítems` })), [templates]);
  const companyOptions = useMemo<SelectSheetOption[]>(() => (companiesQuery.data ?? []).map((company) => ({ id: company.id, label: company.name, description: company.code ?? undefined })), [companiesQuery.data]);
  const userOptions = useMemo<SelectSheetOption[]>(() => (usersByCompanyQuery.data ?? []).map((user) => ({ id: user.id, label: user.fullName, description: user.position ?? undefined })), [usersByCompanyQuery.data]);

  function selectTemplate(option: SelectSheetOption) {
    const template = templates.find((item) => item.id === option.id);
    if (!template) return;
    setTemplate({ id: template.id, name: template.name, code: template.code, itemsCount: getItemsCount(template) });
    setTemplatePickerOpen(false);
  }

  function selectCompany(option: SelectSheetOption) {
    setFindingCompany(option.id, option.label);
    setCompanyPickerOpen(false);
    setUsersPickerOpen(false);
  }

  function toggleUser(userId: string) {
    const next = draft.findingResponsibleIds.includes(userId) ? draft.findingResponsibleIds.filter((id) => id !== userId) : [...draft.findingResponsibleIds, userId];
    setFindingResponsibles(next);
  }

  const answeredCount = items.filter((item) => Boolean(draft.answersByItemId[item.id])).length;
  const hasFindings = items.some((item) => draft.answersByItemId[item.id] === InspectionAnswerValue.NOT_COMPLIANT);
  const missingFindingDetails = items.some((item) => draft.answersByItemId[item.id] === InspectionAnswerValue.NOT_COMPLIANT && !hasRequiredFindingDetail(draft.detailsByItemId[item.id]));
  const canContinue = Boolean(selectedTemplate && draft.generalPhoto && items.length > 0 && answeredCount === items.length && !missingFindingDetails && (!hasFindings || (draft.findingCompanyId && draft.findingResponsibleIds.length > 0)));
  const showOfflineBanner = !online || !user;
  const templateCode = draft.templateCode ?? selectedTemplate?.code ?? 'FR-00007';
  const templateItemsCount = draft.templateItemsCount ?? (selectedTemplate ? getItemsCount(selectedTemplate) : 15);
  const templateTitle = getTemplateHeaderTitle(selectedTemplate, draft.templateName);

  return (
    <>
      <div className="h-[56px] shrink-0 bg-[#002659] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]"><div className="flex h-full items-center gap-[4px] px-[4px]"><button type="button" className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-[rgba(255,255,255,0.92)]" onClick={onBack} aria-label="Atrás"><BackIcon /></button><div className="min-w-0 flex-1 px-[4px]"><p className="truncate text-[14px] font-semibold leading-[17px] text-white">Observaciones</p><p className="mt-[1px] truncate text-[11px] leading-[14px] text-[rgba(255,255,255,0.55)]">Paso 3 de 5</p></div><div className="pr-[4px]"><div className="flex h-[20px] w-[56px] items-center justify-center rounded-[16px] bg-[#C8A064]"><span className="text-[10px] font-bold leading-none text-[#001E39]">GF HSE</span></div></div></div></div>

      {showOfflineBanner ? <div className="flex h-[23px] shrink-0 items-center gap-[7px] border-b border-[#C8A064] bg-[#2A1A04] px-[16px] pb-[6px] pt-[5px]"><OfflineIcon /><span className="text-[11px] font-semibold leading-none text-[#C8A064]">Sin red · guardando localmente</span></div> : null}

      <ManualStepper />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        <div className="grid gap-[12px]">
          <div><p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Checklist normativo</p><p className="mt-[4px] w-[332px] text-[12px] leading-[16.8px] text-[#646464]">Responde todos los ítems · los NO quedarán registrados como observaciones</p></div>

          <div className="rounded-[12px] border-[1.5px] border-[#E3E3E3] bg-white p-[15.5px] shadow-[0_1px_1.5px_rgba(0,0,0,0.05)]">
            <div className="grid gap-[6px]"><p className="text-[13px] font-bold leading-none text-[#131313]">Seleccione la plantilla *</p><button type="button" onClick={() => setTemplatePickerOpen(true)} className="flex min-h-[50px] w-full items-center justify-between gap-[10px] rounded-[10px] border border-[#D1D1D1] bg-[#F6FAFF] px-[14px] py-[14px] text-left" disabled={templatesQuery.isLoading}><span className="min-w-0 flex-1 truncate text-[14px] font-medium leading-normal text-[#131313]">{templatesQuery.isLoading ? 'Cargando plantillas...' : draft.templateName ?? 'Seleccione'}</span><CaretDownIcon /></button></div>
            <div className="mt-[6px] flex h-[19px] items-center gap-[8px] pt-[6px]"><div className="flex items-center gap-[4px]"><HashIcon /><span className="text-[11px] leading-none text-[#646464]">{templateCode}</span></div><div className="flex items-center gap-[4px]"><ListIcon /><span className="text-[11px] leading-none text-[#646464]">{templateItemsCount} ítems</span></div></div>
          </div>

          {selectedTemplate ? <ProgressCard answeredCount={answeredCount} totalCount={items.length} /> : null}
          {selectedTemplate ? <ReferencePhotoBox value={draft.generalPhoto?.name ?? null} onPick={(name, file) => setGeneralPhoto({ name, file })} /> : null}
          {selectedTemplate ? <ChecklistItemsCard title={templateTitle} code={templateCode} items={items} draft={draft} setAnswer={setAnswer} setItemDetail={setItemDetail} /> : null}

          {hasFindings ? <div className="rounded-[12px] border border-[#E1E1E1] bg-white p-[14px]"><p className="text-[18px] font-bold text-[#131313]">Responsables</p><p className="mt-[8px] text-[13px] font-bold text-[#131313]">Empresa encargada de los hallazgos</p><button type="button" onClick={() => setCompanyPickerOpen(true)} className="mt-[4px] flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px]"><span className="truncate text-[14px] font-medium text-[#131313]">{draft.findingCompanyName ?? 'Seleccione empresa'}</span><CaretDownIcon /></button><p className="mt-[10px] text-[13px] font-bold text-[#131313]">Personal encargado de los hallazgos</p><button type="button" onClick={() => setUsersPickerOpen((value) => !value)} disabled={!draft.findingCompanyId} className="mt-[4px] flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] disabled:opacity-70"><span className="truncate text-[14px] font-medium text-[#131313]">{draft.findingResponsibleIds.length > 0 ? `${draft.findingResponsibleIds.length} responsables seleccionados` : 'Seleccione personal'}</span><CaretDownIcon /></button>{usersPickerOpen ? <div className="mt-[8px] max-h-[160px] overflow-y-auto rounded-[10px] border border-[#E3E3E3] bg-[#fafafa] p-[8px]">{usersByCompanyQuery.isLoading ? <p className="px-[8px] py-[6px] text-[12px] text-[#646464]">Cargando personal...</p> : null}{userOptions.map((userOption) => { const selected = draft.findingResponsibleIds.includes(userOption.id); return <button key={userOption.id} type="button" onClick={() => toggleUser(userOption.id)} className="mb-[6px] flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left"><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${selected ? 'border-[#C8A064] bg-[#C8A064] text-white' : 'border-[#001E39] bg-white'}`}>{selected ? '✓' : ''}</span><span className="flex-1 text-[13px] text-[#131313]">{userOption.label}</span></button>; })}</div> : null}</div> : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#E3E3E3] bg-white pb-[8px] pt-[10px]"><div className="flex w-full gap-[10px] px-[14px]"><button type="button" className="!flex !h-[50px] !w-auto !min-w-0 !shrink-0 !items-center !justify-center !gap-[8px] !rounded-[14px] !border-[2px] !border-[#C8A064] !bg-white !px-[20px] !text-[14px] !font-bold !text-[#C8A064]" onClick={onBack}><ArrowLeftIcon />Atrás</button><button type="button" className={`!flex !h-[50px] !w-auto !min-w-0 !flex-1 !items-center !justify-center !gap-[8px] !rounded-[14px] !text-[14px] !font-bold ${canContinue ? '!bg-[#C8A064] !text-white !shadow-[0_2px_4px_rgba(200,160,100,0.25)]' : '!bg-[#D1D1D1] !text-[#ACACAC] !shadow-none'}`} onClick={onNext} disabled={!canContinue}>Continuar<ArrowRightIcon /></button></div><div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" /></div>

      <SelectSheet visible={templatePickerOpen} title="Seleccionar plantilla" subtitle="Catálogo online/cache local" options={templateOptions} selectedId={draft.templateId} loading={templatesQuery.isLoading} emptyText="No hay plantillas disponibles" onClose={() => setTemplatePickerOpen(false)} onSelect={selectTemplate} />
      <SelectSheet visible={companyPickerOpen} title="Seleccionar empresa" options={companyOptions} selectedId={draft.findingCompanyId} loading={companiesQuery.isLoading} emptyText="No hay empresas disponibles" onClose={() => setCompanyPickerOpen(false)} onSelect={selectCompany} />
    </>
  );
}
