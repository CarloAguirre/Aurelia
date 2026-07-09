import { useState, type ReactNode } from 'react';
import type {
  InspectionDetailEvidenceResponse,
  InspectionDetailFindingGroupKey,
  InspectionDetailFindingItemResponse,
  InspectionDetailResponse,
  InspectionDetailResponsibleResponse,
} from '@aurelia/contracts';
import { env } from '../../../shared/config/env';
import { useInspectionFindingActions } from '../../../shared/hooks/useInspectionFindingActions';
import {
  InspectionDetailApproveIcon,
  InspectionDetailCameraIcon,
  InspectionDetailCaretDownIcon,
  InspectionDetailCloseIcon,
  InspectionDetailFollowupIcon,
  InspectionDetailImageIcon,
  InspectionDetailListIcon,
  InspectionDetailLocationIcon,
  InspectionDetailPdfIcon,
  InspectionDetailPersonIcon,
  InspectionDetailRejectIcon,
  InspectionDetailStatusChipIcon,
  InspectionDetailStatusRowIcon,
  type InspectionDetailIconStatus,
} from './InspectionDetailIcons';
import type { InspectionDetailModalRecord } from './InspectionDetailModal';

type StatusKey = InspectionDetailIconStatus;
type DetailTab = 'observations' | 'followups' | 'general';

type StatusConfig = {
  key: StatusKey;
  label: string;
  chipLabel: string;
  itemLabel: string;
  textClass: string;
  chipClass: string;
};

type DetailRowsProps = {
  inspectionId: string;
  counts: Record<InspectionDetailFindingGroupKey, number>;
  findings: Record<InspectionDetailFindingGroupKey, InspectionDetailFindingItemResponse[]>;
  actions: ReturnType<typeof useInspectionFindingActions>;
};

type FindingObservationCardProps = {
  inspectionId: string;
  item: InspectionDetailFindingItemResponse;
  actions: ReturnType<typeof useInspectionFindingActions>;
};

const API_URL = env.apiUrl;
const apiOrigin = API_URL.replace(/\/api\/?$/, '');

const statusConfigByKey: Record<StatusKey, StatusConfig> = {
  executed: { key: 'executed', label: 'Ejecutadas', chipLabel: 'Ejecutada', itemLabel: 'Ejecutado', textClass: 'text-[#570b1d]', chipClass: 'bg-[#ffd0db] text-[#570b1d]' },
  open: { key: 'open', label: 'Abiertas', chipLabel: 'Abiertas', itemLabel: 'Abierto', textClass: 'text-[#463100]', chipClass: 'bg-[#ffeab8] text-[#463100]' },
  closed: { key: 'closed', label: 'Cerradas', chipLabel: 'Cerrada', itemLabel: 'Cerrado', textClass: 'text-[#2a5c16]', chipClass: 'bg-[#e0ffd3] text-[#2a5c16]' },
  rejected: { key: 'rejected', label: 'Rechazadas', chipLabel: 'Rechazada', itemLabel: 'Rechazado', textClass: 'text-[#646464]', chipClass: 'bg-[#f7f7f7] text-[#646464]' },
};

