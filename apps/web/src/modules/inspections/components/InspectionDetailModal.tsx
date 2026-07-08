import { useState, type ReactNode } from 'react';
import {
  InspectionDetailCaretDownIcon,
  InspectionDetailCloseIcon,
  InspectionDetailImageIcon,
  InspectionDetailPdfIcon,
  InspectionDetailStatusChipIcon,
  InspectionDetailStatusRowIcon,
  type InspectionDetailIconStatus,
} from './InspectionDetailIcons';

export type InspectionDetailModalKind = 'finding' | 'checklist';

export type InspectionDetailModalRecord = {
  id: string;
  title: string;
  kind: InspectionDetailModalKind;
  metadataLine1: string;
  metadataLine2?: string;
  progressPercent?: number;
  counts?: Partial<Record<'executed' | 'open' | 'closed' | 'rejected', number>>;
};

type InspectionDetailModalProps = {
  open: boolean;
  record: InspectionDetailModalRecord | null;
  onClose: () => void;
};

type StatusKey = InspectionDetailIconStatus;

type StatusConfig = {
  key: StatusKey;
  label: string;
  chipLabel: string;
  itemLabel: string;
  textClass: string;
  chipClass: string;
};

type OpenFindingObservation = {
  idLabel: string;
  severityLabel: string;
  severityClassName: string;
};

const statusConfigByKey: Record<StatusKey, StatusConfig> = {
  executed: { key: 'executed', label: 'Ejecutadas', chipLabel: 'Ejecutada', itemLabel: 'Ejecutado', textClass: 'text-[#570b1d]', chipClass: 'bg-[#ffd0db] text-[#570b1d]' },
  open: { key: 'open', label: 'Abiertas', chipLabel: 'Abiertas', itemLabel: 'Abierto', textClass: 'text-[#463100]', chipClass: 'bg-[#ffeab8] text-[#463100]' },
  closed: { key: 'closed', label: 'Cerradas', chipLabel: 'Cerrada', itemLabel: 'Cerrado', textClass: 'text-[#2a5c16]', chipClass: 'bg-[#e0ffd3] text-[#2a5c16]' },
  rejected: { key: 'rejected', label: 'Rechazadas', chipLabel: 'Rechazada', itemLabel: 'Rechazado', textClass: 'text-[#646464]', chipClass: 'bg-[#f7f7f7] text-[#646464]' },
};

const statusConfigs = Object.values(statusConfigByKey);
const openFindingObservations: OpenFindingObservation[] = [
  { idLabel: 'Obs. 2', severityLabel: 'Moderado', severityClassName: 'bg-[#fbe1d0] text-[#69462e]' },
  { idLabel: 'Obs. 3', severityLabel: 'Menor', severityClassName: 'bg-[#e0ffd3] text-[#2a5c16]' },
];

function StatusChip({ status, count }: { status: StatusKey; count: number }) {
  const config = statusConfigByKey[status];
  return <span className={`inline-flex h-[16px] items-center gap-[3px] rounded-[5px] px-[7px] py-[2px] font-['Inter:Semi_Bold',sans-serif] text-[10px] font-semibold leading-none ${config.chipClass}`}><InspectionDetailStatusChipIcon status={status} />{count} {config.chipLabel}</span>;
}

function ProgressSummary({ counts, progressPercent }: { counts: Record<StatusKey, number>; progressPercent: number }) {
  return (
    <div className="flex shrink-0 flex-col items-start bg-[#143049] px-[14px] py-[10px] text-white">
      <div className="flex h-[12px] w-full items-start justify-between"><p className="font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-none text-[rgba(255,255,255,0.5)]">Progreso de observaciones</p><p className="font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-none text-white">{progressPercent}%</p></div>
      <div className="w-full pt-[5px]"><div className="h-[5px] w-full overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.15)]"><div className="h-[5px] rounded-[3px] bg-[#e0ffd3]" style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} /></div></div>
      <div className="flex w-full flex-wrap gap-[5px] pt-[6px]">{statusConfigs.map((item) => <StatusChip key={item.key} status={item.key} count={counts[item.key]} />)}</div>
    </div>
  );
}

