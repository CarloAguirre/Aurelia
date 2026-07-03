import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { createMobileBridgeLaunch } from '../../../shared/services/mobile-bridge.service';

const MOBILE_INSPECTIONS_URL = import.meta.env.VITE_MOBILE_INSPECTIONS_URL ?? 'http://localhost:8081';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

function getIframeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return '*';
  }
}

function shouldOpenFromClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  const button = target.closest('button');
  if (!button) return false;
  return button.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() === 'nueva inspección';
}

export function NewInspectionIframeModalController() {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const iframeBaseUrl = normalizeBaseUrl(MOBILE_INSPECTIONS_URL);
  const iframeUrl = `${iframeBaseUrl}/inspection/start`;
  const iframeOrigin = useMemo(() => getIframeOrigin(iframeBaseUrl), [iframeBaseUrl]);

  function postTicket(nextTicket = ticket) {
    if (!nextTicket) return;
    iframeRef.current?.contentWindow?.postMessage({ type: 'aurelia:desktop-launch', code: nextTicket }, iframeOrigin);
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (location.pathname !== '/inspections') return;
      if (!shouldOpenFromClick(event)) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      setTicket(null);
      return;
    }

    let cancelled = false;
    async function createLaunch() {
      const response = await createMobileBridgeLaunch();
      if (cancelled) return;
      setTicket(response.ticket);
      window.setTimeout(() => postTicket(response.ticket), 250);
    }

    void createLaunch();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (iframeOrigin !== '*' && event.origin !== iframeOrigin) return;
      const data = event.data as { type?: string } | null;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'aurelia:mobile-ready') postTicket();

      if (data.type === 'aurelia:inspection:saved') {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ['inspections', 'management'] }),
          queryClient.invalidateQueries({ queryKey: ['inspections', 'dashboard'] }),
        ]);
        setOpen(false);
      }

      if (data.type === 'aurelia:inspection:cancelled') setOpen(false);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [iframeOrigin, queryClient, ticket]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.68)] px-[24px] py-[20px]">
      <div className="relative flex h-[calc(100vh-40px)] max-h-[900px] w-[430px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <button className="absolute right-[12px] top-[12px] z-[2] flex size-[30px] items-center justify-center rounded-full bg-white text-[18px] font-semibold text-[#333] shadow-[0_1px_4px_rgba(0,0,0,0.18)]" type="button" onClick={() => setOpen(false)} aria-label="Cerrar nueva inspección">×</button>
        <iframe ref={iframeRef} className="h-full w-full border-0" src={iframeUrl} title="Nueva inspección" onLoad={() => postTicket()} allow="geolocation; camera; microphone" />
      </div>
    </div>
  );
}
