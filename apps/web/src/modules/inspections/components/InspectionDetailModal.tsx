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

type StatusKey = 'executed' | 'open' | 'closed' | 'rejected';

type StatusConfig = {
  key: StatusKey;
  label: string;
  chipLabel: string;
  textClass: string;
  chipClass: string;
  dotClass: string;
};

const statusConfigByKey: Record<StatusKey, StatusConfig> = {
  executed: { key: 'executed', label: 'Ejecutadas', chipLabel: 'Ejecutada', textClass: 'text-[#570b1d]', chipClass: 'bg-[#ffd0db] text-[#570b1d]', dotClass: 'bg-[#570b1d]' },
  open: { key: 'open', label: 'Abiertas', chipLabel: 'Abiertas', textClass: 'text-[#463100]', chipClass: 'bg-[#ffeab8] text-[#463100]', dotClass: 'bg-[#463100]' },
  closed: { key: 'closed', label: 'Cerradas', chipLabel: 'Cerrada', textClass: 'text-[#2a5c16]', chipClass: 'bg-[#e0ffd3] text-[#2a5c16]', dotClass: 'bg-[#2a5c16]' },
  rejected: { key: 'rejected', label: 'Rechazadas', chipLabel: 'Rechazada', textClass: 'text-[#646464]', chipClass: 'bg-[#f7f7f7] text-[#646464]', dotClass: 'bg-[#646464]' },
};

const statusConfigs = Object.values(statusConfigByKey);

function CloseIcon() {
  return <svg className="size-[64px]" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M14 14 50 50M50 14 14 50" stroke="#131313" strokeWidth="4.8" strokeLinecap="round" /></svg>;
}

function CaretDownIcon() {
  return <svg className="size-[32px]" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 12 16 21 25 12" fill="#131313" stroke="#131313" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PdfIcon() {
  return <svg className="h-[26px] w-[32.5px]" viewBox="0 0 34 28" fill="none" aria-hidden="true"><path d="M8.5 2.5h10.8l6.2 6.3v16.7h-17V2.5Z" fill="#333" /><path d="M19.3 2.5v6.3h6.2" stroke="white" strokeWidth="1.6" strokeLinejoin="round" /><text x="10.2" y="24" fill="white" fontSize="6.6" fontWeight="700">PDF</text></svg>;
}

function StatusDot({ status }: { status: StatusKey }) {
  const config = statusConfigByKey[status];
  if (status === 'closed') {
    return <span className={`relative inline-flex h-[22px] w-[27.5px] items-center justify-center rounded-full ${config.dotClass}`}><svg className="h-[14px] w-[16px]" viewBox="0 0 16 14" fill="none" aria-hidden="true"><path d="M2.8 7 6 10.2 13 3" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
  }
  if (status === 'executed' || status === 'rejected') {
    return <span className={`relative inline-flex h-[22px] w-[27.5px] items-center justify-center rounded-full ${config.dotClass}`}><span className="h-[3px] w-[3px] rounded-full bg-white" /><span className="absolute h-[10px] w-[3px] -translate-y-[2px] rounded-full bg-white" /></span>;
  }
  return <span className={`relative inline-flex h-[22px] w-[27.5px] items-center justify-center rounded-full ${config.dotClass}`}><span className="h-[8.8px] w-[2.6px] -translate-y-[2px] rounded-full bg-white" /><span className="absolute h-[2.6px] w-[8px] translate-x-[2px] translate-y-[2.6px] rounded-full bg-white" /></span>;
}

function StatusChip({ status, count }: { status: StatusKey; count: number }) {
  const config = statusConfigByKey[status];
  return <span className={`inline-flex h-[32px] items-center gap-[6px] rounded-[10px] px-[14px] py-[4px] text-[20px] font-semibold leading-none ${config.chipClass}`}><span className={`size-[12px] rounded-full ${config.dotClass}`} />{count} {config.chipLabel}</span>;
}