function Tabs({ kind }: { kind: InspectionDetailModalKind }) {
  const tabs = kind === 'checklist' ? ['Ítems No', 'Resultado completo', 'Seguimientos', 'Datos generales'] : ['Observaciones', 'Seguimientos', 'Datos generales'];
  return <div className="grid shrink-0 border-b-2 border-[#e3e3e3] bg-[#f7f7f7]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>{tabs.map((tab, index) => <button key={tab} type="button" className={`flex h-[37px] items-center justify-center border-b-2 px-[6px] pb-[2px] text-center font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold leading-[14px] ${index === 0 ? 'border-[#c8a064] text-[#8e6e3e]' : 'border-transparent text-[#646464]'}`}>{tab}</button>)}</div>;
}

function StatusRow({ config, count, expanded, onToggle }: { config: StatusConfig; count: number; expanded: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-[#e3e3e3] bg-white px-[14px] py-[16px]" onClick={onToggle} aria-expanded={expanded}>
      <div className="flex items-center gap-[10px]"><InspectionDetailStatusRowIcon status={config.key} /><p className={`font-['Inter:Bold',sans-serif] text-[11px] font-bold uppercase leading-[13px] tracking-[0.66px] ${config.textClass}`}>{config.label}</p><span className={`flex h-[14px] min-w-[19px] items-center justify-center rounded-[8px] px-[7px] font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[12px] tracking-[0.6px] ${config.chipClass}`}>{count}</span></div>
      <InspectionDetailCaretDownIcon />
    </button>
  );
}

function FindingPill({ children, className }: { children: string; className: string }) {
  return <span className={`inline-flex h-[19px] items-center rounded-[6px] px-[8px] text-[11px] font-bold leading-none ${className}`}>{children}</span>;
}

function FindingTextBlock({ title, children, bordered = false }: { title: string; children: string; bordered?: boolean }) {
  return (
    <div className={`flex w-full flex-col items-start rounded-[8px] bg-white px-[10px] py-[8px] ${bordered ? 'border border-[#e3e3e3]' : ''}`}>
      <p className="text-[9px] font-bold uppercase leading-none tracking-[1.5px] text-[#646464]">{title}</p>
      <p className="pt-[3px] text-[12px] font-normal leading-[16.8px] text-[#131313]">{children}</p>
    </div>
  );
}

function EvidencePreview({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-[91px] min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-[#e3e3e3] bg-white p-px">
      <div className="flex h-[20px] items-center bg-[#001e39] px-[8px] py-[4px]"><p className="text-[9px] font-bold uppercase leading-none text-[rgba(255,255,255,0.7)]">{title}</p></div>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-[#e8f4fd] to-[#c8e6f0]">{children}</div>
    </div>
  );
}

function OpenFindingObservationCard({ observation }: { observation: OpenFindingObservation }) {
  const config = statusConfigByKey.open;
  return (
    <div className="rounded-[10px] border-[1.5px] border-[#e3e3e3] bg-[#f7f7f7] p-[13.5px] shadow-[0px_1px_1.5px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]"><FindingPill className="bg-[#e6f3ff] text-[#24588b]">{observation.idLabel}</FindingPill><FindingPill className={observation.severityClassName}>{observation.severityLabel}</FindingPill></div>
        <span className="inline-flex h-[19px] items-center gap-[4px] rounded-[6px] bg-[#fbe9be] px-[8px] py-[4px] text-[10px] font-bold leading-none text-[#5e4c22]"><InspectionDetailStatusChipIcon status="open" />{config.itemLabel}</span>
      </div>
      <div className="flex flex-col gap-[4px] pt-[12px]">
        <FindingTextBlock title="Condición detectada" bordered>[Descripción realizada por el usuario que levanta la inspección]</FindingTextBlock>
        <FindingTextBlock title="Medida correctiva propuesta">[Medida correctiva que recomienta el usuario que tomó la inspección]</FindingTextBlock>
        <div className="flex gap-[4px] pt-[8px]"><EvidencePreview title="Antes"><InspectionDetailImageIcon tone="#24588b" /></EvidencePreview><EvidencePreview title="Después"><p className="text-[11px] font-normal leading-none text-[#acacac]">Pendiente EECC</p></EvidencePreview></div>
        <div className="mt-[4px] flex min-h-[64px] items-center justify-between rounded-[10px] border-[1.5px] border-[#d1d1d1] bg-[#f7f7f7] p-[15.5px]"><div><p className="w-[78px] text-[9px] font-bold uppercase leading-none tracking-[0.63px] text-[#333]">SLA calculado</p><p className="pt-[2px] text-[20px] font-bold leading-[20px] text-[#532a0e]">X Días</p></div><button type="button" className="flex h-[40px] items-center justify-center rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] text-[13px] font-semibold text-[#333]">Reasignar SLA</button></div>
        <button type="button" className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#c8a064] px-[12px] text-[15px] font-bold text-white shadow-[0px_2px_5px_rgba(200,160,100,0.3)]">Ejecutar observación</button>
      </div>
    </div>
  );
}

function OpenFindingObservationsPanel() {
  return <div className="flex shrink-0 flex-col gap-[24px] bg-white px-[14px] pb-[24px] pt-[14px]">{openFindingObservations.map((observation) => <OpenFindingObservationCard key={observation.idLabel} observation={observation} />)}</div>;
}

function DetailRows({ kind, counts }: { kind: InspectionDetailModalKind; counts: Record<StatusKey, number> }) {
  const [expandedStatus, setExpandedStatus] = useState<StatusKey | null>(kind === 'finding' ? 'open' : null);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      {statusConfigs.map((config) => {
        const expanded = expandedStatus === config.key;
        return <div key={config.key}><StatusRow config={config} count={counts[config.key]} expanded={expanded} onToggle={() => setExpandedStatus((current) => current === config.key ? null : config.key)} />{kind === 'finding' && config.key === 'open' && expanded ? <OpenFindingObservationsPanel /> : null}</div>;
      })}
    </div>
  );
}

function DownloadPdfButton() {
  return <div className="shrink-0 border-t border-[#e3e3e3] bg-white px-[20px] pb-[14px] pt-[15px]"><button type="button" className="flex h-[40px] w-full items-center justify-center gap-[6px] rounded-[8px] border-[1.5px] border-[#d1d1d1] bg-white px-[15.5px] py-[1.5px] font-['Inter:Semi_Bold',sans-serif] text-[13px] font-semibold leading-none text-[#333]"><InspectionDetailPdfIcon />Descargar PDF</button></div>;
}

function metadataFor(record: InspectionDetailModalRecord) {
  if (record.metadataLine2) return <div className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]"><p>{record.metadataLine1}</p><p className="mt-[3px]">{record.metadataLine2}</p></div>;
  return <p className="font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-none text-[#646464]">{record.metadataLine1}</p>;
}

export function InspectionDetailModal({ open, record, onClose }: InspectionDetailModalProps) {
  if (!open || !record) return null;
  const counts: Record<StatusKey, number> = { executed: record.counts?.executed ?? 1, open: record.counts?.open ?? 2, closed: record.counts?.closed ?? 1, rejected: record.counts?.rejected ?? 1 };
  const progressPercent = record.progressPercent ?? 20;

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <section className="flex h-[calc(100vh-32px)] max-h-[692px] w-[360px] max-w-[calc(100vw-40px)] flex-col justify-between overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]" role="dialog" aria-modal="true" aria-labelledby="inspection-detail-title">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 rounded-t-[16px] bg-white px-[14px] py-[12px]"><div className="flex items-center gap-[12px]"><div className="min-w-0 flex-1 font-['Inter:Bold',sans-serif] font-bold"><p className="whitespace-nowrap text-[13px] leading-none text-[#001e39]">{record.id}</p><h2 id="inspection-detail-title" className="mt-[5px] text-[16px] font-bold leading-[22px] tracking-[0.32px] text-[#2a2a2a]">{record.title}</h2><div className="mt-[4px]">{metadataFor(record)}</div></div><button type="button" className="flex size-[32px] shrink-0 items-center justify-center" onClick={onClose} aria-label="Cerrar detalle"><InspectionDetailCloseIcon /></button></div></div>
            <ProgressSummary counts={counts} progressPercent={progressPercent} />
            <Tabs kind={record.kind} />
            <DetailRows kind={record.kind} counts={counts} />
          </div>
          <DownloadPdfButton />
        </section>
      </div>
    </div>
  );
}
