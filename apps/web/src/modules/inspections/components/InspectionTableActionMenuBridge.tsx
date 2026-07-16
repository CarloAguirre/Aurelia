import { useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { env } from '../../../shared/config/env';
import { getInspectionManagementTable } from '../../../shared/services/inspections.service';

type MenuState = {
  top: number;
  left: number;
  width: number;
  source: HTMLElement;
  trigger: HTMLButtonElement | null;
};

const apiOrigin = env.apiUrl.replace(/\/api\/?$/, '');

function getDirectButtons(element: HTMLElement) {
  return Array.from(element.children).filter((child): child is HTMLButtonElement => child instanceof HTMLButtonElement);
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeInspectionNumber(value: string) {
  return normalizeText(value).replace(/^#/, '');
}

function inspectionNumberFromMenu(menu: HTMLElement) {
  const row = menu.closest('tr');
  const firstCell = row?.querySelector('td');
  return normalizeInspectionNumber(firstCell?.textContent ?? '');
}

function isSourceMenu(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.closest('[data-inspection-actions-portal="true"]')) return false;
  const buttons = getDirectButtons(element);
  if (buttons.length !== 2 || element.children.length !== 2) return false;
  const firstLabel = normalizeText(buttons[0]?.textContent ?? '');
  const secondLabel = normalizeText(buttons[1]?.textContent ?? '');
  return firstLabel === 'Ver detalles' && secondLabel === 'PDF (.pdf)';
}

function findMenu() {
  const candidates = Array.from(document.querySelectorAll('div'));
  return candidates.find(isSourceMenu) as HTMLElement | undefined;
}

function getTrigger(menu: HTMLElement) {
  const trigger = menu.parentElement?.querySelector('button[aria-haspopup="menu"]');
  return trigger instanceof HTMLButtonElement ? trigger : null;
}

function buildMenuState(menu: HTMLElement): MenuState | null {
  const trigger = getTrigger(menu);
  if (!trigger) return null;
  const rect = trigger.getBoundingClientRect();
  const width = 220;
  const height = 96;
  const margin = 8;
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
  const below = rect.bottom + 6;
  const top = below + height > window.innerHeight - margin ? Math.max(margin, rect.top - height - 6) : below;
  return { top, left, width, source: menu, trigger };
}

export function InspectionTableActionMenuBridge(): ReactElement | null {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const hiddenSourceRef = useRef<HTMLElement | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    function restoreHiddenSource() {
      if (!hiddenSourceRef.current) return;
      hiddenSourceRef.current.style.visibility = '';
      hiddenSourceRef.current.style.pointerEvents = '';
      hiddenSourceRef.current = null;
    }

    function syncMenu() {
      const source = findMenu();
      if (!source) {
        restoreHiddenSource();
        setMenu(null);
        return;
      }

      const next = buildMenuState(source);
      if (!next) {
        restoreHiddenSource();
        setMenu(null);
        return;
      }

      if (hiddenSourceRef.current && hiddenSourceRef.current !== source) restoreHiddenSource();
      source.style.visibility = 'hidden';
      source.style.pointerEvents = 'none';
      hiddenSourceRef.current = source;
      setMenu((current) => {
        if (current?.source === source && current.top === next.top && current.left === next.left) return current;
        return next;
      });
    }

    const observer = new MutationObserver(syncMenu);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', syncMenu);
    window.addEventListener('scroll', syncMenu, true);
    syncMenu();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncMenu);
      window.removeEventListener('scroll', syncMenu, true);
      restoreHiddenSource();
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menu) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (portalRef.current?.contains(target)) return;
      if (menu.trigger?.contains(target)) return;
      menu.trigger?.click();
    }

    document.addEventListener('mousedown', handleOutsideClick, true);
    return () => document.removeEventListener('mousedown', handleOutsideClick, true);
  }, [menu]);

  function activateSourceButton(index: number) {
    if (!menu) return;
    const buttons = getDirectButtons(menu.source);
    const button = buttons[index];
    if (button instanceof HTMLButtonElement) button.click();
  }

  async function downloadInspectionPdf() {
    if (!menu || isDownloadingPdf) return;

    const inspectionNumber = inspectionNumberFromMenu(menu.source);
    if (!inspectionNumber) {
      window.alert('No fue posible identificar la inspección seleccionada.');
      return;
    }

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      window.alert('El navegador bloqueó la descarga. Habilita las ventanas emergentes para Aurelia.');
      return;
    }

    pdfWindow.opener = null;
    pdfWindow.document.title = 'Generando informe PDF';
    pdfWindow.document.body.textContent = 'Generando informe PDF…';
    setIsDownloadingPdf(true);
    menu.trigger?.click();

    try {
      const response = await getInspectionManagementTable({
        page: 1,
        pageSize: 10,
        id: inspectionNumber,
      });
      const selected = response.rows.find(
        (row) => normalizeInspectionNumber(row.inspectionNumber) === inspectionNumber,
      ) ?? response.rows[0];

      if (!selected) throw new Error('Inspection not found');

      pdfWindow.location.href = `${apiOrigin}/api/inspections/${encodeURIComponent(selected.inspectionId)}/export/pdf`;
    } catch {
      pdfWindow.close();
      window.alert('No fue posible generar el PDF de la inspección. Intenta nuevamente.');
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  if (!menu) return null;

  return createPortal(
    <div ref={portalRef} data-inspection-actions-portal="true" className="fixed z-[10000] flex flex-col items-start rounded-[12px] border border-[#d1d1d1] bg-white p-[8px] shadow-[0px_4px_8px_rgba(19,19,19,0.24)]" style={{ top: `${menu.top}px`, left: `${menu.left}px`, width: `${menu.width}px` }} role="menu">
      <button type="button" onClick={() => activateSourceButton(0)} className="flex h-[40px] w-full items-center rounded-[8px] bg-white px-[8px] py-[12px] text-left font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]" role="menuitem">Ver detalles</button>
      <button type="button" disabled={isDownloadingPdf} onClick={downloadInspectionPdf} className="flex h-[40px] w-full items-center rounded-[8px] px-[8px] py-[12px] text-left font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313] disabled:cursor-wait disabled:opacity-60" role="menuitem">{isDownloadingPdf ? 'Generando PDF…' : 'PDF (.pdf)'}</button>
    </div>,
    document.body,
  );
}
