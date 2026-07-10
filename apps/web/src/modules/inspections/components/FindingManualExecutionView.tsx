import { useState } from 'react';
import type { InspectionDetailEvidenceResponse, InspectionDetailFindingItemResponse } from '@aurelia/contracts';
import { env } from '../../../shared/config/env';
import { InspectionDetailStatusChipIcon } from './InspectionDetailIcons';

const API_URL = env.apiUrl;
const apiOrigin = API_URL.replace(/\/api\/?$/, '');

function BackIcon() {
  return <svg width="23" height="19" viewBox="0 0 23 19" fill="none" aria-hidden="true"><path d="M9.5 1.75 1.75 9.5l7.75 7.75M2.5 9.5h18.75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ArrowRightIcon() {
  return <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M1 7h15M10.5 1.5 16 7l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function OfflineIcon() {
  return <svg width="13" height="11" viewBox="0 0 13 11" fill="none" aria-hidden="true"><path d="m1 1 11 9M3.2 4.1A5.4 5.4 0 0 1 6.5 3c1.25 0 2.4.4 3.32 1.08M5.1 6.04A2.6 2.6 0 0 1 6.5 5.63c.5 0 .96.13 1.36.37M6.5 8.35h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CameraIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M5.25 5.25 6.5 3.5h5l1.25 1.75H15A1.5 1.5 0 0 1 16.5 6.75v6A1.5 1.5 0 0 1 15 14.25H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 5.25h2.25Z" fill="currentColor" /><circle cx="9" cy="9.75" r="2.75" fill="white" /></svg>;
}

function severityClassName(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('crítico') || normalized.includes('critico')) return 'bg-[#ffd0db] text-[#570b1d]';
  if (normalized.includes('alto')) return 'bg-[#ffe1cd] text-[#532a0e]';
  if (normalized.includes('moder')) return 'bg-[#fbe1d0] text-[#69462e]';
  return 'bg-[#e0ffd3] text-[#2a5c16]';
}

