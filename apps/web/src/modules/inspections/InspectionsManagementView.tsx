type KpiIconKind = 'total' | 'open' | 'approval' | 'closed';

type KpiCardProps = {
  icon: KpiIconKind;
  iconColor: string;
  label: string;
  value: string;
  helper: string;
  valueClass?: string;
};

type BadgeTone = 'blue' | 'mint' | 'pink' | 'orange' | 'yellow' | 'green';
type BadgeIcon = 'search' | 'checklist' | 'clock' | 'check' | 'alert';

type Row = {
  id: string;
  date: string;
  inspector: string;
  area: string;
  company: string;
  type: 'Hallazgo' | 'Checklist';
  urgency: string;
  urgencyTone: BadgeTone;
  count: number;
  obs: string[];
  days: number;
  closure: number;
  height: number;
};

const rows: Row[] = [
  { id: '#369', date: '03-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Camp. Antiguo', company: 'GARDE CORPS', type: 'Hallazgo', urgency: 'Ejecutada · Grave', urgencyTone: 'pink', count: 3, obs: ['1 Ejec.', '2 Abier.'], days: 23, closure: 25, height: 61 },
  { id: '#389', date: '28-05-26', inspector: 'Janina S. T.', area: 'Serv. Generales · PTAS', company: 'RESITER', type: 'Hallazgo', urgency: 'Ejecutada · Moderado', urgencyTone: 'orange', count: 5, obs: ['1 Ejec.', '2 Abier.', '2 Cer'], days: 9, closure: 60, height: 80 },
  { id: '#357', date: '08-06-26', inspector: 'Karen O. S.', area: 'Planta Procesos · Módulo C', company: 'SOMACOR', type: 'Hallazgo', urgency: 'Abierta · Grave', urgencyTone: 'pink', count: 3, obs: ['1 Abier.', '2 Cer'], days: 18, closure: 67, height: 61 },
  { id: '#395', date: '26-05-26', inspector: 'Karen O. S.', area: 'Planta Procesos · Módulo C', company: 'AGGREKO', type: 'Checklist', urgency: 'Abierta · Moderado', urgencyTone: 'yellow', count: 5, obs: ['3 Abier.', '2 Cer'], days: 4, closure: 40, height: 61 },
  { id: '#404', date: '09-06-26', inspector: 'Karen O. S.', area: 'Mina · Sector Norte', company: 'SOMACOR', type: 'Hallazgo', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 1, obs: ['1 Abier.'], days: 1, closure: 0, height: 42 },
  { id: '#403', date: '09-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Sect. Norte', company: 'GOLD FIELDS', type: 'Checklist', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 12, obs: ['2 Abier.', '10 Cer'], days: 1, closure: 83, height: 61 },
  { id: '#376', date: '01-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Sect. Norte', company: 'GOLD FIELDS', type: 'Checklist', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 15, obs: ['3 Abier.', '12 Cer'], days: 11, closure: 80, height: 61 },
];

const tableColumns = [72, 147, 199, 208, 197, 132, 196, 84, 155, 132, 119, 83.5];
const tableWidth = tableColumns.reduce((total, width) => total + width, 0);

