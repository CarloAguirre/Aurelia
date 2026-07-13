import { useEffect } from 'react';
import { InspectionAnswerValue } from '@aurelia/contracts';
import { getInspectionExportPayload, getInspectionManagementTable, type InspectionExportPayload } from '../../../shared/services/inspections.service';

type ChecklistResultItem = {
  id: string;
  question: string;
  sortOrder: number;
};

type ChecklistResultAnswer = {
  checklistItemId: string;
  answerValue: string | null;
  answerText: string | null;
  notes: string | null;
};

type ChecklistResultStats = {
  compliant: number;
  notCompliant: number;
  notApplicable: number;
};

const payloadCache = new Map<string, Promise<InspectionExportPayload | null>>();
const inspectionIdCache = new Map<string, Promise<string | null>>();

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function classNameIncludes(element: Element, value: string) {
  return element.getAttribute('class')?.includes(value) ?? false;
}

function getRecordId(dialog: HTMLElement) {
  const candidate = Array.from(dialog.querySelectorAll('p')).map((node) => node.textContent?.trim() ?? '').find((value) => /^#\S+/.test(value));
  return candidate ?? null;
}

function isResultTabActive(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll('button')).some((button) => button.textContent?.trim() === 'Resultado completo' && classNameIncludes(button, 'border-[#c8a064]'));
}

function findResultPanel(dialog: HTMLElement) {
  const candidates = Array.from(dialog.querySelectorAll('div')).filter((element) => classNameIncludes(element, 'min-h-0') && classNameIncludes(element, 'flex-1') && classNameIncludes(element, 'overflow-y-auto') && classNameIncludes(element, 'bg-white'));
  return candidates.find((element) => element.dataset.aureliaChecklistResult === 'true') ?? candidates.find((element) => element.childElementCount === 0) ?? candidates[candidates.length - 1] ?? null;
}

function getAnswerLabel(value: string | null | undefined) {
  if (value === InspectionAnswerValue.COMPLIANT) return 'SÍ';
  if (value === InspectionAnswerValue.NOT_COMPLIANT) return 'NO';
  if (value === InspectionAnswerValue.NOT_APPLICABLE) return 'N/A';
  if (value === InspectionAnswerValue.PARTIAL) return 'PARCIAL';
  if (value === InspectionAnswerValue.NOT_OBSERVED) return 'N/O';
  return '—';
}

function getAnswerTone(value: string | null | undefined) {
  if (value === InspectionAnswerValue.NOT_COMPLIANT) return 'no';
  if (value === InspectionAnswerValue.NOT_APPLICABLE || value === InspectionAnswerValue.NOT_OBSERVED) return 'neutral';
  if (value === InspectionAnswerValue.PARTIAL) return 'partial';
  return 'yes';
}