function resolveEvidenceContentUrl(evidence: InspectionDetailEvidenceResponse | undefined) {
  if (!evidence) return null;
  if (evidence.fileId) return `${apiOrigin}/api/files/${encodeURIComponent(evidence.fileId)}/content`;
  if (!evidence.url) return null;
  if (evidence.url.startsWith('http')) return evidence.url;
  if (evidence.url.startsWith('/api/')) return `${apiOrigin}${evidence.url}`;
  return evidence.url;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '01-06-2026 · 09:14';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '01-06-2026 · 09:14';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()} · ${hours}:${minutes}`;
}

function formatDueDate(value: string | null | undefined) {
  if (!value) return 'Mar 10 jun. 2026';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Mar 10 jun. 2026';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '');
}

function FindingPill({ children, className }: { children: string; className: string }) {
  return <span className={`inline-flex h-[19px] items-center rounded-[6px] px-[8px] text-[11px] font-bold leading-none ${className}`}>{children}</span>;
}

function TextBlock({ title, children, bordered = false }: { title: string; children: string | null | undefined; bordered?: boolean }) {
  return <div className={`flex w-full flex-col items-start rounded-[8px] bg-white px-[10px] py-[8px] ${bordered ? 'border border-[#e3e3e3]' : ''}`}><p className="text-[9px] font-bold uppercase leading-none tracking-[1.5px] text-[#646464]">{title}</p><p className="pt-[3px] text-[12px] font-normal leading-[16.8px] text-[#131313]">{children || '—'}</p></div>;
}

function Stepper() {
  return <div className="shrink-0 border-b border-[#e3e3e3] bg-white px-[14px] pb-[9px] pt-[10px]"><div className="flex items-center"><div className="relative flex h-[35px] min-w-0 flex-1 flex-col items-center"><div className="absolute left-1/2 top-[10px] h-[2px] w-full bg-[#d1d1d1]" /><div className="z-10 flex size-[22px] items-center justify-center rounded-full border-2 border-[#c8a064] bg-white text-[9px] font-bold text-[#c8a064]">1</div><p className="pt-[3px] text-[8px] font-bold leading-[10px] text-[#8e6e3e]">Detalle</p></div><div className="relative flex h-[35px] w-[96px] flex-col items-center"><div className="absolute left-1/2 top-[10px] h-[2px] w-full bg-[#d1d1d1]" /><div className="z-10 flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-[#d1d1d1] bg-white text-[9px] font-bold text-[#acacac]">2</div><p className="pt-[3px] text-[8px] font-normal leading-[10px] text-[#acacac]">Resumen</p></div><div className="flex h-[35px] min-w-0 flex-1 flex-col items-center"><div className="flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-[#d1d1d1] bg-white text-[9px] font-bold text-[#acacac]">3</div><p className="pt-[3px] text-[8px] font-normal leading-[10px] text-[#acacac]">Confirm.</p></div></div><div className="mt-[6px] h-[2px] w-full rounded-[2px] bg-[#e3e3e3]" /></div>;
}

export function FindingManualExecutionView({ subtitle, item, index = 1, isSubmitting = false, onBack, onCancel, onSubmit }: { subtitle: string; item?: InspectionDetailFindingItemResponse | null; index?: number; isSubmitting?: boolean; onBack: () => void; onCancel: () => void; onSubmit: (description: string, file: File) => void | Promise<void> }) {
  const [description, setDescription] = useState('');
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const beforeEvidence = item?.beforeEvidence[0];
  const beforeUrl = resolveEvidenceContentUrl(beforeEvidence);
  const severityLabel = item?.severityLabel ?? 'Moderada';
  const condition = item?.condition ?? '[Descripción realizada por el usuario que levanta la inspección]';
  const proposedAction = item?.proposedCorrectiveAction ?? '[Medida correctiva que recomienda el usuario que tomó la inspección]';
  const statusLabel = item?.statusGroup === 'rejected' ? 'Rechazado' : item?.statusGroup === 'executed' ? 'Ejecutado' : item?.statusGroup === 'closed' ? 'Cerrado' : 'Abierto';
  const dueDateLabel = formatDueDate(item?.dueAt);
  const riskLabel = item?.severityLabel ? `${item.severityLabel.toLowerCase()} · SLA extendido por Admin GF` : 'Riesgo alto · SLA extendido por Admin GF';
  const canSubmit = Boolean(afterFile && description.trim().length > 0 && !isSubmitting);

  function submit() {
    if (!canSubmit || !afterFile) return;
    onSubmit(description.trim(), afterFile);
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-[#f7f7f7]">
      <div className="h-[56px] shrink-0 bg-[#002659] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]"><div className="flex h-full items-center gap-[4px] px-[4px]"><button type="button" onClick={onBack} className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-[rgba(255,255,255,0.92)]" aria-label="Volver"><BackIcon /></button><div className="min-w-0 flex-1 px-[4px]"><p className="truncate text-[14px] font-semibold leading-[17px] text-white">Detalle del hallazgo</p><p className="mt-[1px] text-[11px] leading-[13px] text-[rgba(255,255,255,0.55)]">Paso 2 de 4 · {subtitle}</p></div><div className="mr-[4px] flex h-[20px] shrink-0 items-center rounded-[16px] bg-[#c8a064] px-[10px] text-[10px] font-bold text-[#001e39]">EECC</div></div></div>
      <div className="flex shrink-0 items-center gap-[7px] border-b border-[#c8a064] bg-[#2a1a04] px-[16px] pb-[6px] pt-[5px] text-[#c8a064]"><OfflineIcon /><p className="text-[11px] font-semibold leading-none">Sin red · guardando localmente</p></div>
      <Stepper />
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f7f7] px-[14px] pt-[14px]">
        <div className="rounded-[10px] border-[1.5px] border-[#e3e3e3] bg-[#f7f7f7] p-[13.5px] shadow-[0px_1px_1.5px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between"><div className="flex min-w-0 items-center gap-[8px]"><FindingPill className="bg-[#e6f3ff] text-[#24588b]">{`Obs. ${index + 1}`}</FindingPill><FindingPill className={severityClassName(severityLabel)}>{severityLabel}</FindingPill></div><span className="inline-flex h-[19px] items-center gap-[4px] rounded-[6px] bg-[#fbe9be] px-[8px] py-[4px] text-[10px] font-bold leading-none text-[#5e4c22]"><InspectionDetailStatusChipIcon status="open" />{statusLabel}</span></div>
          <div className="flex flex-col gap-[4px] pt-[12px]">
            <div className="relative h-[80px] overflow-hidden rounded-[8px] bg-[linear-gradient(165deg,#1e3050_0%,#0f1f35_100%)]">{beforeUrl ? <img className="h-full w-full object-cover" src={beforeUrl} alt="Foto antes" /> : null}<div className="absolute left-[8px] top-[6px] rounded-[4px] bg-[rgba(0,0,0,0.55)] px-[7px] py-[2px]"><p className="text-[9px] font-bold uppercase leading-none tracking-[1.5px] text-white">Foto antes</p></div><div className="absolute bottom-[6px] right-[8px] rounded-[4px] bg-[rgba(0,0,0,0.5)] px-[6px] py-[2px]"><p className="text-[9px] font-normal leading-none text-[rgba(255,255,255,0.8)]">{formatDateTime(beforeEvidence?.capturedAt)}</p></div></div>
            <TextBlock title="Condición detectada" bordered>{condition}</TextBlock>
            <TextBlock title="Medida correctiva propuesta">{proposedAction}</TextBlock>
            <div className="border-t-[1.5px] border-[#c8a064] bg-[#fffdf7] px-[12px] pb-[12px] pt-[13.5px]"><p className="text-[11px] font-bold uppercase leading-none tracking-[0.66px] text-[#8e6e3e]">Tu respuesta</p><div className="pt-[10px]">{afterFile ? <label className="flex h-[60px] w-full cursor-pointer items-center gap-[8px] rounded-[8px] bg-[#3a9b3a] px-[12px] py-[10px]"><input type="file" accept="image/*" className="hidden" onChange={(event) => setAfterFile(event.target.files?.[0] ?? afterFile)} /><span className="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.25)] text-white"><CameraIcon /></span><span className="min-w-0 truncate text-[12px] font-bold leading-none text-white">{afterFile.name}</span></label> : <><p className="text-[13px] font-bold leading-none text-[#131313]">Fotografía "Después" *</p><label className="mt-[6px] flex min-h-[110px] w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#d1d1d1] bg-[#f6faff] px-[16px] py-[24px]"><input type="file" accept="image/*" className="hidden" onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)} /><p className="text-center text-[28px] leading-none">📷</p><p className="pt-[6px] text-center text-[13px] font-semibold leading-none text-[#646464]">Tomar foto o galería</p><p className="pt-[3px] text-center text-[11px] leading-none text-[#acacac]">Fecha, hora y GPS automáticos</p></label></>}</div><div className="pt-[12px]"><p className="text-[13px] font-bold leading-none text-[#131313]">Descripción de la acción tomada *</p><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-[6px] h-[80px] min-h-[80px] w-full resize-none rounded-[10px] border-[1.5px] border-[#d1d1d1] bg-[#f6faff] px-[15.5px] py-[14.5px] text-[13px] leading-[19.5px] text-[#131313] outline-none placeholder:text-[#757575]" placeholder="Describa la acción correctiva ejecutada..." /></div></div>
          </div>
        </div>
        <div className="pt-[16px]"><div className="rounded-[10px] bg-[#001e39] px-[14px] py-[10px]"><p className="text-[9px] font-bold uppercase leading-none tracking-[2px] text-[rgba(255,255,255,0.45)]">Fecha límite SLA</p><p className="pt-[3px] text-[14px] font-bold leading-[18px] tracking-[1.5px] text-[#c8a064]">{dueDateLabel} <span className="text-[11px] font-normal tracking-normal text-[rgba(255,255,255,0.55)]">{riskLabel}</span></p></div></div>
        <div className="mt-[12px] rounded-[10px] border border-[#ffcd56] bg-[#ffeab8] px-[12px] py-[10px]"><p className="text-[12px] leading-[18px] text-[#463100]"><span className="font-bold">BLOQUEANTE:</span> Debes adjuntar fotografía "Después" en la observación. Sin foto no es posible marcar como Ejecutado.</p></div>
      </div>
      <div className="shrink-0 border-t border-[#e3e3e3] bg-white pb-[8px] pt-[10px]"><div className="flex gap-[10px] px-[14px]"><button type="button" className="flex h-[50px] items-center justify-center rounded-[14px] border-2 border-[#c8a064] bg-white px-[20px] text-[14px] font-bold text-[#c8a064]" onClick={onCancel} disabled={isSubmitting}>Cancelar</button><button type="button" className={`flex h-[50px] min-w-0 flex-1 items-center justify-center gap-[8px] rounded-[14px] px-[12px] text-[14px] font-bold ${canSubmit ? 'bg-[#c8a064] text-[#001e39]' : 'bg-[#d1d1d1] text-[#acacac]'}`} disabled={!canSubmit} onClick={submit}>{isSubmitting ? 'Guardando...' : 'Marcar como ejecutado'} <ArrowRightIcon /></button></div><div className="mx-auto mb-[4px] mt-[12px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" /></div>
    </div>
  );
}
