import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function InfoIcon() {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" /><path d="M16 14.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="16" cy="10.5" r="1.5" fill="currentColor" /></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function CheckIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="m8 12 2.4 2.4L16.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function FindingRejectDialog({ open, isSubmitting, onClose, onConfirm }: { open: boolean; isSubmitting: boolean; onClose: () => void; onConfirm: (reason: string) => void | Promise<void> }) {
  const [reason, setReason] = useState('');
  const canSubmit = reason.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  async function submit() {
    if (!canSubmit) return;
    await onConfirm(reason.trim());
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(19,19,19,0.75)] px-[16px]" role="presentation">
      <div className="w-[495px] max-w-full rounded-[16px] bg-white p-[16px] shadow-[0_4px_14px_rgba(19,19,19,0.24)]" role="dialog" aria-modal="true" aria-labelledby="reject-observation-title">
        <div className="flex items-center justify-between">
          <div className="text-[#24588b]"><InfoIcon /></div>
          <button type="button" className="flex size-[32px] items-center justify-center text-[#131313]" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar rechazo"><CloseIcon /></button>
        </div>
        <div className="mt-[32px] flex flex-col gap-[8px]">
          <p id="reject-observation-title" className="text-[18px] font-bold leading-[22px] tracking-[0.36px] text-[#2a2a2a]">Rechazar observación</p>
          <p className="text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">Para rechazar esta observación debe llenar el siguiente campo explicando el motivo y solicitud de corrección</p>
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="reject-observation-reason" className="text-[13px] font-bold leading-none text-[#131313]">Motivo y solicitud</label>
            <textarea id="reject-observation-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="h-[80px] min-h-[80px] w-full resize-none rounded-[10px] border-[1.5px] border-[#d1d1d1] bg-[#f6faff] px-[15.5px] py-[14.5px] text-[13px] leading-[19.5px] text-[#131313] outline-none placeholder:text-[#757575]" placeholder="Describa la acción correctiva a ejecutar..." disabled={isSubmitting} />
          </div>
        </div>
        <div className="mt-[32px] flex gap-[12px]">
          <button type="button" className="flex h-[40px] min-w-0 flex-1 items-center justify-center rounded-[8px] border border-[#c8a064] bg-white px-[16px] py-[8px] text-[14px] font-bold tracking-[0.28px] text-[#c8a064]" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
          <button type="button" className={`flex h-[40px] min-w-0 flex-1 items-center justify-center rounded-[8px] px-[16px] py-[8px] text-[14px] font-bold tracking-[0.28px] ${canSubmit ? 'bg-[#c8a064] text-white' : 'bg-[#d1d1d1] text-[#646464]'}`} onClick={submit} disabled={!canSubmit}>{isSubmitting ? 'Rechazando...' : 'Rechazar observación'}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ObservationRejectedToast({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-[83px] left-1/2 z-[80] flex -translate-x-1/2 items-center gap-[8px] rounded-[8px] bg-[#54a036] p-[12px] text-white shadow-[0_4px_14px_rgba(19,19,19,0.18)]" role="status" aria-live="polite">
      <CheckIcon />
      <p className="whitespace-nowrap text-[14px] font-bold leading-[22.7px] tracking-[0.28px]">Observación rechazada</p>
      <button type="button" className="flex size-[16px] items-center justify-center" onClick={onClose} aria-label="Ocultar confirmación"><CloseIcon /></button>
    </div>
  );
}