const statusConfigs = Object.values(statusConfigByKey);
const avatarColors = ['bg-[#c8a064] text-[#001e39]', 'bg-[#24588b] text-white', 'bg-[#00b398] text-white', 'bg-[#532a0e] text-white'];

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'dd-mm-aaaa · 00:00';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'dd-mm-aaaa · 00:00';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()} · ${hours}:${minutes}`;
}

function daysLabel(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const days = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `${days} días hábiles`;
}

function dueDateFromDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function severityClassName(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('crítico') || normalized.includes('critico')) return 'bg-[#ffd0db] text-[#570b1d]';
  if (normalized.includes('alto')) return 'bg-[#ffe1cd] text-[#532a0e]';
  if (normalized.includes('moder')) return 'bg-[#fbe1d0] text-[#69462e]';
  return 'bg-[#e0ffd3] text-[#2a5c16]';
}

function resolveEvidenceContentUrl(evidence: InspectionDetailEvidenceResponse) {
  if (evidence.fileId) return `${apiOrigin}/api/files/${encodeURIComponent(evidence.fileId)}/content`;
  if (!evidence.url) return null;
  if (evidence.url.startsWith('http')) return evidence.url;
  if (evidence.url.startsWith('/api/')) return `${apiOrigin}${evidence.url}`;
  return evidence.url;
}

function evidenceLabel(evidence: InspectionDetailEvidenceResponse, index: number) {
  return evidence.title ?? evidence.description ?? `Evidencia ${index + 1}`;
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NA';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function allFindings(detail: InspectionDetailResponse) {
  return Object.values(detail.findings).flat();
}

function responsibleCompanyName(responsible: InspectionDetailResponsibleResponse, detail: InspectionDetailResponse) {
  if (responsible.companyName) return responsible.companyName;
  const finding = allFindings(detail).find((item) => item.responsibleUsers.some((user) => user.userId === responsible.userId));
  return finding?.responsibleCompanyName ?? detail.general.companyName ?? '—';
}

function primaryResponsibleCompany(detail: InspectionDetailResponse) {
  return allFindings(detail).find((item) => item.responsibleCompanyName)?.responsibleCompanyName ?? detail.general.companyName ?? '—';
}

function StatusChip({ status, count }: { status: StatusKey; count: number }) {
  const config = statusConfigByKey[status];
  return <span className={`inline-flex h-[16px] items-center gap-[3px] rounded-[5px] px-[7px] py-[2px] font-['Inter:Semi_Bold',sans-serif] text-[10px] font-semibold leading-none ${config.chipClass}`}><InspectionDetailStatusChipIcon status={status} />{count} {config.chipLabel}</span>;
}

function ProgressSummary({ counts, progressPercent }: { counts: Record<InspectionDetailFindingGroupKey, number>; progressPercent: number }) {
  return (
    <div className="flex shrink-0 flex-col items-start bg-[#143049] px-[14px] py-[10px] text-white">
      <div className="flex h-[12px] w-full items-start justify-between"><p className="font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-none text-[rgba(255,255,255,0.5)]">Progreso de observaciones</p><p className="font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-none text-white">{progressPercent}%</p></div>
      <div className="w-full pt-[5px]"><div className="h-[5px] w-full overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.15)]"><div className="h-[5px] rounded-[3px] bg-[#e0ffd3]" style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} /></div></div>
      <div className="flex w-full flex-wrap gap-[5px] pt-[6px]">{statusConfigs.map((item) => <StatusChip key={item.key} status={item.key} count={counts[item.key]} />)}</div>
    </div>
  );
}

function Tabs({ activeTab, onChange }: { activeTab: DetailTab; onChange: (tab: DetailTab) => void }) {
  const tabs: { id: DetailTab; label: string }[] = [{ id: 'observations', label: 'Observaciones' }, { id: 'followups', label: 'Seguimientos' }, { id: 'general', label: 'Datos generales' }];
  return <div className="grid shrink-0 border-b-2 border-[#e3e3e3] bg-[#f7f7f7]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>{tabs.map((tab) => <button key={tab.id} type="button" className={`h-[37px] border-b-2 px-[8px] text-[12px] font-semibold leading-none ${activeTab === tab.id ? 'border-[#c8a064] text-[#8e6e3e]' : 'border-transparent text-[#646464]'}`} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}

function metadataFor(record: InspectionDetailModalRecord) {
  if (record.metadataLine2) return <div className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]"><p>{record.metadataLine1}</p><p className="mt-[3px]">{record.metadataLine2}</p></div>;
  return <p className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]">{record.metadataLine1}</p>;
}

function StatusRow({ config, count, expanded, onToggle }: { config: StatusConfig; count: number; expanded: boolean; onToggle: () => void }) {
  return <button type="button" className="flex h-[56px] w-full items-center justify-between border-b border-[#e3e3e3] bg-white px-[14px] text-left" onClick={onToggle}><div className="flex items-center gap-[10px]"><InspectionDetailStatusRowIcon status={config.key} className="h-[11px] w-[13.75px]" /><p className={`text-[10px] font-bold uppercase leading-none tracking-[0.6px] ${config.textClass}`}>{config.label}</p><span className={`inline-flex h-[14px] min-w-[19px] items-center justify-center rounded-[8px] px-[7px] text-[10px] font-bold leading-none tracking-[0.6px] ${config.chipClass}`}>{count}</span></div><InspectionDetailCaretDownIcon className={expanded ? 'size-[16px] rotate-180' : 'size-[16px]'} /></button>;
}

function FindingPill({ children, className }: { children: string; className: string }) {
  return <span className={`inline-flex h-[19px] items-center rounded-[6px] px-[8px] text-[11px] font-bold leading-none ${className}`}>{children}</span>;
}

function FindingTextBlock({ title, children, bordered = false }: { title: string; children: string; bordered?: boolean }) {
  return (
    <div className={`flex w-full flex-col items-start rounded-[8px] bg-white px-[10px] py-[8px] ${bordered ? 'border border-[#e3e3e3]' : ''}`}>
      <p className="text-[9px] font-bold uppercase leading-none tracking-[1.5px] text-[#646464]">{title}</p>
      <p className="pt-[3px] text-[12px] font-normal leading-[16.8px] text-[#131313]">{children || '—'}</p>
    </div>
  );
}

function EvidencePreview({ title, evidences, afterClosed = false }: { title: string; evidences: InspectionDetailEvidenceResponse[]; afterClosed?: boolean }) {
  const firstEvidence = evidences[0];
  const firstUrl = firstEvidence ? resolveEvidenceContentUrl(firstEvidence) : null;
  return (
    <div className="flex h-[91px] min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-[#e3e3e3] bg-white p-px">
      <div className="flex h-[20px] items-center bg-[#001e39] px-[8px] py-[4px]"><p className="text-[9px] font-bold uppercase leading-none text-[rgba(255,255,255,0.7)]">{title}</p></div>
      <div className={`relative flex min-h-0 flex-1 flex-col items-center justify-center gap-[4px] overflow-hidden ${afterClosed ? 'bg-[#dafccb]' : 'bg-gradient-to-br from-[#e8f4fd] to-[#c8e6f0]'}`}>{firstEvidence && firstUrl ? <><img className="h-full w-full object-cover" src={firstUrl} alt={evidenceLabel(firstEvidence, 0)} /><span className="absolute bottom-[4px] left-[4px] rounded-[4px] bg-[rgba(0,30,57,0.78)] px-[5px] py-[2px] text-[9px] font-bold text-white">{evidences.length} evidencia{evidences.length === 1 ? '' : 's'}</span></> : evidences.length > 0 ? <><InspectionDetailImageIcon tone={afterClosed ? '#2a5c16' : '#24588b'} /><p className="text-[10px] font-semibold leading-none text-[#333]">{evidences.length} evidencia{evidences.length === 1 ? '' : 's'}</p></> : <p className="text-[11px] font-normal leading-none text-[#acacac]">Pendiente</p>}</div>
    </div>
  );
}

function FindingObservationCard({ inspectionId, item, actions }: FindingObservationCardProps) {
  const config = statusConfigByKey[item.statusGroup];
  const status = item.statusGroup;
  const actionDisabled = actions.isPending;

  function execute() {
    const value = window.prompt('Describe la acción ejecutada', item.proposedCorrectiveAction ?? '')?.trim();
    if (value === undefined) return;
    actions.executeFinding(inspectionId, item.findingId, value.length > 0 ? value : item.proposedCorrectiveAction ?? null);
  }

  function approve() {
    if (!window.confirm('¿Aprobar cierre de esta observación?')) return;
    actions.approveFinding(inspectionId, item.findingId);
  }

  function reject() {
    const value = window.prompt('Motivo de rechazo', item.rejectionReason ?? '')?.trim();
    if (value === undefined) return;
    actions.rejectFinding(inspectionId, item.findingId, value.length > 0 ? value : null);
  }

  function reschedule() {
    const value = window.prompt('Nuevo SLA en días', '7')?.trim();
    if (value === undefined) return;
    const days = Number(value);
    if (!Number.isFinite(days) || days < 0) return;
    actions.rescheduleFinding(inspectionId, item.findingId, dueDateFromDays(days));
  }

  return (
    <div className="rounded-[10px] border-[1.5px] border-[#e3e3e3] bg-[#f7f7f7] p-[13.5px] shadow-[0px_1px_1.5px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-[8px]"><FindingPill className="bg-[#e6f3ff] text-[#24588b]">{item.title}</FindingPill><FindingPill className={severityClassName(item.severityLabel)}>{item.severityLabel}</FindingPill></div>
        <span className={`inline-flex h-[19px] items-center gap-[4px] rounded-[6px] px-[8px] py-[4px] text-[10px] font-bold leading-none ${config.chipClass}`}><InspectionDetailStatusChipIcon status={status} />{config.itemLabel}</span>
      </div>
      <div className="flex flex-col gap-[4px] pt-[12px]">
        <FindingTextBlock title="Condición detectada" bordered>{item.condition ?? ''}</FindingTextBlock>
        <FindingTextBlock title="Medida correctiva propuesta">{item.proposedCorrectiveAction ?? ''}</FindingTextBlock>
        {status !== 'open' ? <FindingTextBlock title="Descripción de la acción tomada">{item.executedActionDescription ?? ''}</FindingTextBlock> : null}
        {status === 'rejected' ? <FindingTextBlock title="Motivo de rechazo">{item.rejectionReason ?? ''}</FindingTextBlock> : null}
        <div className="flex gap-[4px] pt-[8px]"><EvidencePreview title="Antes" evidences={item.beforeEvidence} /><EvidencePreview title="Después" evidences={item.afterEvidence} afterClosed={status === 'closed' || status === 'executed' || status === 'rejected'} /></div>
        {status === 'open' ? <div className="mt-[4px] flex min-h-[64px] items-center justify-between rounded-[10px] border-[1.5px] border-[#d1d1d1] bg-[#f7f7f7] p-[15.5px]"><div><p className="w-[78px] text-[9px] font-bold uppercase leading-none tracking-[0.63px] text-[#333]">SLA calculado</p><p className="pt-[2px] text-[20px] font-bold leading-[20px] text-[#532a0e]">{daysLabel(item.dueAt)}</p></div><button type="button" className="flex h-[40px] items-center justify-center rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] text-[13px] font-semibold text-[#333] disabled:opacity-50" disabled={actionDisabled} onClick={reschedule}>Reasignar SLA</button></div> : <div className="mt-[4px] flex h-[33px] items-center justify-between rounded-[8px] bg-white px-[12px] py-[9px]"><p className="text-[12px] font-medium leading-none text-[#646464]">Fecha de estado</p><p className="text-right text-[11px] font-bold leading-none text-[#646464]">{formatDate(item.closedAt ?? item.executedAt ?? item.rejectedAt)}</p></div>}
        {status === 'open' ? <button type="button" className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#c8a064] px-[12px] text-[15px] font-bold text-white shadow-[0px_2px_5px_rgba(200,160,100,0.3)] disabled:opacity-50" disabled={actionDisabled} onClick={execute}>Ejecutar observación</button> : null}
        {status === 'executed' ? <div className="flex items-center gap-[8px] rounded-[8px] bg-white px-[12px] py-[9px]"><button type="button" className="flex h-[40px] items-center justify-center gap-[5px] rounded-[9px] border-2 border-[#c4365a] bg-white px-[16px] py-[2px] text-[12px] font-bold text-[#570b1d] disabled:opacity-50" disabled={actionDisabled} onClick={reject}><InspectionDetailRejectIcon />Rechazar</button><button type="button" className="flex h-[40px] min-w-0 flex-1 items-center justify-center gap-[5px] rounded-[9px] bg-[#3a9b3a] px-[12px] text-[12px] font-bold text-white disabled:opacity-50" disabled={actionDisabled} onClick={approve}><InspectionDetailApproveIcon />Aprobar cierre</button></div> : null}
        {status === 'rejected' ? <button type="button" className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#c8a064] px-[12px] text-[15px] font-bold text-white shadow-[0px_2px_5px_rgba(200,160,100,0.3)] disabled:opacity-50" disabled={actionDisabled} onClick={execute}>Ejecutar observación rechazada</button> : null}
      </div>
    </div>
  );
}

function FindingObservationsPanel({ inspectionId, items, actions }: { inspectionId: string; items: InspectionDetailFindingItemResponse[]; actions: ReturnType<typeof useInspectionFindingActions> }) {
  if (items.length === 0) return <div className="flex shrink-0 flex-col bg-white px-[14px] pb-[24px] pt-[14px]"><div className="rounded-[10px] border border-dashed border-[#d1d1d1] bg-[#f7f7f7] px-[14px] py-[18px] text-center text-[12px] font-medium text-[#646464]">Sin observaciones en este estado</div></div>;
  return <div className="flex shrink-0 flex-col gap-[24px] bg-white px-[14px] pb-[24px] pt-[14px]">{items.map((item) => <FindingObservationCard key={item.findingId} inspectionId={inspectionId} item={item} actions={actions} />)}</div>;
}

function DetailRows({ inspectionId, counts, findings, actions }: DetailRowsProps) {
  const defaultStatus = counts.open > 0 ? 'open' : counts.executed > 0 ? 'executed' : counts.closed > 0 ? 'closed' : 'rejected';
  const [expandedStatus, setExpandedStatus] = useState<StatusKey | null>(defaultStatus);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      {statusConfigs.map((config) => {
        const expanded = expandedStatus === config.key;
        const panel = expanded ? <FindingObservationsPanel inspectionId={inspectionId} items={findings[config.key]} actions={actions} /> : null;
        return <div key={config.key}><StatusRow config={config} count={counts[config.key]} expanded={expanded} onToggle={() => setExpandedStatus((current) => current === config.key ? null : config.key)} />{panel}</div>;
      })}
    </div>
  );
}

function FollowupTimelineMarker({ completed }: { completed: boolean }) {
  return <div className={`flex size-[24px] shrink-0 items-center justify-center rounded-[12px] text-[10px] font-normal leading-none ${completed ? 'bg-[#6cc24a] text-white' : 'bg-[#e3e3e3] text-[#acacac]'}`}>{completed ? '✓' : '○'}</div>;
}

function FollowupsPanel({ detail }: { detail: InspectionDetailResponse }) {
  const initialStep = { followupId: 'initial', title: 'Inspección inicial', performedAt: detail.general.scheduledAt, description: `${allFindings(detail).length} observaciones detectadas`, performedByName: null, completed: true };
  const steps = [initialStep, ...detail.followups];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-[14px] py-[20px]">
      <div className="flex items-center gap-[6px]"><InspectionDetailFollowupIcon /><p className="text-[11px] font-bold uppercase leading-none tracking-[0.55px] text-[#646464]">Historial de seguimientos</p></div>
      <div className="pt-[10px]">{steps.map((step, index) => <div key={step.followupId} className={`relative flex w-full gap-[12px] ${index === steps.length - 1 ? '' : 'pb-[16px]'}`}><FollowupTimelineMarker completed={step.completed} />{index < steps.length - 1 ? <div className="absolute left-[11px] top-[24px] h-[38px] w-[2px] bg-[#e3e3e3]" /> : null}<div className="min-w-0 flex-1 pt-[2px]"><p className="text-[12px] font-bold leading-none text-[#131313]">{step.title}</p><p className="pt-[4px] text-[11px] font-normal leading-none text-[#646464]">{formatDate(step.performedAt)}</p><p className="pt-[5px] text-[11px] font-normal leading-[14px] text-[#646464]">{step.description}</p>{step.performedByName ? <p className="pt-[4px] text-[11px] font-semibold leading-none text-[#646464]">{step.performedByName}</p> : null}</div></div>)}</div>
    </div>
  );
}

function GeneralSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <section className="w-full overflow-hidden rounded-[12px] border border-[#e3e3e3] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex h-[29px] items-center gap-[6px] border-b border-[#e3e3e3] bg-[#f7f7f7] px-[12px]"><span className="flex h-[10px] w-[12.5px] items-center justify-center">{icon}</span><p className="text-[10px] font-bold uppercase leading-none tracking-[0.5px] text-[#646464]">{title}</p></div>{children}</section>;
}

function GeneralInfoRows({ rows }: { rows: { label: string; value: string; mono?: boolean }[] }) {
  return <div>{rows.map((row, index) => <div key={row.label} className={`flex items-center justify-between px-[12px] py-[9px] ${index < rows.length - 1 ? 'border-b border-[#e3e3e3]' : ''}`}><p className="text-[12px] font-medium leading-none text-[#646464]">{row.label}</p><p className={`max-w-[190px] truncate text-right text-[12px] font-bold leading-none text-[#131313] ${row.mono ? "font-['Cousine:Bold',monospace] text-[11px]" : ''}`}>{row.value}</p></div>)}</div>;
}

