import { useState, type ReactNode } from 'react';
import type {
  InspectionDetailEvidenceResponse,
  InspectionDetailFindingGroupKey,
  InspectionDetailFindingItemResponse,
  InspectionDetailResponse,
  InspectionDetailResponsibleResponse,
} from '@aurelia/contracts';
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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const apiOrigin = API_URL.replace(/\/api\/?$/, '');

const statusConfigByKey: Record<StatusKey, StatusConfig> = {
  executed: { key: 'executed', label: 'Ejecutadas', chipLabel: 'Ejecutada', itemLabel: 'Ejecutado', textClass: 'text-[#570b1d]', chipClass: 'bg-[#ffd0db] text-[#570b1d]' },
  open: { key: 'open', label: 'Abiertas', chipLabel: 'Abiertas', itemLabel: 'Abierto', textClass: 'text-[#463100]', chipClass: 'bg-[#ffeab8] text-[#463100]' },
  closed: { key: 'closed', label: 'Cerradas', chipLabel: 'Cerrada', itemLabel: 'Cerrado', textClass: 'text-[#2a5c16]', chipClass: 'bg-[#e0ffd3] text-[#2a5c16]' },
  rejected: { key: 'rejected', label: 'Rechazadas', chipLabel: 'Rechazada', itemLabel: 'Rechazado', textClass: 'text-[#646464]', chipClass: 'bg-[#f7f7f7] text-[#646464]' },
};

const statusConfigs = Object.values(statusConfigByKey);

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function daysLabel(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const days = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `${days} días`;
}

function dueDateFromDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function severityClassName(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('crítico') || normalized.includes('critico') || normalized.includes('alto')) return 'bg-[#ffd0db] text-[#570b1d]';
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
  return <div className="grid shrink-0 border-b-2 border-[#e3e3e3] bg-[#f7f7f7]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>{tabs.map((tab) => <button key={tab.id} type="button" className={`h-[42px] border-b-[3px] px-[8px] pt-[2px] text-[12px] font-bold leading-none ${activeTab === tab.id ? 'border-[#c8a064] bg-white text-[#001e39]' : 'border-transparent text-[#646464]'}`} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}

function metadataFor(record: InspectionDetailModalRecord) {
  if (record.metadataLine2) return <div className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]"><p>{record.metadataLine1}</p><p className="mt-[3px]">{record.metadataLine2}</p></div>;
  return <p className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]">{record.metadataLine1}</p>;
}

function StatusRow({ config, count, expanded, onToggle }: { config: StatusConfig; count: number; expanded: boolean; onToggle: () => void }) {
  return <button type="button" className="flex h-[46px] w-full items-center justify-between border-b border-[#e3e3e3] bg-white px-[14px] text-left" onClick={onToggle}><div className="flex items-center gap-[8px]"><InspectionDetailStatusRowIcon status={config.key} className="h-[14px] w-[17.5px]" /><p className={`text-[13px] font-bold leading-none ${config.textClass}`}>{config.label} ({count})</p></div><InspectionDetailCaretDownIcon className={expanded ? 'size-[16px] rotate-180' : 'size-[16px]'} /></button>;
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
  const firstEvidence = evidences[0] ?? null;
  const firstUrl = firstEvidence ? resolveEvidenceContentUrl(firstEvidence) : null;
  return (
    <div className="flex h-[91px] min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-[#e3e3e3] bg-white p-px">
      <div className="flex h-[20px] items-center bg-[#001e39] px-[8px] py-[4px]"><p className="text-[9px] font-bold uppercase leading-none text-[rgba(255,255,255,0.7)]">{title}</p></div>
      <div className={`relative flex min-h-0 flex-1 flex-col items-center justify-center gap-[4px] overflow-hidden ${afterClosed ? 'bg-[#dafccb]' : 'bg-gradient-to-br from-[#e8f4fd] to-[#c8e6f0]'}`}>{firstUrl ? <><img className="h-full w-full object-cover" src={firstUrl} alt={evidenceLabel(firstEvidence, 0)} /><span className="absolute bottom-[4px] left-[4px] rounded-[4px] bg-[rgba(0,30,57,0.78)] px-[5px] py-[2px] text-[9px] font-bold text-white">{evidences.length} evidencia{evidences.length === 1 ? '' : 's'}</span></> : evidences.length > 0 ? <><InspectionDetailImageIcon tone={afterClosed ? '#2a5c16' : '#24588b'} /><p className="text-[10px] font-semibold leading-none text-[#333]">{evidences.length} evidencia{evidences.length === 1 ? '' : 's'}</p></> : <p className="text-[11px] font-normal leading-none text-[#acacac]">Pendiente</p>}</div>
    </div>
  );
}