function getItems(payload: InspectionExportPayload): ChecklistResultItem[] {
  const checklist = payload.checklist as { sections?: Array<{ items?: ChecklistResultItem[] }> } | null;
  return (checklist?.sections ?? []).flatMap((section) => section.items ?? []).filter((item) => Boolean(item.id && item.question)).sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

function getAnswers(payload: InspectionExportPayload) {
  const answers = payload.answers as ChecklistResultAnswer[];
  return new Map(answers.map((answer) => [answer.checklistItemId, answer]));
}

function getStats(answers: Map<string, ChecklistResultAnswer>, items: ChecklistResultItem[]): ChecklistResultStats {
  return items.reduce<ChecklistResultStats>((stats, item) => {
    const value = answers.get(item.id)?.answerValue;
    if (value === InspectionAnswerValue.NOT_COMPLIANT) stats.notCompliant += 1;
    else if (value === InspectionAnswerValue.NOT_APPLICABLE || value === InspectionAnswerValue.NOT_OBSERVED) stats.notApplicable += 1;
    else stats.compliant += 1;
    return stats;
  }, { compliant: 0, notCompliant: 0, notApplicable: 0 });
}

function statBlock(value: number, label: string, tone: 'yes' | 'no' | 'neutral', last = false) {
  const textClass = tone === 'yes' ? 'text-[#2a5c16]' : tone === 'no' ? 'text-[#570b1d]' : 'text-[#646464]';
  const marker = tone === 'yes' ? '✓ ' : tone === 'no' ? '× ' : '';
  return `<div class="flex min-w-0 flex-1 flex-col items-center justify-center gap-[2px]${last ? '' : ' border-r border-[#e3e3e3]'}"><p class="text-[18px] font-bold leading-[22px] ${textClass}">${value}</p><p class="text-[11px] font-normal leading-[13px] ${textClass}">${marker}${label}</p></div>`;
}

function resultBadge(value: string | null | undefined) {
  const label = getAnswerLabel(value);
  const tone = getAnswerTone(value);
  if (tone === 'no') return `<span class="inline-flex min-h-[16px] items-center rounded-[6px] bg-[#ffd0db] px-[8px] py-[2px] text-[10px] font-bold leading-none text-[#570b1d]">${label}</span>`;
  if (tone === 'neutral') return `<span class="inline-flex min-h-[16px] items-center rounded-[6px] bg-[#f7f7f7] px-[8px] py-[2px] text-[10px] font-bold leading-none text-[#646464]">${label}</span>`;
  if (tone === 'partial') return `<span class="inline-flex min-h-[16px] items-center rounded-[6px] bg-[#ffeab8] px-[8px] py-[2px] text-[10px] font-bold leading-none text-[#463100]">${label}</span>`;
  return `<span class="inline-flex min-h-[16px] items-center rounded-[6px] bg-[#e0ffd3] px-[8px] py-[2px] text-[10px] font-bold leading-none text-[#2a5c16]">${label}</span>`;
}

function itemRow(item: ChecklistResultItem, answer: ChecklistResultAnswer | undefined, index: number, isLast: boolean) {
  const value = answer?.answerValue ?? null;
  const comment = answer?.answerText ?? answer?.notes ?? '';
  const isNo = value === InspectionAnswerValue.NOT_COMPLIANT;
  const rowClass = isNo ? 'bg-[#ffd0db]' : 'bg-white';
  const numberClass = isNo ? 'text-[#bd3b5b]' : 'text-[#acacac]';
  const questionClass = isNo ? 'font-semibold text-[#570b1d]' : 'font-normal text-[#333]';
  const commentHtml = comment.trim().length > 0 ? `<p class="pt-[8px] text-[12px] font-semibold leading-[16.8px] text-[#333]">Comentario:<br />${escapeHtml(comment)}</p>` : '';
  return `<div class="${rowClass} ${isLast ? '' : 'border-b border-[#e3e3e3]'}"><div class="flex gap-[10px] px-[12px] py-[9px]"><p class="shrink-0 pt-px text-[10px] font-bold leading-none ${numberClass}">${index + 1}</p><div class="min-w-0 flex-1"><p class="text-[12px] leading-[16.8px] ${questionClass}">${escapeHtml(item.question)}</p>${commentHtml}</div><div class="shrink-0 pt-px">${resultBadge(value)}</div></div></div>`;
}

function render(payload: InspectionExportPayload) {
  const items = getItems(payload);
  const answers = getAnswers(payload);
  const stats = getStats(answers, items);
  const rows = items.length > 0 ? items.map((item, index) => itemRow(item, answers.get(item.id), index, index === items.length - 1)).join('') : '<div class="flex min-h-[120px] items-center justify-center border border-[#e3e3e3] px-[24px] py-[24px]"><p class="text-center text-[12px] font-semibold leading-[18px] text-[#646464]">No hay ítems de checklist para mostrar.</p></div>';
  return `<div class="min-h-full bg-white"><div class="flex h-[70px] items-start border-b border-[#e3e3e3] bg-white px-[14px] pb-[13px] pt-[12px]">${statBlock(stats.compliant, 'SÍ', 'yes')}${statBlock(stats.notCompliant, 'NO', 'no')}${statBlock(stats.notApplicable, 'N/A', 'neutral', true)}</div><div class="py-[20px]"><div class="flex items-center gap-[6px] px-[14px]"><svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true"><path d="M1.25 1.4h1.5M1.25 5.5h1.5M1.25 9.6h1.5M5 1.4h7.75M5 5.5h7.75M5 9.6h7.75" stroke="#24588B" stroke-width="1.5" stroke-linecap="round"/></svg><p class="text-[11px] font-bold uppercase leading-none tracking-[0.55px] text-[#646464]">Detalle ítem a ítem</p></div><div class="pt-[10px]"><div class="border-y border-[#e3e3e3] bg-white">${rows}</div></div></div></div>`;
}

function renderLoading() {
  return '<div class="flex min-h-full items-center justify-center bg-white px-[24px]"><p class="text-center text-[12px] font-semibold leading-[18px] text-[#646464]">Cargando resultado completo...</p></div>';
}

function renderError() {
  return '<div class="flex min-h-full items-center justify-center bg-white px-[24px]"><p class="text-center text-[12px] font-semibold leading-[18px] text-[#646464]">No fue posible cargar el resultado completo.</p></div>';
}

function resolveInspectionId(recordId: string) {
  if (!inspectionIdCache.has(recordId)) {
    inspectionIdCache.set(recordId, getInspectionManagementTable({ page: 1, pageSize: 10, id: recordId }).then((response) => {
      const normalized = recordId.replace(/^#/, '').trim();
      return response.rows.find((row) => row.inspectionNumber === normalized || `#${row.inspectionNumber}` === recordId)?.inspectionId ?? response.rows[0]?.inspectionId ?? null;
    }).catch(() => null));
  }
  return inspectionIdCache.get(recordId)!;
}

function loadPayload(recordId: string) {
  if (!payloadCache.has(recordId)) {
    payloadCache.set(recordId, resolveInspectionId(recordId).then((inspectionId) => inspectionId ? getInspectionExportPayload(inspectionId) : null).catch(() => null));
  }
  return payloadCache.get(recordId)!;
}

async function hydratePanel(panel: HTMLElement, recordId: string) {
  const signature = `loading:${recordId}`;
  if (panel.dataset.aureliaChecklistResultSignature === signature || panel.dataset.aureliaChecklistResultSignature === `ready:${recordId}`) return;
  panel.dataset.aureliaChecklistResult = 'true';
  panel.dataset.aureliaChecklistResultSignature = signature;
  panel.innerHTML = renderLoading();
  const payload = await loadPayload(recordId);
  if (panel.dataset.aureliaChecklistResultSignature !== signature) return;
  if (!payload) {
    panel.dataset.aureliaChecklistResultSignature = `error:${recordId}`;
    panel.innerHTML = renderError();
    return;
  }
  panel.dataset.aureliaChecklistResultSignature = `ready:${recordId}`;
  panel.innerHTML = render(payload);
}

function patchChecklistResult() {
  const dialogs = Array.from(document.querySelectorAll('section[role="dialog"]')).filter((node): node is HTMLElement => node instanceof HTMLElement);
  dialogs.forEach((dialog) => {
    if (!isResultTabActive(dialog)) return;
    const recordId = getRecordId(dialog);
    const panel = findResultPanel(dialog);
    if (!recordId || !panel) return;
    void hydratePanel(panel, recordId);
  });
}

export function ChecklistResultBridge() {
  useEffect(() => {
    const observer = new MutationObserver(() => patchChecklistResult());
    observer.observe(document.body, { childList: true, subtree: true });
    patchChecklistResult();
    return () => observer.disconnect();
  }, []);
  return null;
}
