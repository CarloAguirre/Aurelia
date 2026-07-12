import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { InspectionDetailEvidenceResponse, InspectionDetailFindingItemResponse } from '@aurelia/contracts';
import { env } from '../../../shared/config/env';
import { suggestFindingExecutionAction } from '../../../shared/services/findingAssistantExecution.service';
import { ChatAureliaIcon, ChatBackIcon, ChatMoreIcon, ChatSendIcon } from '../new-inspection/icons/AssistantChatIcons';

const API_URL = env.apiUrl;
const apiOrigin = API_URL.replace(/\/api\/?$/, '');

type AssistantPhase = 'details' | 'response' | 'summary' | 'done';

type ExtraBubble = {
  id: string;
  from: 'agent' | 'user';
  text: string;
};

function currentTime() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value: string | null | undefined) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatDateTime(value: string | null | undefined) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'dd-mm-aaaa · 00:00';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()} · ${hours}:${minutes}`;
}

function daysLabel(value: string | null | undefined) {
  if (!value) return 'XX días hábiles';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'XX días hábiles';
  const days = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `${days} días hábiles`;
}

function resolveEvidenceContentUrl(evidence: InspectionDetailEvidenceResponse | undefined) {
  if (!evidence) return null;
  if (evidence.fileId) return `${apiOrigin}/api/files/${encodeURIComponent(evidence.fileId)}/content`;
  if (!evidence.url) return null;
  if (evidence.url.startsWith('http')) return evidence.url;
  if (evidence.url.startsWith('/api/')) return `${apiOrigin}${evidence.url}`;
  return evidence.url;
}

function Header({ subtitle, phase, onBack }: { subtitle: string; phase: AssistantPhase; onBack: () => void }) {
  const stepIndex = phase === 'details' ? 0 : phase === 'response' ? 1 : 2;
  const labels = ['Paso 1 · Detalles del hallazgo', 'Paso 2 · Tu respuesta', 'Paso 3 · Resumen'];
  const percents = ['33%', '66%', '100%'];
  return <><div className="h-[56px] shrink-0 bg-[#002659] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"><div className="flex h-full items-center gap-[4px] px-[4px]"><button type="button" onClick={onBack} className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full" aria-label="Volver"><ChatBackIcon /></button><div className="min-w-0 flex-1 px-[4px]"><p className="truncate text-[14px] font-semibold leading-[17px] text-white">Ejecutar observación</p><p className="mt-[1px] flex items-center gap-[4px] truncate text-[11px] leading-[14px] text-[rgba(255,255,255,0.55)]"><span className="h-[6px] w-[6px] rounded-full bg-[#00B398]" />AurelIA · Asistente EECC · {subtitle}</p></div><div className="mr-[4px] flex h-[22px] shrink-0 items-center rounded-[16px] bg-[#00B398] px-[10px] text-[10px] font-bold text-white">EECC</div><button type="button" className="flex h-[48px] w-[36px] shrink-0 items-center justify-center rounded-full"><ChatMoreIcon /></button></div></div><div className="shrink-0 bg-[#002659] px-[16px] pb-[7px] pt-[7px]"><div className="mb-[5px] flex gap-[3px]">{[0, 1, 2].map((index) => <div key={index} className={`h-[3px] flex-1 rounded-[2px] ${index < stepIndex ? 'bg-[#00B398]' : index === stepIndex ? 'bg-[rgba(0,179,152,0.45)]' : 'bg-[rgba(255,255,255,0.15)]'}`} />)}</div><div className="flex justify-between"><p className="text-[10px] font-semibold leading-none text-[rgba(255,255,255,0.7)]">{labels[stepIndex]}</p><p className="text-[10px] font-semibold leading-none text-[rgba(255,255,255,0.7)]">{percents[stepIndex]}</p></div></div></>;
}

function AgentBubble({ children }: { children: ReactNode }) {
  return <div className="flex items-end gap-[7px]"><div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00B398] to-[#006153] text-white"><ChatAureliaIcon className="h-[15px] w-[17px]" /></div><div className="max-w-[85%] rounded-[16px_16px_16px_4px] border border-[#E3E3E3] bg-white px-[12px] py-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="text-[13px] leading-[19.5px] text-[#131313] [&_strong]:font-bold">{children}</div><p className="mt-[4px] text-[10px] leading-none text-[#ACACAC]">{currentTime()}</p></div></div>;
}

function UserBubble({ children }: { children: ReactNode }) {
  return <div className="flex justify-end"><div className="max-w-[78%] rounded-[16px_16px_4px_16px] bg-[#002659] px-[12px] py-[10px]"><div className="text-[13px] leading-[18px] text-white">{children}</div><p className="mt-[4px] text-[10px] leading-none text-[rgba(255,255,255,0.38)]">{currentTime()}</p></div></div>;
}

function TypingDots() {
  return <div className="flex items-end gap-[7px]"><div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00B398] to-[#006153] text-white"><ChatAureliaIcon className="h-[15px] w-[17px]" /></div><div className="flex gap-[4px] rounded-[16px_16px_16px_4px] border border-[#E3E3E3] bg-white px-[14px] py-[10px]">{[0, 1, 2].map((item) => <span key={item} className="h-[6px] w-[6px] rounded-full bg-[#ACACAC]" />)}</div></div>;
}

function QuickOption({ children, onClick, tone = 'default' }: { children: ReactNode; onClick: () => void; tone?: 'default' | 'teal' }) {
  return <button type="button" onClick={onClick} className={`ml-[33px] flex min-h-[34px] w-fit items-center gap-[6px] rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[12px] font-semibold transition ${tone === 'teal' ? 'border-[#00B398] bg-[#00B398] text-white' : 'border-[#D1D1D1] bg-white text-[#24588B]'}`}>{children}</button>;
}

function FindingBadge({ children, className }: { children: string; className: string }) {
  return <span className={`inline-flex h-[20px] items-center rounded-[6px] px-[8px] text-[10px] font-bold leading-none ${className}`}>{children}</span>;
}

function EvidenceBox({ title, evidence, afterFile }: { title: string; evidence?: InspectionDetailEvidenceResponse; afterFile?: File | null }) {
  const url = afterFile ? URL.createObjectURL(afterFile) : resolveEvidenceContentUrl(evidence);
  useEffect(() => () => { if (afterFile && url) URL.revokeObjectURL(url); }, [afterFile, url]);
  return <div className="overflow-hidden rounded-[8px] border border-[#E3E3E3]"><div className="bg-[#001E39] px-[8px] py-[4px]"><p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.7)]">{title}</p></div><div className={`flex h-[80px] items-center justify-center overflow-hidden ${afterFile ? 'bg-[#E0FFD3]' : 'bg-gradient-to-br from-[#E8F4FD] to-[#C8E6F0]'}`}>{url ? <img src={url} alt={title} className="h-full w-full object-cover" /> : <div className="text-center text-[22px] text-[#24588B]">▧</div>}</div></div>;
}

function FindingCard({ item, index }: { item: InspectionDetailFindingItemResponse | null | undefined; index: number }) {
  return <div className="ml-[33px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"><div className="flex items-center justify-between bg-[#001E39] px-[14px] py-[9px]"><span className="min-w-0 truncate text-[11px] font-bold text-white">Obs. {index + 1}</span><FindingBadge className="bg-[#FFE1CD] text-[#532A0E]">{item?.severityLabel ?? 'Moderado'}</FindingBadge></div><div className="flex h-[110px] flex-col items-center justify-center gap-[6px] border-b border-[#E3E3E3] bg-gradient-to-br from-[#E8F4FD] to-[#C8E6F0]"><span className="text-[28px] text-[#24588B]">▧</span><span className="text-[10px] text-[#646464]">Foto Antes · Obs. {index + 1}</span></div><div className="flex flex-col gap-[7px] px-[12px] py-[10px]"><div className="flex gap-[8px]"><p className="min-w-[72px] pt-px text-[9px] font-bold uppercase tracking-[0.05em] text-[#646464]">Condición</p><p className="flex-1 text-[12px] font-medium leading-[16.8px] text-[#131313]">{item?.condition ?? '—'}</p></div><div className="flex gap-[8px]"><p className="min-w-[72px] pt-px text-[9px] font-bold uppercase tracking-[0.05em] text-[#646464]">Medida solicitada</p><p className="flex-1 text-[12px] font-medium leading-[16.8px] text-[#131313]">{item?.proposedCorrectiveAction ?? '—'}</p></div></div></div>;
}

function SlaCard({ item }: { item: InspectionDetailFindingItemResponse | null | undefined }) {
  return <div className="ml-[33px] flex items-center gap-[10px] rounded-[10px] border-[1.5px] border-[#E8A06A] bg-[#FFE1CD] px-[12px] py-[10px]"><span className="text-[18px] text-[#532A0E]">◷</span><div><p className="text-[11px] font-bold text-[#532A0E]">Fecha límite: {formatDate(item?.dueAt)}</p><p className="mt-[2px] text-[10px] text-[#532A0E]">{daysLabel(item?.dueAt)} · <strong>SLA vigente</strong></p></div></div>;
}

function PhotoInput({ file, onChange }: { file: File | null; onChange: (file: File) => void }) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) onChange(nextFile);
    event.target.value = '';
  }
  if (file) return <label className="flex h-[58px] cursor-pointer items-center gap-[8px] rounded-[10px] bg-[#3A9B3A] px-[12px] py-[10px]"><input type="file" accept="image/*" className="hidden" onChange={handleChange} /><span className="flex size-[40px] items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.25)] text-white">▣</span><span className="min-w-0 truncate text-[12px] font-bold text-white">{file.name}</span></label>;
  return <div className="rounded-[10px] border-[1.5px] border-dashed border-[#D1D1D1] px-[14px] py-[14px]"><div className="flex flex-col items-center gap-[8px]"><div className="flex size-[40px] items-center justify-center rounded-[10px] bg-[#F4F6F9] text-[18px] text-[#646464]">▣</div><p className="text-[12px] font-bold text-[#333]">Adjuntar foto de evidencia</p><p className="text-center text-[10px] text-[#ACACAC]">Fecha, hora y GPS se registran automáticamente</p><div className="flex w-full gap-[8px]"><label className="flex h-[34px] flex-1 cursor-pointer items-center justify-center gap-[5px] rounded-[8px] border-[1.5px] border-[#D1D1D1] bg-[#F4F6F9] text-[11px] font-semibold text-[#333]"><input type="file" accept="image/*" className="hidden" onChange={handleChange} />▣ Tomar foto</label><label className="flex h-[34px] flex-1 cursor-pointer items-center justify-center gap-[5px] rounded-[8px] border-[1.5px] border-[#D1D1D1] bg-[#F4F6F9] text-[11px] font-semibold text-[#333]"><input type="file" accept="image/*" className="hidden" onChange={handleChange} />▧ Galería</label></div></div></div>;
}

function ResponseCard({ item, file, suggestion, editing, description, onFile, onAccept, onEdit, onDescriptionChange, onSaveDescription }: { item: InspectionDetailFindingItemResponse | null | undefined; file: File | null; suggestion: string | null; editing: boolean; description: string; onFile: (file: File) => void; onAccept: () => void; onEdit: () => void; onDescriptionChange: (value: string) => void; onSaveDescription: () => void }) {
  return <div className="ml-[33px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white"><div className="flex items-center gap-[6px] border-b border-[#E3E3E3] bg-[#F4F6F9] px-[12px] py-[8px]"><span className="text-[11px] text-[#00B398]">▣</span><p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#646464]">Foto Después — evidencia de corrección</p></div><div className="p-[12px]"><PhotoInput file={file} onChange={onFile} /></div><div className="border-t border-[#E3E3E3] px-[12px] py-[10px]"><p className="mb-[6px] text-[10px] font-bold uppercase tracking-[0.05em] text-[#646464]">Descripción de la acción tomada</p>{suggestion && !editing ? <div className="overflow-hidden rounded-[10px] border-[1.5px] border-[#C8A064] bg-white"><div className="flex items-center gap-[6px] border-b border-[rgba(200,160,100,0.2)] bg-gradient-to-br from-[#FDF3E3] to-[#FAE8C8] px-[12px] py-[7px]"><span className="text-[10px] text-[#8E6E3E]">✦</span><span className="text-[10px] font-bold text-[#8E6E3E]">Acción sugerida por AurelIA</span></div><div className="px-[12px] py-[10px]"><p className="text-[12px] font-medium leading-[18px] text-[#131313]">{suggestion}</p></div><div className="flex gap-[6px] px-[12px] pb-[10px]"><button type="button" onClick={onEdit} className="flex h-[34px] items-center justify-center rounded-[8px] border-[1.5px] border-[#D1D1D1] bg-white px-[12px] text-[12px] font-semibold text-[#333]">Editar</button><button type="button" onClick={onAccept} className="flex h-[34px] flex-1 items-center justify-center rounded-[8px] bg-[#00B398] text-[12px] font-bold text-white">Aceptar</button></div></div> : null}{editing ? <div><textarea value={description} onChange={(event) => onDescriptionChange(event.target.value)} className="min-h-[86px] w-full resize-none rounded-[8px] border-[1.5px] border-[#D1D1D1] bg-white px-[12px] py-[10px] text-[12px] leading-[18px] text-[#131313] outline-none focus:border-[#00B398]" placeholder={item?.proposedCorrectiveAction ?? 'Describe la acción que tomaste…'} /><button type="button" onClick={onSaveDescription} className="mt-[8px] flex h-[36px] w-full items-center justify-center rounded-[8px] bg-[#00B398] text-[12px] font-bold text-white">Guardar descripción</button></div> : null}{!suggestion && !editing ? <p className="text-[11px] leading-[16px] text-[#ACACAC]">Adjunta una foto para que AurelIA proponga una descripción inicial.</p> : null}</div></div>;
}

function SummaryCard({ item, index, file, description }: { item: InspectionDetailFindingItemResponse | null | undefined; index: number; file: File | null; description: string }) {
  const responsible = item?.responsibleUsers[0];
  return <div className="overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white"><div className="flex items-center justify-between bg-[#001E39] px-[12px] py-[8px]"><span className="text-[11px] font-bold text-white">Observación · Obs. {index + 1}</span><FindingBadge className="bg-[#C5FFF6] text-[#006153]">Ejecutado</FindingBadge></div><div className="grid grid-cols-2 gap-[8px] px-[12px] py-[10px]"><EvidenceBox title="Antes · Inspector" evidence={item?.beforeEvidence[0]} /><EvidenceBox title="Después · EECC" afterFile={file} /></div><div className="border-t border-[#E3E3E3]"><div className="flex border-b border-[#E3E3E3] px-[12px] py-[8px]"><span className="min-w-[86px] text-[10px] font-medium text-[#646464]">Ejecutado por</span><span className="flex-1 text-[11px] font-semibold text-[#131313]">{responsible?.fullName ?? 'Usuario EECC'}</span></div><div className="flex border-b border-[#E3E3E3] px-[12px] py-[8px]"><span className="min-w-[86px] text-[10px] font-medium text-[#646464]">Empresa</span><span className="flex-1 text-[11px] font-semibold text-[#131313]">{item?.responsibleCompanyName ?? responsible?.companyName ?? 'EECC'}</span></div><div className="flex border-b border-[#E3E3E3] px-[12px] py-[8px]"><span className="min-w-[86px] text-[10px] font-medium text-[#646464]">Fecha y hora</span><span className="flex-1 text-[11px] font-semibold text-[#131313]">{formatDateTime(new Date().toISOString())}</span></div><div className="flex border-b border-[#E3E3E3] px-[12px] py-[8px]"><span className="min-w-[86px] text-[10px] font-medium text-[#646464]">Criticidad</span><span className="flex-1 text-[11px] font-semibold text-[#131313]"><FindingBadge className="bg-[#FFE1CD] text-[#532A0E]">{item?.severityLabel ?? 'Moderado'}</FindingBadge></span></div><div className="px-[12px] py-[8px]"><p className="text-[10px] font-medium text-[#646464]">Acción tomada</p><p className="pt-[4px] text-[11px] font-semibold leading-[16.5px] text-[#131313]">{description}</p></div></div></div>;
}

function Footer({ phase, inputValue, onInputChange, onSend, disabled, onConfirm, onDone }: { phase: AssistantPhase; inputValue: string; onInputChange: (value: string) => void; onSend: () => void; disabled: boolean; onConfirm: () => void; onDone: () => void }) {
  if (phase === 'summary') return <div className="shrink-0 border-t border-[#E3E3E3] bg-white px-[12px] pb-[6px] pt-[8px]"><button type="button" onClick={onConfirm} disabled={disabled} className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[14px] bg-[#00B398] text-[14px] font-bold text-white disabled:bg-[#D1D1D1]">✓ Confirmar ejecución</button><div className="mx-auto mt-[10px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" /></div>;
  if (phase === 'done') return <div className="shrink-0 border-t border-[#E3E3E3] bg-white px-[12px] pb-[6px] pt-[8px]"><button type="button" onClick={onDone} className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[14px] bg-[#C8A064] text-[14px] font-bold text-white">← Volver a mis hallazgos</button><div className="mx-auto mt-[10px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" /></div>;
  return <div className="shrink-0 border-t border-[#E3E3E3] bg-white px-[12px] pb-[6px] pt-[8px]"><div className="flex items-center gap-[8px]"><button type="button" className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#F4F6F9] text-[#646464]">◉</button><textarea value={inputValue} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Escribe aquí o usa los controles…" rows={1} className="min-h-[40px] max-h-[80px] flex-1 resize-none rounded-[20px] border-[1.5px] border-[#D1D1D1] bg-[#F4F6F9] px-[14px] py-[10px] text-[13px] leading-[18px] text-[#131313] outline-none placeholder:text-[#ACACAC]" /><button type="button" onClick={onSend} className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#00B398] text-white"><ChatSendIcon /></button></div><div className="mx-auto mt-[10px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" /></div>;
}

function DoneScreen({ item, index }: { item: InspectionDetailFindingItemResponse | null | undefined; index: number }) {
  return <div className="flex min-h-full flex-col items-center justify-center gap-[16px] px-[24px] py-[24px] text-center"><div className="flex size-[76px] items-center justify-center rounded-full bg-[#00B398] text-[32px] text-white shadow-[0_4px_16px_rgba(0,179,152,0.3)]">✓</div><h2 className="text-[20px] font-bold leading-[24px] text-[#00B398]">¡Observación ejecutada!</h2><p className="max-w-[280px] text-[13px] leading-[20.8px] text-[#646464]">La observación <strong className="text-[#131313]">Obs. {index + 1}</strong> fue marcada como <strong className="text-[#00B398]">Ejecutada</strong> y quedará pendiente de revisión.</p><div className="w-full max-w-[300px] rounded-[12px] border-[1.5px] border-[#00B398] bg-[#C5FFF6] px-[16px] py-[14px] text-left"><div className="mb-[10px] flex items-center gap-[8px]"><div className="flex size-[32px] items-center justify-center rounded-[8px] bg-[#00B398] text-white">🔔</div><p className="text-[12px] font-bold text-[#006153]">Notificaciones enviadas</p></div><p className="text-[12px] leading-[18px] text-[#006153]"><strong>Admin GF HSE</strong><br />Revisará la evidencia para aprobar o rechazar.</p></div><div className="grid w-full max-w-[300px] grid-cols-2 gap-[8px]"><div className="rounded-[8px] border border-[#E3E3E3] bg-white p-[10px]"><p className="text-[14px] font-bold text-[#131313]">{item?.responsibleUsers[0]?.fullName?.split(' ')[0] ?? 'EECC'}</p><p className="mt-[2px] text-[9px] text-[#646464]">Ejecutado por</p></div><div className="rounded-[8px] border border-[#E3E3E3] bg-white p-[10px]"><p className="text-[14px] font-bold text-[#00B398]">{currentTime()}</p><p className="mt-[2px] text-[9px] text-[#646464]">Hora de ejecución</p></div></div><p className="text-[11px] leading-[16.5px] text-[#ACACAC]">AurelIA · Gold Fields Salares Norte<br />{formatDate(new Date().toISOString())}</p></div>;
}

export function FindingAssistantExecutionView({ subtitle, item, index = 1, isSubmitting = false, onBack, onCancel, onSubmit }: { subtitle: string; item?: InspectionDetailFindingItemResponse | null; index?: number; isSubmitting?: boolean; onBack: () => void; onCancel: () => void; onSubmit: (description: string, file: File) => void | Promise<void> }) {
  const [phase, setPhase] = useState<AssistantPhase>('details');
  const [file, setFile] = useState<File | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [extraBubbles, setExtraBubbles] = useState<ExtraBubble[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canSummarize = Boolean(file && description.trim().length > 0);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [phase, file, suggestion, description, editing, loadingSuggestion, extraBubbles.length]);

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setLoadingSuggestion(true);
    const action = await suggestFindingExecutionAction({ item, areaLabel: subtitle });
    setSuggestion(action);
    setDescription(action);
    setEditing(false);
    setLoadingSuggestion(false);
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-agent`, from: 'agent', text: 'Foto recibida ✓. Te propongo esta descripción basada en la medida solicitada. Acéptala o edítala.' }]);
  }

  function startResponse() {
    setPhase('response');
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-user`, from: 'user', text: 'Sí, iniciar respuesta' }]);
  }

  function askQuestion() {
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-agent`, from: 'agent', text: 'Claro, puedes revisar la condición detectada, la medida solicitada y el SLA vigente antes de continuar.' }]);
  }

  function sendFreeText() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-user`, from: 'user', text }, { id: `${Date.now()}-agent`, from: 'agent', text: 'Recibido. Mantengo el contexto de esta observación para ayudarte a completar la ejecución.' }]);
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    setDescription(suggestion);
    setEditing(false);
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-user`, from: 'user', text: '✓ Descripción aceptada' }]);
  }

  function saveDescription() {
    const value = description.trim();
    if (!value) return;
    setDescription(value);
    setEditing(false);
    setExtraBubbles((current) => [...current, { id: `${Date.now()}-user`, from: 'user', text: '✓ Descripción guardada' }]);
  }

  async function confirmExecution() {
    if (!file || !description.trim()) return;
    await onSubmit(description.trim(), file);
    setPhase('done');
  }

  function handleBack() {
    if (phase === 'summary') {
      setPhase('response');
      return;
    }
    if (phase === 'response') {
      setPhase('details');
      return;
    }
    onBack();
  }

  return <div className="absolute inset-0 z-40 flex flex-col overflow-hidden bg-[#F4F6F9]"><Header subtitle={subtitle} phase={phase} onBack={phase === 'done' ? onCancel : handleBack} /><div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F4F6F9] px-[12px] py-[12px]"><div className="flex flex-col gap-[10px]">{phase === 'done' ? <DoneScreen item={item} index={index} /> : null>{phase !== 'done' ? <AgentBubble>¡Hola! 👋 Iniciaste el flujo asistido para ejecutar la <strong>Obs. {index + 1}</strong>. Revisa los detalles antes de continuar:</AgentBubble> : null>{phase !== 'done' ? <FindingCard item={item} index={index} /> : null>{phase !== 'done' ? <SlaCard item={item} /> : null>{extraBubbles.map((bubble) => bubble.from === 'agent' ? <AgentBubble key={bubble.id}>{bubble.text}</AgentBubble> : <UserBubble key={bubble.id}>{bubble.text}</UserBubble>)}{phase === 'details' ? <><AgentBubble>¿Estás listo para registrar tu respuesta?</AgentBubble><QuickOption tone="teal" onClick={startResponse}>→ Sí, iniciar respuesta</QuickOption><QuickOption onClick={askQuestion}>? Tengo una consulta</QuickOption></> : null}{phase === 'response' ? <><AgentBubble>Perfecto. Completa tu respuesta: sube la foto <strong>Después</strong> y describe la acción que tomaste.</AgentBubble><ResponseCard item={item} file={file} suggestion={suggestion} editing={editing} description={description} onFile={handleFile} onAccept={acceptSuggestion} onEdit={() => setEditing(true)} onDescriptionChange={setDescription} onSaveDescription={saveDescription} />{loadingSuggestion ? <TypingDots /> : null}{canSummarize ? <QuickOption tone="teal" onClick={() => setPhase('summary')}>→ Continuar al resumen</QuickOption> : null}</> : null}{phase === 'summary' ? <><AgentBubble>Revisa el resumen completo antes de confirmar:</AgentBubble><SummaryCard item={item} index={index} file={file} description={description} /><AgentBubble>¿Todo correcto? Al confirmar, el hallazgo quedará como <strong>Ejecutado</strong> y el Admin GF HSE será notificado para aprobar.</AgentBubble><QuickOption onClick={() => setPhase('response')}>✎ Editar algo</QuickOption></> : null}</div></div><Footer phase={phase} inputValue={inputValue} onInputChange={setInputValue} onSend={sendFreeText} disabled={isSubmitting || !file || description.trim().length === 0} onConfirm={confirmExecution} onDone={onCancel} /></div>;
}