function EvidenceGallery({ evidences }: { evidences: InspectionDetailEvidenceResponse[] }) {
  if (evidences.length === 0) return <div className="flex h-[80px] items-center justify-center rounded-[8px] bg-[linear-gradient(165deg,#1e3050_0%,#0f1f35_100%)]"><p className="text-[11px] font-semibold text-white">0 evidencias generales</p></div>;
  return <div className="grid grid-cols-2 gap-[6px]">{evidences.map((evidence, index) => { const url = resolveEvidenceContentUrl(evidence); return <div key={evidence.evidenceId} className="relative h-[80px] overflow-hidden rounded-[8px] bg-[#dceef8]">{url ? <img className="h-full w-full object-cover" src={url} alt={evidenceLabel(evidence, index)} /> : <div className="flex h-full w-full items-center justify-center"><InspectionDetailImageIcon tone="#24588b" /></div>}<span className="absolute bottom-[4px] left-[4px] max-w-[calc(100%-8px)] truncate rounded-[4px] bg-[rgba(0,30,57,0.78)] px-[5px] py-[2px] text-[9px] font-bold text-white">{evidenceLabel(evidence, index)}</span></div>; })}</div>;
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
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-[14px] py-[20px]">
      <div className="flex items-center gap-[6px]"><InspectionDetailFollowupIcon /><p className="text-[11px] font-bold uppercase leading-none tracking-[0.55px] text-[#646464]">Historial de seguimientos</p></div>
      <div className="pt-[10px]">{detail.followups.length > 0 ? detail.followups.map((step, index) => <div key={step.followupId} className={`relative flex w-full gap-[12px] ${index === detail.followups.length - 1 ? '' : 'pb-[16px]'}`}><FollowupTimelineMarker completed={step.completed} />{index < detail.followups.length - 1 ? <div className="absolute left-[11px] top-[24px] h-[23px] w-[2px] bg-[#e3e3e3]" /> : null}<div className="min-w-0 flex-1 pt-[2px]"><p className="text-[12px] font-bold leading-none text-[#131313]">{step.title}</p><p className="pt-[4px] text-[11px] font-normal leading-none text-[#646464]">{formatDate(step.performedAt)}</p><p className="pt-[5px] text-[11px] font-normal leading-[14px] text-[#646464]">{step.description}</p>{step.performedByName ? <p className="pt-[4px] text-[11px] font-semibold leading-none text-[#646464]">{step.performedByName}</p> : null}</div></div>) : <p className="rounded-[10px] border border-dashed border-[#d1d1d1] bg-[#f7f7f7] px-[14px] py-[18px] text-center text-[12px] font-medium text-[#646464]">Sin seguimientos registrados</p>}</div>
    </div>
  );
}

function GeneralSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <section className="w-full overflow-hidden rounded-[12px] border border-[#e3e3e3] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><div className="flex h-[29px] items-center gap-[6px] border-b border-[#e3e3e3] bg-[#f7f7f7] px-[12px]"><span className="flex h-[10px] w-[12.5px] items-center justify-center">{icon}</span><p className="text-[10px] font-bold uppercase leading-none tracking-[0.5px] text-[#646464]">{title}</p></div>{children}</section>;
}

function GeneralInfoRows({ rows }: { rows: { label: string; value: string }[] }) {
  return <div>{rows.map((row, index) => <div key={row.label} className={`flex items-center justify-between px-[12px] py-[9px] ${index < rows.length - 1 ? 'border-b border-[#e3e3e3]' : ''}`}><p className="text-[12px] font-medium leading-none text-[#646464]">{row.label}</p><p className="text-right text-[12px] font-bold leading-none text-[#131313]">{row.value}</p></div>)}</div>;
}

function responsibleCompanyName(responsible: InspectionDetailResponsibleResponse, detail: InspectionDetailResponse) {
  if (responsible.companyName) return responsible.companyName;
  const finding = Object.values(detail.findings).flat().find((item) => item.responsibleUsers.some((user) => user.userId === responsible.userId));
  return finding?.responsibleCompanyName ?? '—';
}

function ResponsiblesPanel({ detail }: { detail: InspectionDetailResponse }) {
  const responsibles = detail.general.responsibles;
  return (
    <GeneralSection icon={<InspectionDetailPersonIcon />} title={`Responsables (${responsibles.length})`}>
      <div className="px-[12px] py-[10px]">
        {responsibles.length > 0 ? <div className="flex flex-col gap-[8px]">{responsibles.map((responsible) => <div key={responsible.userId} className="rounded-[8px] border border-[#e3e3e3] bg-[#f7f7f7] px-[10px] py-[9px]"><p className="text-[12px] font-bold leading-none text-[#131313]">{responsible.fullName}</p><p className="pt-[4px] text-[11px] font-normal leading-none text-[#646464]">{responsible.position ?? 'Sin cargo'} · {responsibleCompanyName(responsible, detail)}</p>{responsible.currentUser ? <span className="mt-[7px] inline-flex rounded-[5px] bg-[#e6f3ff] px-[7px] py-[2px] text-[10px] font-bold text-[#24588b]">Usuario actual</span> : null}</div>)}</div> : <p className="rounded-[8px] border border-dashed border-[#d1d1d1] bg-[#f7f7f7] px-[10px] py-[14px] text-center text-[12px] text-[#646464]">Sin responsables asignados</p>}
        <button type="button" className="mt-[10px] flex h-[40px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] text-[13px] font-semibold text-[#333]" onClick={() => window.alert('Reasignación real pendiente de endpoint específico de responsables.')}>Reasignar responsables</button>
      </div>
    </GeneralSection>
  );
}