function ProgressSummary({ counts, progressPercent }: { counts: Record<StatusKey, number>; progressPercent: number }) {
  return (
    <div className="flex shrink-0 flex-col items-start bg-[#143049] px-[28px] py-[20px] text-white">
      <div className="flex h-[24px] w-full items-start justify-between"><p className="text-[20px] font-normal leading-[24px] text-[rgba(255,255,255,0.5)]">Progreso de observaciones</p><p className="text-[20px] font-bold leading-[24px] text-white">{progressPercent}%</p></div>
      <div className="w-full pt-[10px]"><div className="h-[10px] w-full overflow-hidden rounded-[6px] bg-[rgba(255,255,255,0.15)]"><div className="h-[10px] rounded-[6px] bg-[#e0ffd3]" style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} /></div></div>
      <div className="flex w-full flex-wrap gap-[10px] pt-[12px]">{statusConfigs.map((item) => <StatusChip key={item.key} status={item.key} count={counts[item.key]} />)}</div>
    </div>
  );
}

function Tabs({ kind }: { kind: InspectionDetailModalKind }) {
  const tabs = kind === 'checklist' ? ['Ítems No', 'Resultado completo', 'Seguimientos', 'Datos generales'] : ['Observaciones', 'Seguimientos', 'Datos generales'];
  return <div className="grid shrink-0 border-b-4 border-[#e3e3e3] bg-[#f7f7f7]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>{tabs.map((tab, index) => <button key={tab} type="button" className={`flex h-[74px] items-center justify-center border-b-4 px-[12px] pb-[4px] text-center text-[24px] font-semibold leading-[28px] ${index === 0 ? 'border-[#c8a064] text-[#8e6e3e]' : 'border-transparent text-[#646464]'}`}>{tab}</button>)}</div>;
}

function StatusRow({ config, count }: { config: StatusConfig; count: number }) {
  return (
    <button type="button" className="flex h-[112px] w-full shrink-0 items-center justify-between border-b border-[#e3e3e3] bg-white px-[28px] py-[32px]">
      <div className="flex items-center gap-[20px]"><StatusDot status={config.key} /><p className={`text-[20px] font-bold uppercase leading-none tracking-[1.2px] ${config.textClass}`}>{config.label}</p><span className={`flex h-[28px] min-w-[38px] items-center justify-center rounded-[16px] px-[14px] text-[20px] font-bold leading-none tracking-[1.2px] ${config.chipClass}`}>{count}</span></div>
      <CaretDownIcon />
    </button>
  );
}

function DownloadPdfButton() {
  return <div className="shrink-0 border-t border-[#e3e3e3] bg-white px-[40px] pb-[28px] pt-[30px]"><button type="button" className="flex h-[80px] w-full items-center justify-center gap-[12px] rounded-[16px] border-[3px] border-[#d1d1d1] bg-white px-[31px] py-[3px] text-[26px] font-semibold leading-none text-[#333]"><PdfIcon />Descargar PDF</button></div>;
}

function metadataFor(record: InspectionDetailModalRecord) {
  if (record.metadataLine2) return <div className="text-[22px] font-bold leading-[26px] text-[#646464]"><p>{record.metadataLine1}</p><p>{record.metadataLine2}</p></div>;
  return <p className="text-[22px] font-bold leading-[26px] text-[#646464]">{record.metadataLine1}</p>;
}

export function InspectionDetailModal({ open, record, onClose }: InspectionDetailModalProps) {
  if (!open || !record) return null;
  const counts: Record<StatusKey, number> = { executed: record.counts?.executed ?? 1, open: record.counts?.open ?? 2, closed: record.counts?.closed ?? 1, rejected: record.counts?.rejected ?? 1 };
  const progressPercent = record.progressPercent ?? 20;

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.68)]">
      <div className="flex h-full w-full items-center justify-end px-[20px] py-[16px]">
        <section className="flex h-[calc(100vh-32px)] max-h-[1384px] w-[720px] max-w-[calc(100vw-40px)] flex-col justify-between overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.35)]" role="dialog" aria-modal="true" aria-labelledby="inspection-detail-title">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 rounded-t-[32px] bg-white px-[28px] py-[24px]"><div className="flex items-center gap-[24px]"><div className="min-w-0 flex-1 font-bold"><p className="whitespace-nowrap text-[26px] leading-[30px] text-[#001e39]">{record.id}</p><h2 id="inspection-detail-title" className="mt-[10px] text-[32px] font-bold leading-[44px] tracking-[0.64px] text-[#2a2a2a]">{record.title}</h2><div className="mt-[8px]">{metadataFor(record)}</div></div><button type="button" className="flex size-[64px] shrink-0 items-center justify-center" onClick={onClose} aria-label="Cerrar detalle"><CloseIcon /></button></div></div>
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
