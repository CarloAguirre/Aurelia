import { useEffect, useRef, type ReactElement } from 'react';
import {
  announceInspectionManagementOverlay,
  nextInspectionManagementOverlaySourceId,
  subscribeToInspectionManagementOverlay,
} from './inspection-management-overlay';

const viewportMargin = 8;
const triggerGap = 6;

function normalizedPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function findCalendarPopup() {
  if (normalizedPath() !== '/inspections') return null;

  const todayButton = Array.from(document.querySelectorAll('button')).find(
    (button) => normalizeText(button.textContent ?? '') === 'Hoy',
  );
  if (!(todayButton instanceof HTMLButtonElement)) return null;

  const popup = todayButton.closest('div.absolute');
  if (!(popup instanceof HTMLDivElement)) return null;
  const hasClearAction = Array.from(popup.querySelectorAll('button')).some(
    (button) => normalizeText(button.textContent ?? '') === 'Borrar',
  );
  return hasClearAction ? popup : null;
}

function findCalendarTrigger(popup: HTMLDivElement) {
  const wrapper = popup.parentElement;
  if (!wrapper) return null;
  return Array.from(wrapper.querySelectorAll('button')).find(
    (button) => !popup.contains(button),
  ) ?? null;
}

function resetPopupStyles(popup: HTMLDivElement | null) {
  if (!popup) return;
  popup.style.removeProperty('position');
  popup.style.removeProperty('left');
  popup.style.removeProperty('top');
  popup.style.removeProperty('right');
  popup.style.removeProperty('bottom');
  popup.style.removeProperty('z-index');
  popup.style.removeProperty('transform');
  popup.style.removeProperty('max-height');
  popup.style.removeProperty('overflow-y');
}

function positionPopup(popup: HTMLDivElement, trigger: HTMLButtonElement) {
  popup.style.position = 'fixed';
  popup.style.right = 'auto';
  popup.style.bottom = 'auto';
  popup.style.zIndex = '12000';
  popup.style.transform = 'none';
  popup.style.maxHeight = `calc(100vh - ${viewportMargin * 2}px)`;
  popup.style.overflowY = 'auto';

  const triggerRect = trigger.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const popupWidth = popupRect.width || 364;
  const popupHeight = popupRect.height || 420;
  const left = Math.min(
    Math.max(viewportMargin, triggerRect.left),
    Math.max(viewportMargin, window.innerWidth - popupWidth - viewportMargin),
  );
  const below = triggerRect.bottom + triggerGap;
  const top = below + popupHeight > window.innerHeight - viewportMargin
    ? Math.max(viewportMargin, triggerRect.top - popupHeight - triggerGap)
    : below;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

/**
 * Saca el calendario del contexto visual de la tabla con scroll y coordina su
 * apertura con los selects y el menú de acciones de Gestión de inspecciones.
 */
export function InspectionManagementCalendarOverlayBridge(): ReactElement | null {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const sourceIdRef = useRef(nextInspectionManagementOverlaySourceId('calendar'));

  useEffect(() => {
    let animationFrame = 0;

    function clearCurrentPopup() {
      resetPopupStyles(popupRef.current);
      popupRef.current = null;
      triggerRef.current = null;
    }

    function syncCalendar() {
      const popup = findCalendarPopup();
      if (!popup) {
        clearCurrentPopup();
        return;
      }

      const trigger = findCalendarTrigger(popup);
      if (!(trigger instanceof HTMLButtonElement)) {
        clearCurrentPopup();
        return;
      }

      const isNewPopup = popupRef.current !== popup;
      if (popupRef.current && isNewPopup) resetPopupStyles(popupRef.current);
      popupRef.current = popup;
      triggerRef.current = trigger;
      positionPopup(popup, trigger);

      if (isNewPopup) {
        announceInspectionManagementOverlay({
          kind: 'calendar',
          owner: trigger,
          sourceId: sourceIdRef.current,
        });
      }
    }

    function scheduleSync() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(syncCalendar);
    }

    function closeCalendar() {
      const trigger = triggerRef.current;
      if (trigger && document.body.contains(trigger)) trigger.click();
      else clearCurrentPopup();
    }

    const unsubscribeOverlay = subscribeToInspectionManagementOverlay((detail) => {
      if (detail.sourceId === sourceIdRef.current || !popupRef.current) return;
      closeCalendar();
    });

    function handlePointerDown(event: PointerEvent) {
      const popup = popupRef.current;
      const trigger = triggerRef.current;
      const target = event.target;
      if (!popup || !(target instanceof Node)) return;
      if (popup.contains(target) || trigger?.contains(target)) return;
      closeCalendar();
    }

    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, true);
    scheduleSync();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      unsubscribeOverlay();
      observer.disconnect();
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync, true);
      clearCurrentPopup();
    };
  }, []);

  return null;
}
