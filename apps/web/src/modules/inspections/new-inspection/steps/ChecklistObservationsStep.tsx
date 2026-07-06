import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InspectionAnswerValue, type InspectionChecklistItem, type InspectionChecklistTemplateResponse } from '@aurelia/contracts';
import { ManualFormStepper } from '../components/ManualFormStepper';
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

function ChecklistAnswerButton({
  label,
  selected,
  tone,
  onPress,
}: {
  label: string;
  selected: boolean;
  tone: 'yes' | 'no' | 'na';
  onPress: () => void;
}) {
  const selectedClass =
    tone === 'yes'
      ? 'border-[#35A137] bg-[#E4FBE5] text-[#247527]'
      : tone === 'no'
      ? 'border-[#BD3B5B] bg-[#FFE5EC] text-[#7A0E23]'
      : 'border-[#24588B] bg-[#E8F3FF] text-[#0F3F69]';

  return (
    <button
      type="button"
      onClick={onPress}
      className={`h-[32px] min-w-[70px] rounded-[8px] border px-[10px] text-[12px] font-bold ${
        selected ? selectedClass : 'border-[#D1D1D1] bg-white text-[#646464]'
      }`}
    >
      {label}
    </button>
  );
}

function AttachmentInput({
  value,
  emptyLabel,
  onPick,
}: {
  value: string | null;
  emptyLabel: string;
  onPick: (name: string, file: File) => void;
}) {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onPick(file.name, file);
  }

  return (
    <label className="mt-[4px] flex min-h-[58px] cursor-pointer items-center rounded-[10px] border-[1.5px] border-dashed border-[#D1D1D1] bg-[#F6FAFF] px-[12px] py-[8px]">
      <input type="file" className="hidden" accept="image/*" onChange={onChange} />
      <span className={`truncate text-[13px] font-semibold ${value ? 'text-[#1f6f23]' : 'text-[#646464]'}`}>
        {value ?? emptyLabel}
      </span>
    </label>
  );
}

function ChecklistItemCard({
  item,
  index,
  answer,
  detail,
  onAnswer,
  onDetail,
}: {
  item: ChecklistItemRow;
  index: number;
  answer: InspectionAnswerValue | undefined;
  detail: NewInspectionChecklistItemDetail;
  onAnswer: (value: InspectionAnswerValue) => void;
  onDetail: (patch: Partial<NewInspectionChecklistItemDetail>) => void;
}) {
  const isNo = answer === InspectionAnswerValue.NOT_COMPLIANT;
  const isYes = answer === InspectionAnswerValue.COMPLIANT;

  return (
    <div className="rounded-[12px] border border-[#E3E3E3] bg-white p-[12px]">
      <div className="mb-[8px] flex items-start gap-[8px]">
        <span className="mt-[2px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#f0f4f8] text-[10px] font-bold text-[#24588b]">{index + 1}</span>
        <p className="flex-1 text-[13px] leading-[18px] text-[#131313]">{item.question}</p>
      </div>

      <div className="flex flex-wrap gap-[8px]">
        <ChecklistAnswerButton
          label="SI"
          tone="yes"
          selected={answer === InspectionAnswerValue.COMPLIANT}
          onPress={() => onAnswer(InspectionAnswerValue.COMPLIANT)}
        />
        <ChecklistAnswerButton
          label="NO"
          tone="no"
          selected={answer === InspectionAnswerValue.NOT_COMPLIANT}
          onPress={() => onAnswer(InspectionAnswerValue.NOT_COMPLIANT)}
        />
        <ChecklistAnswerButton
          label="N/A"
          tone="na"
          selected={answer === InspectionAnswerValue.NOT_APPLICABLE}
          onPress={() => onAnswer(InspectionAnswerValue.NOT_APPLICABLE)}
        />
      </div>

      {isNo ? (
        <div className="mt-[10px] grid gap-[8px]">
          <div>
            <p className="text-[12px] font-bold text-[#131313]">Condicion detectada *</p>
            <textarea
              className="mt-[4px] min-h-[64px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]"
              value={detail.detectedCondition ?? ''}
              onChange={(event) => onDetail({ detectedCondition: event.target.value })}
              placeholder="Describe la condicion detectada"
            />
          </div>

          <div>
            <p className="text-[12px] font-bold text-[#131313]">Medida correctiva propuesta *</p>
            <textarea
              className="mt-[4px] min-h-[64px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]"
              value={detail.correctiveAction ?? ''}
              onChange={(event) => onDetail({ correctiveAction: event.target.value })}
              placeholder="Indique la medida correctiva"
            />
          </div>

          <div>
            <p className="text-[12px] font-bold text-[#131313]">Evidencia *</p>
            <AttachmentInput
              value={detail.evidence?.name ?? null}
              emptyLabel="Adjuntar foto"
              onPick={(name, file) => onDetail({ evidence: { name, file } })}
            />
          </div>
        </div>
      ) : null}

      {isYes ? (
        <div className="mt-[10px]">
          <p className="text-[12px] font-bold text-[#131313]">Comentario (Opcional)</p>
          <textarea
            className="mt-[4px] min-h-[54px] w-full resize-none rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[10px] py-[8px] text-[13px] text-[#131313]"
            value={detail.comment ?? ''}
            onChange={(event) => onDetail({ comment: event.target.value })}
            placeholder="Comentario"
          />
        </div>
      ) : null}
    </div>
  );
}

