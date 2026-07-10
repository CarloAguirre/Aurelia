import { useEffect } from 'react';

type FindingCounts = {
  executed: number;
  open: number;
  closed: number;
  rejected: number;
};

type TimelineStep = {
  title: string;
  date: string;
  body: string;
  completed: boolean;
};

const datePattern = /^\d{2}-\d{2}-\d{4}$/;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function countFrom(text: string, label: string) {
  const match = text.match(new RegExp(`(\\d+)\\s+${label}`));
  return match ? Number(match[1]) : 0;
}

function readCounts(dialog: HTMLElement): FindingCounts {
  const text = dialog.innerText;
  return {
    executed: countFrom(text, 'Ejecutada'),
    open: countFrom(text, 'Abiertas'),
    closed: countFrom(text, 'Cerrada'),
    rejected: countFrom(text, 'Rechazada'),
  };
}

function obsWord(count: number) {
  return count === 1 ? 'observación' : 'observaciones';
}

function percent(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function checkMarker(completed: boolean) {
  return `<div class="absolute ${completed ? 'bg-[#6cc24a] text-white' : 'bg-[#e3e3e3] text-[#acacac]'} left-0 top-[0.25px] flex size-[24px] items-center justify-center rounded-[12px] text-[10px] font-normal leading-none">${completed ? '✓' : '○'}</div>`;
}

function timelineItem(step: TimelineStep, isLast: boolean) {
  return `<div class="relative w-full"><div class="relative flex w-full gap-[12px] items-start ${isLast ? '' : 'pb-[16px]'}"><div class="relative shrink-0 size-[24px]"></div><div class="min-w-0 flex-1 pt-[2px]"><p class="text-[12px] font-bold leading-none text-[#131313]">${escapeHtml(step.title)}</p><p class="pt-[4px] text-[11px] font-normal leading-none text-[#646464]">${escapeHtml(step.date)}</p>${step.body}</div>${isLast ? '' : '<div class="absolute left-[11px] top-[24px] h-[38px] w-[2px] bg-[#e3e3e3]"></div>'}${checkMarker(step.completed)}</div></div>`;
}

function progressBody(closed: number, pending: number, total: number) {
  return `<div class="pt-[2px]"><ul class="list-disc text-[11px] font-normal leading-normal text-[#646464]"><li class="ms-[16.5px]">Observaciones cerradas: ${closed} obs / ${percent(closed, total)}%</li><li class="ms-[16.5px]">Observaciones pendientes: ${pending} obs / ${percent(pending, total)}%</li></ul></div>`;
}

function renderFollowups(panel: HTMLElement, counts: FindingCounts) {
  const total = counts.executed + counts.open + counts.closed + counts.rejected;
  const pending = Math.max(0, total - counts.closed);
  const lines = panel.innerText.split('\n').map((line) => line.trim()).filter(Boolean);
  const dates = lines.filter((line) => datePattern.test(line));
  const initialDate = panel.dataset.aureliaInitialDate || dates[0] || '—';
  const followupDate = panel.dataset.aureliaFollowupDate || dates[1] || dates[0] || '—';
  const closureDate = panel.dataset.aureliaClosureDate || dates[dates.length - 1] || followupDate;
  const signature = `${counts.executed}|${counts.open}|${counts.closed}|${counts.rejected}|${initialDate}|${followupDate}|${closureDate}`;
  if (panel.dataset.aureliaFollowupProgress === signature) return;
  panel.dataset.aureliaInitialDate = initialDate;
  panel.dataset.aureliaFollowupDate = followupDate;
  panel.dataset.aureliaClosureDate = closureDate;
  panel.dataset.aureliaFollowupProgress = signature;
  const steps: TimelineStep[] = [{ title: 'Inspección inicial', date: initialDate, body: `<p class="pt-[5px] text-[11px] font-normal leading-none text-[#646464]">${total} ${obsWord(total)} detectadas</p>`, completed: true }];
  if (counts.closed > 0 && counts.closed < total) steps.push({ title: 'Seguimiento 1', date: followupDate, body: progressBody(counts.closed, pending, total), completed: true });
  if (total > 0 && counts.closed === total) steps.push({ title: 'Cierre', date: closureDate, body: `<p class="pt-[5px] text-[11px] font-normal leading-[15px] text-[#646464]">Cierre aprobado por Admin GF HSE</p>`, completed: true });
  panel.innerHTML = `<div class="flex items-center gap-[6px]"><svg class="h-[11px] w-[13.75px]" width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true"><circle cx="3" cy="2.25" r="2" fill="#24588B"/><circle cx="11" cy="2.25" r="2" fill="#24588B"/><circle cx="7" cy="8.5" r="2" fill="#24588B"/><path d="M3 4.25V5.5C3 6.05 3.45 6.5 4 6.5H6.05M11 4.25V5.5C11 6.05 10.55 6.5 10 6.5H7.95M5 2.25H9" stroke="#24588B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="text-[11px] font-bold uppercase leading-none tracking-[0.55px] text-[#646464]">Historial de seguimientos</p></div><div class="pt-[10px]">${steps.map((step, index) => timelineItem(step, index === steps.length - 1)).join('')}</div>`;
}

function patchFollowups() {
  const headings = Array.from(document.querySelectorAll('p')).filter((node) => node.textContent?.trim().toUpperCase() === 'HISTORIAL DE SEGUIMIENTOS');
  headings.forEach((heading) => {
    const panel = heading.closest('.overflow-y-auto');
    const dialog = heading.closest('section[role="dialog"]');
    if (!(panel instanceof HTMLElement) || !(dialog instanceof HTMLElement)) return;
    renderFollowups(panel, readCounts(dialog));
  });
}

export function InspectionFollowupProgressBridge() {
  useEffect(() => {
    const observer = new MutationObserver(() => patchFollowups());
    observer.observe(document.body, { childList: true, subtree: true });
    patchFollowups();
    return () => observer.disconnect();
  }, []);
  return null;
}