function GeneralPanel({ detail }: { detail: InspectionDetailResponse }) {
  const general = detail.general;
  const locationRows = [
    { label: 'Área · Sector', value: [general.areaName, general.sectorName].filter(Boolean).join(' · ') || '—' },
    { label: 'Fecha', value: formatDate(general.scheduledAt) },
    { label: 'Tipo', value: detail.header.kind === 'checklist' ? 'Checklist normativo' : 'Hallazgo' },
    { label: 'Plantilla', value: general.templateName ?? '—' },
    { label: 'Código', value: general.templateCode ?? '—' },
    { label: 'Ubicación', value: general.locationLabel ?? '—' },
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-[14px] pb-[20px] pt-[14px]">
      <div className="flex flex-col gap-[12px]">
        <GeneralSection icon={<InspectionDetailPersonIcon />} title="Quién realizó la inspección"><GeneralInfoRows rows={[{ label: 'Nombre', value: general.inspectorName ?? '—' }, { label: 'Empresa', value: general.inspectorCompanyName ?? general.companyName ?? '—' }]} /></GeneralSection>
        <ResponsiblesPanel detail={detail} />
        <GeneralSection icon={<InspectionDetailLocationIcon />} title="Donde y cuándo"><GeneralInfoRows rows={locationRows} /></GeneralSection>
        <GeneralSection icon={<InspectionDetailCameraIcon />} title="Fotografía general de la inspección"><div className="px-[12px] py-[9px]"><EvidenceGallery evidences={general.generalEvidence} /></div></GeneralSection>
        <GeneralSection icon={<InspectionDetailListIcon />} title={`Observaciones (${Object.values(detail.header.counts).reduce((sum, value) => sum + value, 0)})`}><div>{Object.values(detail.findings).flat().map((item, index, items) => <div key={item.findingId} className={`flex flex-col gap-[8px] px-[12px] py-[10px] ${index === items.length - 1 ? '' : 'border-b border-[#e3e3e3]'}`}><div className="flex items-center gap-[8px]"><FindingPill className="bg-[#e6f3ff] text-[#24588b]">{item.title}</FindingPill><FindingPill className={severityClassName(item.severityLabel)}>{item.severityLabel}</FindingPill></div><p className="text-[12px] font-normal leading-[16.8px] text-[#131313]">{item.condition ?? '—'}</p></div>)}</div></GeneralSection>
      </div>
    </div>
  );
}

function DetailContent({ activeTab, detail, actions }: { activeTab: DetailTab; detail: InspectionDetailResponse; actions: ReturnType<typeof useInspectionFindingActions> }) {
  if (activeTab === 'followups') return <FollowupsPanel detail={detail} />;
  if (activeTab === 'general') return <GeneralPanel detail={detail} />;
  return <DetailRows inspectionId={detail.header.inspectionId} counts={detail.header.counts} findings={detail.findings} actions={actions} />;
}

function DownloadPdfButton({ inspectionId }: { inspectionId: string }) {
  return <div className="shrink-0 border-t border-[#e3e3e3] bg-white px-[20px] pb-[14px] pt-[15px]"><button type="button" className="flex h-[40px] w-full items-center justify-center gap-[6px] rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] font-['Inter:Semi_Bold',sans-serif] text-[13px] font-semibold leading-none text-[#333]" onClick={() => window.open(`${apiOrigin}/api/inspections/${inspectionId}/export/pdf`, '_blank')}><InspectionDetailPdfIcon />Descargar PDF</button></div>;
}

export function InspectionDetailRealDataModal({ open, record, detail, onClose }: { open: boolean; record: InspectionDetailModalRecord; detail: InspectionDetailResponse; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('observations');
  const actions = useInspectionFindingActions();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <section className="relative flex h-[calc(100vh-32px)] max-h-[692px] w-[360px] max-w-[calc(100vw-40px)] flex-col justify-between overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]" role="dialog" aria-modal="true" aria-labelledby="inspection-detail-title">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 rounded-t-[16px] bg-white px-[14px] py-[12px]"><div className="flex items-center gap-[12px]"><div className="min-w-0 flex-1 font-['Inter:Bold',sans-serif] font-bold"><p className="whitespace-nowrap text-[13px] leading-none text-[#001e39]">{record.id}</p><h2 id="inspection-detail-title" className="mt-[5px] text-[16px] font-bold leading-[22px] tracking-[0.32px] text-[#2a2a2a]">{record.title}</h2><div className="mt-[4px]">{metadataFor(record)}</div></div><button type="button" className="flex size-[32px] shrink-0 items-center justify-center" onClick={onClose} aria-label="Cerrar detalle"><InspectionDetailCloseIcon /></button></div></div>
            <ProgressSummary counts={detail.header.counts} progressPercent={detail.header.progressPercent} />
            <Tabs activeTab={activeTab} onChange={setActiveTab} />
            <DetailContent activeTab={activeTab} detail={detail} actions={actions} />
          </div>
          <DownloadPdfButton inspectionId={detail.header.inspectionId} />
        </section>
      </div>
    </div>
  );
}