function EvidenceGallery({ evidences }: { evidences: InspectionDetailEvidenceResponse[] }) {
  const evidence = evidences[0];
  const url = evidence ? resolveEvidenceContentUrl(evidence) : null;
  return <div className="relative h-[80px] overflow-hidden rounded-[8px] bg-[linear-gradient(165deg,#1e3050_0%,#0f1f35_100%)]">{evidence && url ? <img className="h-full w-full object-cover" src={url} alt={evidenceLabel(evidence, 0)} /> : null}<span className="absolute left-[8px] top-[6px] rounded-[4px] bg-[rgba(0,0,0,0.55)] px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[1.5px] text-white">Foto general</span><span className="absolute bottom-[6px] right-[8px] rounded-[4px] bg-[rgba(0,0,0,0.5)] px-[6px] py-[2px] text-[9px] text-[rgba(255,255,255,0.8)]">{formatDateTime(evidence?.capturedAt)}</span>{!url ? <p className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">{evidences.length} evidencia{evidences.length === 1 ? '' : 's'} general{evidences.length === 1 ? '' : 'es'}</p> : null}</div>;
}

function GeneralObservationSummary({ items }: { items: InspectionDetailFindingItemResponse[] }) {
  return (
    <GeneralSection icon={<InspectionDetailListIcon />} title={`Observaciones (${items.length})`}>
      <div>
        {items.length > 0 ? items.map((item, index) => <div key={item.findingId} className={`flex flex-col gap-[8px] px-[12px] pb-[10px] pt-[9px] ${index < items.length - 1 ? 'border-b border-[#e3e3e3]' : ''}`}><div className="flex items-center gap-[8px]"><FindingPill className="bg-[#e6f3ff] text-[#24588b]">{item.title}</FindingPill><FindingPill className={severityClassName(item.severityLabel)}>{item.severityLabel}</FindingPill></div><p className="text-[12px] font-normal leading-[16.8px] text-[#131313]">{item.condition ?? '—'}</p><div className="flex items-center justify-between border-t border-[#e3e3e3] pt-[10px]"><p className="text-[12px] font-medium text-[#646464]">SLA calculado</p><p className="text-right text-[12px] font-bold text-[#131313]">{daysLabel(item.dueAt)}</p></div></div>) : <p className="px-[12px] py-[14px] text-center text-[12px] text-[#646464]">Sin observaciones</p>}
      </div>
    </GeneralSection>
  );
}

function PersonAddIcon() {
  return <svg className="h-[12px] w-[15px] shrink-0" viewBox="0 0 15 12" fill="none" aria-hidden><path d="M5.1 5.8c1.5 0 2.7-1.2 2.7-2.7S6.6.4 5.1.4 2.4 1.6 2.4 3.1s1.2 2.7 2.7 2.7Zm0 1.2C2.5 7 .5 8.4.5 10.4c0 .5.4.9.9.9h7.4c.5 0 .9-.4.9-.9C9.7 8.4 7.7 7 5.1 7Zm6.6-3.7V1.4h1.2v1.9h1.8v1.2h-1.8v1.9h-1.2V4.5H9.9V3.3h1.8Z" fill="#24588b" /></svg>;
}

function Avatar({ name, index, large = false }: { name: string; index: number; large?: boolean }) {
  return <div className={`flex shrink-0 items-center justify-center rounded-full font-bold ${large ? 'size-[36px] text-[13px]' : 'size-[32px] text-[12px]'} ${avatarColors[index % avatarColors.length]}`}>{initials(name)}</div>;
}

function ResponsibleRow({ responsible, index }: { responsible: InspectionDetailResponsibleResponse; index: number }) {
  return <div className={`flex items-center gap-[10px] px-[12px] py-[10px] ${index > 0 ? 'border-t border-[#e3e3e3]' : ''}`}><Avatar name={responsible.fullName} index={index} /><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold leading-none text-[#131313]">{responsible.fullName}</p><p className="pt-[3px] text-[11px] font-normal leading-none text-[#646464]">{responsible.position ?? 'Sin cargo'}</p></div>{responsible.currentUser ? <span className="inline-flex h-[16px] items-center rounded-[5px] bg-[#c5fff6] px-[7px] py-[2px] text-[10px] font-bold leading-none text-[#00b398]">Tú</span> : null}</div>;
}

function CheckCircle({ active }: { active: boolean }) {
  if (active) return <span className="flex size-[22px] items-center justify-center rounded-[11px] bg-[#00b398] text-[14px] font-bold leading-none text-white">✓</span>;
  return <span className="size-[22px] rounded-[11px] border-[2px] border-[#d1d1d1] bg-white" />;
}

function ReassignResponsibleSheet({ detail, candidates, companyName, onClose }: { detail: InspectionDetailResponse; candidates: InspectionDetailResponsibleResponse[]; companyName: string; onClose: () => void }) {
  const [selectedIds, setSelectedIds] = useState(() => candidates.map((candidate) => candidate.userId));

  function toggle(userId: string) {
    setSelectedIds((current) => current.includes(userId) ? current.filter((item) => item !== userId) : [...current, userId]);
  }

  return (
    <div className="absolute bottom-[76px] left-[14px] right-[14px] z-30 flex flex-col gap-[24px] rounded-[16px] bg-white px-[14px] pb-[24px] pt-[12px] shadow-[0_4px_14px_rgba(19,19,19,0.24)]">
      <h3 className="text-[14px] font-bold leading-none text-[#131313]">Reasignar hallazgo · {companyName}</h3>
      <div className="max-h-[280px] overflow-hidden">
        {candidates.length > 0 ? candidates.map((candidate, index) => {
          const active = selectedIds.includes(candidate.userId);
          return <button key={candidate.userId} type="button" className={`flex h-[61px] w-full items-center gap-[10px] px-[16px] text-left ${index < candidates.length - 1 ? 'border-b border-[#e3e3e3]' : ''}`} onClick={() => toggle(candidate.userId)}><Avatar name={candidate.fullName} index={index} large /><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold leading-none text-[#131313]">{candidate.fullName}</p><p className="truncate pt-[3px] text-[11px] font-normal leading-none text-[#646464]">{candidate.position ?? responsibleCompanyName(candidate, detail)}</p></div><CheckCircle active={active} /></button>;
        }) : <p className="rounded-[8px] border border-dashed border-[#d1d1d1] bg-[#f7f7f7] px-[12px] py-[18px] text-center text-[12px] text-[#646464]">Sin compañeros disponibles para reasignar</p>}
      </div>
      <div className="flex gap-[8px]"><button type="button" className="flex h-[44px] min-w-0 flex-1 items-center justify-center rounded-[14px] border-2 border-[#c8a064] bg-white px-[20px] py-[2px] text-[13px] font-bold text-[#c8a064]" onClick={onClose}>Cancelar</button><button type="button" className="flex h-[44px] min-w-0 flex-1 items-center justify-center rounded-[14px] bg-[#c8a064] px-[12px] py-[13px] text-[15px] font-bold text-white drop-shadow-[0px_2px_5px_rgba(200,160,100,0.3)] disabled:opacity-50" disabled={selectedIds.length === 0} onClick={onClose}>Reasignar</button></div>
    </div>
  );
}

function ResponsiblesPanel({ detail, onOpenReassign }: { detail: InspectionDetailResponse; onOpenReassign: () => void }) {
  const responsibles = detail.general.responsibles;
  const companyName = primaryResponsibleCompany(detail);
  return (
    <GeneralSection icon={<InspectionDetailPersonIcon />} title="Responsables">
      <div className="flex items-center justify-between border-b border-[#e3e3e3] px-[12px] py-[9px]"><p className="text-[12px] font-medium leading-none text-[#646464]">EECC</p><p className="max-w-[160px] truncate text-right text-[11px] font-bold uppercase leading-none text-[#646464]">{companyName}</p></div>
      <div className="border-b border-[#e3e3e3] bg-white">{responsibles.length > 0 ? responsibles.map((responsible, index) => <ResponsibleRow key={responsible.userId} responsible={responsible} index={index} />) : <p className="px-[12px] py-[14px] text-center text-[12px] text-[#646464]">Sin responsables asignados</p>}</div>
      <div className="px-[12px] py-[9px]"><button type="button" className="flex h-[42px] w-full items-center justify-center gap-[6px] rounded-[8px] border-[1.5px] border-dashed border-[#d1d1d1] bg-[#f7f7f7] p-[1.5px] text-[12px] font-semibold text-[#24588b]" onClick={onOpenReassign}><PersonAddIcon />Reasignar a otro compañero {companyName}</button></div>
    </GeneralSection>
  );
}

function GeneralPanel({ detail, onOpenReassign }: { detail: InspectionDetailResponse; onOpenReassign: () => void }) {
  const general = detail.general;
  const items = allFindings(detail);
  const locationText = general.latitude && general.longitude ? `${general.latitude} · ${general.longitude}` : general.locationLabel ?? '—';
  const locationRows = [
    { label: 'Área · Sector', value: [general.areaName, general.sectorName].filter(Boolean).join(' · ') || '—' },
    { label: 'Fecha', value: formatDate(general.scheduledAt) },
    { label: 'Tipo', value: detail.header.kind === 'checklist' ? 'Checklist normativo' : 'Hallazgo' },
    { label: 'Ubicación UTM', value: locationText, mono: true },
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-[14px] pb-[20px] pt-[14px]">
      <div className="flex flex-col gap-[12px]">
        <GeneralSection icon={<InspectionDetailPersonIcon />} title="Quién realizó la inspección"><GeneralInfoRows rows={[{ label: 'Nombre', value: general.inspectorName ?? '—' }, { label: 'Empresa', value: general.inspectorCompanyName ?? general.companyName ?? '—' }]} /></GeneralSection>
        <GeneralSection icon={<InspectionDetailLocationIcon />} title="Donde y cuándo"><GeneralInfoRows rows={locationRows} /></GeneralSection>
        <GeneralSection icon={<InspectionDetailCameraIcon />} title="Fotografía general de la inspección"><div className="px-[12px] py-[9px]"><EvidenceGallery evidences={general.generalEvidence} /></div></GeneralSection>
        <GeneralObservationSummary items={items} />
        <ResponsiblesPanel detail={detail} onOpenReassign={onOpenReassign} />
      </div>
    </div>
  );
}

function DetailContent({ activeTab, detail, actions, onOpenReassign }: { activeTab: DetailTab; detail: InspectionDetailResponse; actions: ReturnType<typeof useInspectionFindingActions>; onOpenReassign: () => void }) {
  if (activeTab === 'followups') return <FollowupsPanel detail={detail} />;
  if (activeTab === 'general') return <GeneralPanel detail={detail} onOpenReassign={onOpenReassign} />;
  return <DetailRows inspectionId={detail.header.inspectionId} counts={detail.header.counts} findings={detail.findings} actions={actions} />;
}

function DownloadPdfButton({ inspectionId }: { inspectionId: string }) {
  return <div className="shrink-0 border-t border-[#e3e3e3] bg-white px-[20px] pb-[14px] pt-[15px]"><button type="button" className="flex h-[40px] w-full items-center justify-center gap-[6px] rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] font-['Inter:Semi_Bold',sans-serif] text-[13px] font-semibold leading-none text-[#333]" onClick={() => window.open(`${apiOrigin}/api/inspections/${inspectionId}/export/pdf`, '_blank')}><InspectionDetailPdfIcon />Descargar PDF</button></div>;
}

export function InspectionDetailRealDataModal({ open, record, detail, onClose }: { open: boolean; record: InspectionDetailModalRecord; detail: InspectionDetailResponse; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('observations');
  const [reassignOpen, setReassignOpen] = useState(false);
  const actions = useInspectionFindingActions();
  const companyName = primaryResponsibleCompany(detail);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <section className="relative flex h-[calc(100vh-32px)] max-h-[692px] w-[360px] max-w-[calc(100vw-40px)] flex-col justify-between overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]" role="dialog" aria-modal="true" aria-labelledby="inspection-detail-title">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 rounded-t-[16px] bg-white px-[14px] py-[12px]"><div className="flex items-center gap-[12px]"><div className="min-w-0 flex-1 font-['Inter:Bold',sans-serif] font-bold"><p className="whitespace-nowrap text-[13px] leading-none text-[#001e39]">{record.id}</p><h2 id="inspection-detail-title" className="mt-[5px] text-[16px] font-bold leading-[22px] tracking-[0.32px] text-[#2a2a2a]">{record.title}</h2><div className="mt-[4px]">{metadataFor(record)}</div></div><button type="button" className="flex size-[32px] shrink-0 items-center justify-center" onClick={onClose} aria-label="Cerrar detalle"><InspectionDetailCloseIcon /></button></div></div>
            <ProgressSummary counts={detail.header.counts} progressPercent={detail.header.progressPercent} />
            <Tabs activeTab={activeTab} onChange={setActiveTab} />
            <DetailContent activeTab={activeTab} detail={detail} actions={actions} onOpenReassign={() => setReassignOpen(true)} />
          </div>
          <DownloadPdfButton inspectionId={detail.header.inspectionId} />
          {reassignOpen ? <ReassignResponsibleSheet detail={detail} candidates={detail.general.responsibles} companyName={companyName} onClose={() => setReassignOpen(false)} /> : null}
        </section>
      </div>
    </div>
  );
}
