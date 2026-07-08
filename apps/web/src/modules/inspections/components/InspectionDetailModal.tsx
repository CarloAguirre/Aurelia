import {
  InspectionDetailCaretDownIcon,
  InspectionDetailCloseIcon,
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
  textClass: string;
  chipClass: string;
};

const statusConfigByKey: Record<StatusKey, StatusConfig> = {
  executed: { key: 'executed', label: 'Ejecutadas', chipLabel: 'Ejecutada', textClass: 'text-[#570b1d]', chipClass: 'bg-[#ffd0db] text-[#570b1d]' },
  open: { key: 'open', label: 'Abiertas', chipLabel: 'Abiertas', textClass: 'text-[#463100]', chipClass: 'bg-[#ffeab8] text-[#463100]' },
  closed: { key: 'closed', label: 'Cerradas', chipLabel: 'Cerrada', textClass: 'text-[#2a5c16]', chipClass: 'bg-[#e0ffd3] text-[#2a5c16]' },
  rejected: { key: 'rejected', label: 'Rechazadas', chipLabel: 'Rechazada', textClass: 'text-[#646464]', chipClass: 'bg-[#f7f7f7] text-[#646464]' },
};

const statusConfigs = Object.values(statusConfigByKey);

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

function StatusRow({ config, count }: { config: StatusConfig; count: number }) {
  return (
    <button type="button" className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-[#e3e3e3] bg-white px-[14px] py-[16px]">
      <div className="flex items-center gap-[10px]"><InspectionDetailStatusRowIcon status={config.key} /><p className={`font-['Inter:Bold',sans-serif] text-[11px] font-bold uppercase leading-[13px] tracking-[0.66px] ${config.textClass}`}>{config.label}</p><span className={`flex h-[14px] min-w-[19px] items-center justify-center rounded-[8px] px-[7px] font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[12px] tracking-[0.6px] ${config.chipClass}`}>{count}</span></div>
      <InspectionDetailCaretDownIcon />
    </button>
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
            <div className="min-h-0 flex-1 bg-white">{statusConfigs.map((config) => <StatusRow key={config.key} config={config} count={counts[config.key]} />)}</div>
          </div>
          <DownloadPdfButton />
        </section>
      </div>
    </div>
  );
}