function KpiIcon({ kind, color }: { kind: KpiIconKind; color: string }) {
  const className = 'h-[11px] w-[13.75px] shrink-0';

  if (kind === 'total') {
    return (
      <svg className={className} fill="none" viewBox="0 0 13.75 11" aria-hidden>
        <rect x="2.25" y="0.75" width="7.5" height="9.5" rx="1.2" stroke={color} strokeWidth="1.5" />
        <path d="M4.25 3.2h3.4M4.25 5.4h3.4M4.25 7.6h2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'open') {
    return (
      <svg className={className} fill="none" viewBox="0 0 13.75 11" aria-hidden>
        <circle cx="6.875" cy="5.5" r="4.85" fill={color} />
        <path d="M6.875 2.65v3l2.15 1.25" stroke="white" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'approval') {
    return (
      <svg className={className} fill="none" viewBox="0 0 13.75 11" aria-hidden>
        <circle cx="6.875" cy="5.5" r="4.85" fill={color} />
        <path d="M6.875 2.75v3" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="6.875" cy="8" r="0.65" fill="white" />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 13.75 11" aria-hidden>
      <circle cx="6.875" cy="5.5" r="4.85" fill={color} />
      <path d="M4.7 5.55l1.35 1.35 2.95-3.1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-[16px] w-[20px] shrink-0" fill="none" viewBox="0 0 20 16" aria-hidden>
      <circle cx="8" cy="7" r="4.25" stroke="#131313" strokeWidth="2" />
      <path d="M11.2 10.2L15 14" stroke="#131313" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg className="h-[10px] w-[12.5px] shrink-0" fill="none" viewBox="0 0 13 10" aria-hidden>
      <path d="M3 3.5L6.25 6.5L9.5 3.5" stroke="#131313" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon({ gold = false }: { gold?: boolean }) {
  const fill = gold ? '#c8a064' : 'rgba(255,255,255,0.7)';
  return (
    <svg className="h-[10px] w-[12.5px] shrink-0" fill="none" viewBox="0 0 13 10" aria-hidden>
      <path d="M6.25 1L10 4.5H2.5L6.25 1Z" fill={fill} />
      <path d="M6.25 9L2.5 5.5H10L6.25 9Z" fill={fill} />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="size-[18px] shrink-0" fill="none" viewBox="0 0 18 18" aria-hidden>
      <path d="M4.5 2.5v2M13.5 2.5v2M3.5 6.5h11" stroke="#646464" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="4" width="12" height="11" rx="1.5" fill="#646464" opacity="0.22" />
      <path d="M5.5 8.5h2M9.5 8.5h2M5.5 11h2M9.5 11h2" stroke="#646464" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-[12px] w-[15px] shrink-0" fill="none" viewBox="0 0 15 12" aria-hidden>
      <path d="M4 1.2h4.4L11 3.8v7H4z" fill="#333" />
      <path d="M8.4 1.2v2.6H11" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-[12px] w-[15px] shrink-0" fill="none" viewBox="0 0 15 12" aria-hidden>
      <path d="M7.5 2.3v7.4M3.8 6h7.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BadgeMiniIcon({ icon, color }: { icon: BadgeIcon; color: string }) {
  if (icon === 'search') {
    return (
      <svg className="h-[9px] w-[11.25px] shrink-0" fill="none" viewBox="0 0 12 9" aria-hidden>
        <circle cx="4.8" cy="4" r="2.2" stroke={color} strokeWidth="1.5" />
        <path d="M6.5 5.8L8.7 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === 'checklist') {
    return (
      <svg className="h-[9px] w-[11.25px] shrink-0" fill="none" viewBox="0 0 12 9" aria-hidden>
        <rect x="2" y="1" width="6.4" height="7" rx="1" stroke={color} strokeWidth="1.3" />
        <path d="M3.8 4.5l1 .9 1.8-2" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === 'check') {
    return (
      <svg className="h-[8px] w-[10px] shrink-0" fill="none" viewBox="0 0 10 8" aria-hidden>
        <circle cx="4" cy="4" r="3.3" fill={color} />
        <path d="M2.4 4.1l1 1 2.2-2.2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === 'alert') {
    return (
      <svg className="h-[8px] w-[10px] shrink-0" fill="none" viewBox="0 0 10 8" aria-hidden>
        <circle cx="4" cy="4" r="3.3" fill={color} />
        <path d="M4 2.2v2.1" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <circle cx="4" cy="5.8" r="0.45" fill="white" />
      </svg>
    );
  }

  return (
    <svg className="h-[8px] w-[10px] shrink-0" fill="none" viewBox="0 0 10 8" aria-hidden>
      <circle cx="4" cy="4" r="3.3" fill={color} />
      <path d="M4 2.2v2.1l1.4.8" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="h-[12px] w-[15px] shrink-0" fill="none" viewBox="0 0 15 12" aria-hidden>
      <circle cx="3.5" cy="6" r="1.35" fill="#646464" />
      <circle cx="7.5" cy="6" r="1.35" fill="#646464" />
      <circle cx="11.5" cy="6" r="1.35" fill="#646464" />
    </svg>
  );
}

function KpiCard({ icon, iconColor, label, value, helper, valueClass = 'text-[#131313]' }: KpiCardProps) {
  return (
    <div className="bg-white border border-[#e3e3e3] border-solid drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] flex h-[92.5px] min-w-0 flex-col items-start rounded-[8px] px-[17px] py-[15px]">
      <div className="flex h-[14px] w-full items-center gap-[6px]">
        <KpiIcon kind={icon} color={iconColor} />
        <p className="font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold uppercase leading-[normal] tracking-[0.44px] text-[#646464] whitespace-nowrap">{label}</p>
      </div>
      <div className="h-[33px] w-full pt-[4px]">
        <p className={`font-['Inter:Bold',sans-serif] text-[24px] font-bold leading-[normal] whitespace-nowrap ${valueClass}`}>{value}</p>
      </div>
      <div className="h-[16px] w-full pt-[3px]">
        <p className="font-['Inter:Regular',sans-serif] text-[11px] font-normal leading-[normal] text-[#646464] whitespace-nowrap">{helper}</p>
      </div>
    </div>
  );
}

function SearchFilter() {
  return (
    <div className="bg-white border border-[#d1d1d1] border-solid flex h-[33px] w-[250px] shrink-0 items-center gap-[12px] overflow-hidden rounded-[6px] px-[15px] py-[9px]">
      <SearchIcon />
      <span className="min-w-0 flex-1 truncate font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] text-[#acacac]">Buscar por N°, empresa, insp…</span>
    </div>
  );
}

function DropdownMock({ label, width }: { label: string; width: string }) {
  return (
    <button className={`bg-white border border-[#d1d1d1] border-solid relative h-[36px] ${width} shrink-0 rounded-[8px]`} type="button">
      <span className="absolute left-[9px] top-[9px] whitespace-nowrap font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] text-[#131313]">{label}</span>
      <span className="absolute right-[10px] top-[13px]"><CaretIcon /></span>
    </button>
  );
}

function Badge({ children, tone, icon, small = false }: { children: string; tone: BadgeTone; icon?: BadgeIcon; small?: boolean }) {
  const classes: Record<BadgeTone, string> = {
    blue: 'bg-[#e6f3ff] text-[#0d3862]',
    mint: 'bg-[#c5fff6] text-[#006153]',
    pink: 'bg-[#ffd0db] text-[#570b1d]',
    orange: 'bg-[#ffe1cd] text-[#532a0e]',
    yellow: 'bg-[#ffeab8] text-[#463100]',
    green: 'bg-[#e0ffd3] text-[#2a5c16]',
  };
  const iconColor: Record<BadgeTone, string> = {
    blue: '#0d3862',
    mint: '#006153',
    pink: '#570b1d',
    orange: '#532a0e',
    yellow: '#463100',
    green: '#2a5c16',
  };

  return (
    <span className={`inline-flex items-center rounded-[6px] px-[8px] py-[2px] font-['Inter:Bold',sans-serif] font-bold leading-[normal] ${small ? 'gap-[2px] text-[9px]' : 'gap-[4px] text-[10px]'} ${classes[tone]}`}>
      {icon ? <BadgeMiniIcon icon={icon} color={iconColor[tone]} /> : null}
      {children}
    </span>
  );
}

function TableFilter({ label, width, placeholder = false }: { label: string; width: number; placeholder?: boolean }) {
  return (
    <div className="bg-white border border-[#d1d1d1] border-solid flex h-[26px] items-center justify-center overflow-hidden rounded-[8px] px-[8px]" style={{ width: `${width}px` }}>
      <span className={`min-w-0 flex-1 truncate font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] ${placeholder ? 'text-[#acacac]' : 'text-[#131313]'}`}>{label}</span>
      {!placeholder ? <CaretIcon /> : null}
    </div>
  );
}

function HeaderCell({ children, gold = false }: { children: string; gold?: boolean }) {
  return (
    <th className="h-[32px] bg-[#001e39] border-r border-[#122e47] px-[12px] py-[9.5px] text-left align-middle">
      <div className="flex items-center gap-[3px] whitespace-nowrap">
        <span className={`font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold uppercase leading-[normal] tracking-[0.44px] ${gold ? 'text-[#c8a064]' : 'text-[rgba(255,255,255,0.7)]'}`}>{children}</span>
        <SortIcon gold={gold} />
      </div>
    </th>
  );
}

function ActionHeaderCell() {
  return (
    <th className="h-[32px] bg-[#001e39] px-[12px] py-[10px] text-left align-middle">
      <span className="font-['Inter:Bold',sans-serif] text-[10px] font-bold uppercase leading-[normal] tracking-[0.4px] text-[rgba(255,255,255,0.7)]">Acciones</span>
    </th>
  );
}

function FilterCell({ children }: { children: React.ReactNode }) {
  return <td className="h-[37px] border-r border-b border-[#e3e3e3] bg-[#f0f4f8] px-[12px] py-[5.5px] align-middle">{children}</td>;
}

function DataCell({ children, center = false, bold = false }: { children: React.ReactNode; center?: boolean; bold?: boolean }) {
  return (
    <td className={`border-r border-b border-[#e3e3e3] bg-white px-[12px] py-[13.5px] align-middle font-['Inter:${bold ? 'Semi_Bold' : 'Regular'}',sans-serif] text-[12px] leading-[normal] text-[#333] ${center ? 'text-center' : 'text-left'} ${bold ? 'font-semibold text-[#131313]' : 'font-normal'}`}>
      {children}
    </td>
  );
}

function IdCell({ value }: { value: string }) {
  return <td className="border-r border-b border-[#e3e3e3] bg-white px-[12px] py-[13.5px] align-middle font-['Inter:Bold',sans-serif] text-[12px] font-bold leading-[normal] text-[#24588b]">{value}</td>;
}

function DaysCell({ value }: { value: number }) {
  const color = value > 12 ? '#570b1d' : value < 5 ? '#2a5c16' : '#463100';
  return <td className="border-r border-b border-[#e3e3e3] bg-white px-[12px] py-[13.5px] text-center align-middle font-['Inter:Bold',sans-serif] text-[12px] font-bold leading-[normal]" style={{ color }}>{value}</td>;
}

function ProgressCell({ value }: { value: number }) {
  const barColor = value < 50 ? '#bd3b5b' : '#e8a820';
  const textColor = value < 50 ? '#570b1d' : '#463100';
  return (
    <td className="border-r border-b border-[#e3e3e3] bg-white px-[12px] py-[14px] align-middle">
      <div className="flex w-[95px] items-center gap-[5px]">
        <div className="h-[4px] min-w-[36px] flex-[62_0_0] rounded-[2px] bg-[#e3e3e3]">
          <div className="h-[4px] rounded-[2px]" style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: barColor }} />
        </div>
        <span className="min-w-[28px] text-right font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[normal]" style={{ color: textColor }}>{value}%</span>
      </div>
    </td>
  );
}

function getObsBadge(item: string) {
  if (item.includes('Ejec')) return { tone: 'mint' as const, icon: 'check' as const };
  if (item.includes('Cer')) return { tone: 'green' as const, icon: 'check' as const };
  return { tone: 'yellow' as const, icon: 'clock' as const };
}

function InspectionTable() {
  return (
    <div className="bg-white border border-[#e3e3e3] border-solid w-full overflow-hidden rounded-[8px] shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="table-fixed border-collapse" style={{ minWidth: `${tableWidth}px`, width: `${tableWidth}px` }}>
          <colgroup>
            {tableColumns.map((width, index) => <col key={index} style={{ width: `${width}px` }} />)}
          </colgroup>
          <thead>
            <tr className="h-[32px]">
              <HeaderCell>Nº</HeaderCell>
              <HeaderCell>Fecha</HeaderCell>
              <HeaderCell>Inspector</HeaderCell>
              <HeaderCell>Área. Sector</HeaderCell>
              <HeaderCell>Empresa</HeaderCell>
              <HeaderCell>Tipo</HeaderCell>
              <HeaderCell gold>Urgencia máxima</HeaderCell>
              <HeaderCell>Nº obs</HeaderCell>
              <HeaderCell>Obs.</HeaderCell>
              <HeaderCell>Días</HeaderCell>
              <HeaderCell>Cierre</HeaderCell>
              <ActionHeaderCell />
            </tr>
            <tr className="h-[37px] bg-[#f0f4f8]">
              <FilterCell><TableFilter label="#" width={48} placeholder /></FilterCell>
              <FilterCell><div className="bg-white border border-[#d1d1d1] border-solid flex h-[26px] w-[123px] items-center justify-center overflow-hidden rounded-[8px] px-[8px] py-[4px]"><span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] text-[#acacac]">dd-mm-aaaa</span><CalendarIcon /></div></FilterCell>
              <FilterCell><TableFilter label="Todos los inspectores" width={175} /></FilterCell>
              <FilterCell><TableFilter label="Todas las áreas" width={184} /></FilterCell>
              <FilterCell><TableFilter label="Todas las empresas" width={173} /></FilterCell>
              <FilterCell><TableFilter label="Todos" width={108} /></FilterCell>
              <FilterCell><TableFilter label="Ejecutada - Grave" width={172} /></FilterCell>
              <FilterCell><TableFilter label="#" width={60} placeholder /></FilterCell>
              <FilterCell><TableFilter label="Todos" width={131} /></FilterCell>
              <FilterCell><div className="flex items-center gap-[4px]"><TableFilter label="Min" width={47} placeholder /><span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#131313]">-</span><TableFilter label="Max" width={47} placeholder /></div></FilterCell>
              <FilterCell><TableFilter label="#%" width={95} placeholder /></FilterCell>
              <td className="h-[37px] border-b border-[#e3e3e3] bg-[#f0f4f8] px-[12px] py-[5.5px] align-middle"><button className="flex h-[26px] w-[59.5px] items-center justify-center gap-[4px] rounded-[5px] border border-[#d1d1d1] bg-white px-px py-[7px] font-['Inter:Semi_Bold',sans-serif] text-[10px] font-semibold leading-[normal] text-[#646464]" type="button">↺ Limpiar</button></td>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ height: `${row.height}px` }}>
                <IdCell value={row.id} />
                <DataCell>{row.date}</DataCell>
                <DataCell bold>{row.inspector}</DataCell>
                <DataCell>{row.area}</DataCell>
                <DataCell>{row.company}</DataCell>
                <DataCell><Badge tone={row.type === 'Checklist' ? 'mint' : 'blue'} icon={row.type === 'Checklist' ? 'checklist' : 'search'}>{row.type}</Badge></DataCell>
                <DataCell><Badge tone={row.urgencyTone} icon={row.urgency.includes('Ejecutada') ? 'check' : row.urgency.includes('Grave') ? 'alert' : 'clock'}>{row.urgency}</Badge></DataCell>
                <DataCell center>{row.count}</DataCell>
                <DataCell><div className="flex w-[95.5px] flex-col items-start gap-[4px]">{row.obs.map((item) => { const badge = getObsBadge(item); return <Badge key={item} tone={badge.tone} icon={badge.icon} small>{item}</Badge>; })}</div></DataCell>
                <DaysCell value={row.days} />
                <ProgressCell value={row.closure} />
                <td className="border-b border-[#e3e3e3] bg-white px-[12px] py-[8.5px] text-center align-middle"><button className="inline-flex size-[26px] items-center justify-center rounded-[5px] border border-[#e3e3e3] bg-white p-px" type="button"><MoreIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#e3e3e3] bg-white px-[16px] py-[10px] flex items-center justify-between">
        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#646464]">Mostrando 1–7 de 7 inspecciones abiertas</p>
        <div className="flex items-center gap-[4px]"><button className="size-[32px] rounded-[6px] border border-[#e3e3e3] opacity-35">‹</button><button className="size-[32px] rounded-[6px] border border-[#c8a064] bg-[#c8a064] font-semibold text-[#001e39]">1</button><button className="size-[32px] rounded-[6px] border border-[#e3e3e3] opacity-35">›</button></div>
        <div className="flex items-center gap-[8px]"><span className="text-[12px] text-[#646464]">Filas por página</span><button className="h-[32px] w-[51px] rounded-[6px] border border-[#d1d1d1] text-[12px] font-semibold text-[#646464]">10⌄</button></div>
      </div>
    </div>
  );
}

export function InspectionsManagementView() {
  return (
    <div className="bg-[#f7f7f7] flex h-[calc(100vh-56px)] w-full flex-col items-start overflow-y-auto overflow-x-hidden px-[24px] py-[20px]">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(244px,1fr))] gap-[12px]">
        <KpiCard icon="total" iconColor="#24588b" label="Total 2026" value="XXXX" helper="↑ 12% vs 2025" />
        <KpiCard icon="open" iconColor="#806000" label="Inspecciones abiertas" value="XX" helper="111 observaciones pendientes" valueClass="text-[#463100]" />
        <KpiCard icon="approval" iconColor="#bd3b5b" label="Pend. de aprobación" value="X" helper="Ejecutadas esperando Admin GF" valueClass="text-[#bd3b5b]" />
        <KpiCard icon="closed" iconColor="#53bd49" label="% Obs. cerradas" value="XX%" helper="Meta >99%" valueClass="text-[#2a5c16]" />
      </div>
      <div className="flex min-h-[38px] w-full flex-wrap items-center justify-between gap-[12px] pt-[16px]">
        <div className="flex min-w-0 flex-wrap items-center gap-[8px]">
          <SearchFilter />
          <DropdownMock label="Todas las áreas" width="w-[130px]" />
          <DropdownMock label="Todas las empresas" width="w-[163px]" />
          <DropdownMock label="Todo 2026" width="w-[110px]" />
        </div>
        <div className="flex shrink-0 items-center gap-[8px]">
          <button className="bg-white border-[#d1d1d1] border-[1.5px] border-solid flex h-[36px] w-[117.5px] shrink-0 items-center gap-[6px] rounded-[8px] px-[13.5px] py-[1.5px] text-[12px] font-semibold text-[#333]" type="button"><FileIcon /><span className="font-['Inter:Semi_Bold',sans-serif]">Exportar</span><CaretIcon /></button>
          <button className="flex h-[36px] w-[159px] shrink-0 items-center gap-[7px] rounded-[6px] bg-[#c8a064] px-[16px] py-[10.5px] text-[12px] font-bold text-white" type="button"><PlusIcon /><span className="font-['Inter:Bold',sans-serif]">Nueva inspección</span></button>
        </div>
      </div>
      <div className="w-full pt-[16px]">
        <InspectionTable />
      </div>
    </div>
  );
}
