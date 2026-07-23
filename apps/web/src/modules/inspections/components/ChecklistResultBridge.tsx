import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getInspectionDetail } from '../../../shared/services/inspection-detail.service';
import { getInspectionManagementTable } from '../../../shared/services/inspections.service';
import { InspectionChecklistResultPanel } from './InspectionChecklistResultPanel';
import { subscribeInspectionDom } from './inspection-dom-subscription';

type ResultTarget = {
  panel: HTMLElement;
  recordId: string;
};

const inspectionIdCache = new Map<string, Promise<string | null>>();

function classNameIncludes(element: Element, value: string) {
  return element.getAttribute('class')?.includes(value) ?? false;
}

function getRecordId(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll('p'))
    .map((node) => node.textContent?.trim() ?? '')
    .find((value) => /^#\S+/.test(value)) ?? null;
}

function isResultTabActive(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll('button')).some(
    (button) => button.textContent?.trim() === 'Resultado completo'
      && classNameIncludes(button, 'border-[#c8a064]'),
  );
}

function findResultPanel(dialog: HTMLElement) {
  const candidates = Array.from(dialog.querySelectorAll('div')).filter(
    (element) => classNameIncludes(element, 'min-h-0')
      && classNameIncludes(element, 'flex-1')
      && classNameIncludes(element, 'overflow-y-auto')
      && classNameIncludes(element, 'bg-white'),
  );
  return candidates.find((element) => element.dataset.aureliaChecklistResult === 'true')
    ?? candidates.find((element) => element.childElementCount === 0)
    ?? null;
}

function findTarget(): ResultTarget | null {
  const dialogs = Array.from(document.querySelectorAll('section[role="dialog"]'))
    .filter((node): node is HTMLElement => node instanceof HTMLElement);
  for (const dialog of dialogs) {
    if (!isResultTabActive(dialog)) continue;
    const recordId = getRecordId(dialog);
    const panel = findResultPanel(dialog);
    if (recordId && panel) return { panel, recordId };
  }
  return null;
}

function resolveInspectionId(recordId: string) {
  if (!inspectionIdCache.has(recordId)) {
    inspectionIdCache.set(recordId, getInspectionManagementTable({ page: 1, pageSize: 10, id: recordId })
      .then((response) => {
        const normalized = recordId.replace(/^#/, '').trim();
        return response.rows.find((row) => row.inspectionNumber === normalized || `#${row.inspectionNumber}` === recordId)?.inspectionId
          ?? response.rows[0]?.inspectionId
          ?? null;
      })
      .catch(() => null));
  }
  return inspectionIdCache.get(recordId)!;
}

export function ChecklistResultBridge() {
  const [target, setTarget] = useState<ResultTarget | null>(null);
  const [inspectionId, setInspectionId] = useState<string | null>(null);

  useEffect(() => subscribeInspectionDom(() => {
    const next = findTarget();
    setTarget((current) => current?.panel === next?.panel && current.recordId === next?.recordId ? current : next);
  }), []);

  useEffect(() => {
    let active = true;
    setInspectionId(null);
    if (!target) return () => { active = false; };
    void resolveInspectionId(target.recordId).then((value) => {
      if (active) setInspectionId(value);
    });
    return () => { active = false; };
  }, [target]);

  const detailQuery = useQuery({
    queryKey: ['inspections', 'detail', inspectionId],
    queryFn: () => getInspectionDetail(inspectionId ?? ''),
    enabled: Boolean(inspectionId),
    staleTime: 15000,
  });

  if (!target) return null;
  target.panel.dataset.aureliaChecklistResult = 'true';
  return createPortal(
    detailQuery.isLoading || !inspectionId
      ? <div className="flex min-h-full items-center justify-center bg-white px-[24px]"><p className="text-center text-[12px] font-semibold leading-[18px] text-[#646464]">Cargando resultado completo...</p></div>
      : detailQuery.isError
        ? <div className="flex min-h-full items-center justify-center bg-white px-[24px]"><p className="text-center text-[12px] font-semibold leading-[18px] text-[#646464]">No fue posible cargar el resultado completo.</p></div>
        : <InspectionChecklistResultPanel result={detailQuery.data?.checklistResult ?? null} />,
    target.panel,
  );
}