function hasRequiredFindingDetail(detail: NewInspectionChecklistItemDetail | undefined) {
  return Boolean(detail?.detectedCondition?.trim() && detail.correctiveAction?.trim() && detail.evidence);
}

export function ChecklistObservationsStep({ onBack, onNext }: ChecklistObservationsStepProps) {
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

  const templatesQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'templates'],
    queryFn: getInspectionTemplates,
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

  const templates = templatesQuery.data ?? [];
  const selectedTemplate = templates.find((template) => template.id === draft.templateId);
  const items = useMemo(() => getTemplateItems(selectedTemplate), [selectedTemplate]);

  const templateOptions = useMemo<SelectSheetOption[]>(
    () =>
      templates.map((template) => ({
        id: template.id,
        label: template.name,
        description: `${template.code} · ${getItemsCount(template)} items`,
      })),
    [templates],
  );

  const companyOptions = useMemo<SelectSheetOption[]>(
    () =>
      (companiesQuery.data ?? []).map((company) => ({
        id: company.id,
        label: company.name,
        description: company.code ?? undefined,
      })),
    [companiesQuery.data],
  );

  const userOptions = useMemo<SelectSheetOption[]>(
    () =>
      (usersByCompanyQuery.data ?? []).map((user) => ({
        id: user.id,
        label: user.fullName,
        description: user.position ?? undefined,
      })),
    [usersByCompanyQuery.data],
  );

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
    const next = draft.findingResponsibleIds.includes(userId)
      ? draft.findingResponsibleIds.filter((id) => id !== userId)
      : [...draft.findingResponsibleIds, userId];
    setFindingResponsibles(next);
  }

  const answeredCount = items.filter((item) => Boolean(draft.answersByItemId[item.id])).length;
  const hasFindings = items.some((item) => draft.answersByItemId[item.id] === InspectionAnswerValue.NOT_COMPLIANT);
  const missingFindingDetails = items.some(
    (item) =>
      draft.answersByItemId[item.id] === InspectionAnswerValue.NOT_COMPLIANT &&
      !hasRequiredFindingDetail(draft.detailsByItemId[item.id]),
  );

  const canContinue = Boolean(
    selectedTemplate &&
      draft.generalPhoto &&
      items.length > 0 &&
      answeredCount === items.length &&
      !missingFindingDetails &&
      (!hasFindings || (draft.findingCompanyId && draft.findingResponsibleIds.length > 0)),
  );

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

      <ManualFormStepper activeStep={3} steps={['Datos', 'Tipo', 'Items', 'Resumen']} />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        <div className="flex flex-col gap-[4px]">
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Checklist normativo</p>
          <p className="text-[12px] leading-[16.8px] text-[#646464]">Responde todos los items, los NO quedaran como observaciones</p>
        </div>

        <div className="mt-[12px] rounded-[12px] border border-[#e3e3e3] bg-white p-[15px]">
          <p className="text-[13px] font-bold text-[#131313]">Seleccione la plantilla *</p>
          <button
            type="button"
            onClick={() => setTemplatePickerOpen(true)}
            className="mt-[6px] flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#b4d1ed] bg-[#F6FAFF] px-[13px] text-left"
            disabled={templatesQuery.isLoading}
          >
            <span className="truncate text-[14px] font-medium text-[#131313]">
              {templatesQuery.isLoading ? 'Cargando plantillas...' : draft.templateName ?? 'Seleccione'}
            </span>
            <span className="text-[14px]">⌄</span>
          </button>

          {draft.templateId ? (
            <p className="mt-[8px] text-[11px] text-[#646464]">{draft.templateCode ?? 'Sin codigo'} · {draft.templateItemsCount ?? 0} items</p>
          ) : null}
        </div>

        {selectedTemplate ? (
          <>
            <div className="mt-[12px] rounded-[12px] bg-white px-[14px] py-[10px]">
              <p className="text-[13px] font-semibold text-[#131313]">{answeredCount} de {items.length} respondidos</p>
              <div className="mt-[8px] h-[6px] rounded-[4px] bg-[#e3e3e3]">
                <div className="h-[6px] rounded-[4px] bg-[#7A5A2B]" style={{ width: `${items.length ? (answeredCount / items.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="mt-[12px] rounded-[12px] border border-[#e3e3e3] bg-white p-[12px]">
              <p className="text-[12px] font-bold text-[#131313]">Foto referencial general *</p>
              <AttachmentInput
                value={draft.generalPhoto?.name ?? null}
                emptyLabel="Tomar foto o galeria"
                onPick={(name, file) => setGeneralPhoto({ name, file })}
              />
            </div>

            <div className="mt-[12px] grid gap-[12px]">
              {items.map((item, index) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  answer={draft.answersByItemId[item.id]}
                  detail={draft.detailsByItemId[item.id] ?? {}}
                  onAnswer={(value) => setAnswer(item.id, value)}
                  onDetail={(patch) => setItemDetail(item.id, patch)}
                />
              ))}
            </div>

            {hasFindings ? (
              <div className="mt-[12px] rounded-[12px] border border-[#E1E1E1] bg-white p-[14px]">
                <p className="text-[18px] font-bold text-[#131313]">Responsables</p>
                <p className="mt-[8px] text-[13px] font-bold text-[#131313]">Empresa encargada de los hallazgos</p>
                <button
                  type="button"
                  onClick={() => setCompanyPickerOpen(true)}
                  className="mt-[4px] flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px]"
                >
                  <span className="truncate text-[14px] font-medium text-[#131313]">{draft.findingCompanyName ?? 'Seleccione empresa'}</span>
                  <span>⌄</span>
                </button>

                <p className="mt-[10px] text-[13px] font-bold text-[#131313]">Personal encargado de los hallazgos</p>
                <button
                  type="button"
                  onClick={() => setUsersPickerOpen((value) => !value)}
                  disabled={!draft.findingCompanyId}
                  className="mt-[4px] flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#D1D1D1] bg-[#F6FAFF] px-[12px] disabled:opacity-70"
                >
                  <span className="truncate text-[14px] font-medium text-[#131313]">
                    {draft.findingResponsibleIds.length > 0 ? `${draft.findingResponsibleIds.length} responsables seleccionados` : 'Seleccione personal'}
                  </span>
                  <span>⌄</span>
                </button>

                {usersPickerOpen ? (
                  <div className="mt-[8px] max-h-[160px] overflow-y-auto rounded-[10px] border border-[#E3E3E3] bg-[#fafafa] p-[8px]">
                    {usersByCompanyQuery.isLoading ? <p className="px-[8px] py-[6px] text-[12px] text-[#646464]">Cargando personal...</p> : null}
                    {userOptions.map((user) => {
                      const selected = draft.findingResponsibleIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleUser(user.id)}
                          className="mb-[6px] flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left"
                        >
                          <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${selected ? 'border-[#C8A064] bg-[#C8A064] text-white' : 'border-[#001E39] bg-white'}`}>
                            {selected ? '✓' : ''}
                          </span>
                          <span className="flex-1 text-[13px] text-[#131313]">{user.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
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
        visible={templatePickerOpen}
        title="Seleccionar plantilla"
        subtitle="Catalogo online/cache local"
        options={templateOptions}
        selectedId={draft.templateId}
        loading={templatesQuery.isLoading}
        emptyText="No hay plantillas disponibles"
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={selectTemplate}
      />

      <SelectSheet
        visible={companyPickerOpen}
        title="Seleccionar empresa"
        options={companyOptions}
        selectedId={draft.findingCompanyId}
        loading={companiesQuery.isLoading}
        emptyText="No hay empresas disponibles"
        onClose={() => setCompanyPickerOpen(false)}
        onSelect={selectCompany}
      />
    </>
  );
}
