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
};

const rows: Row[] = [
  { id: '#369', date: '03-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Camp. Antiguo', company: 'GARDE CORPS', type: 'Hallazgo', urgency: 'Ejecutada · Grave', urgencyTone: 'pink', count: 3, obs: ['1 Ejec.', '2 Abier.'], days: 23, closure: 25 },
  { id: '#389', date: '28-05-26', inspector: 'Janina S. T.', area: 'Serv. Generales · PTAS', company: 'RESITER', type: 'Hallazgo', urgency: 'Ejecutada · Moderado', urgencyTone: 'orange', count: 5, obs: ['1 Ejec.', '2 Abier.', '2 Cer'], days: 9, closure: 60 },
  { id: '#357', date: '08-06-26', inspector: 'Karen O. S.', area: 'Planta Procesos · Módulo C', company: 'SOMACOR', type: 'Hallazgo', urgency: 'Abierta · Grave', urgencyTone: 'pink', count: 3, obs: ['1 Abier.', '2 Cer'], days: 18, closure: 67 },
  { id: '#395', date: '26-05-26', inspector: 'Karen O. S.', area: 'Planta Procesos · Módulo C', company: 'AGGREKO', type: 'Checklist', urgency: 'Abierta · Moderado', urgencyTone: 'yellow', count: 5, obs: ['3 Abier.', '2 Cer'], days: 4, closure: 40 },
  { id: '#404', date: '09-06-26', inspector: 'Karen O. S.', area: 'Mina · Sector Norte', company: 'SOMACOR', type: 'Hallazgo', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 1, obs: ['1 Abier.'], days: 1, closure: 0 },
  { id: '#403', date: '09-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Sect. Norte', company: 'GOLD FIELDS', type: 'Checklist', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 12, obs: ['2 Abier.', '10 Cer'], days: 1, closure: 83 },
  { id: '#376', date: '01-06-26', inspector: 'Janina S. T.', area: 'Serv. Generales · Sect. Norte', company: 'GOLD FIELDS', type: 'Checklist', urgency: 'Abierta · Menor', urgencyTone: 'green', count: 15, obs: ['3 Abier.', '12 Cer'], days: 11, closure: 80 },
];

function KpiIcon({ kind, color }: { kind: KpiIconKind; color: string }) {
  if (kind === 'total') {
    return (
      <svg className="h-[11px] w-[13.75px] shrink-0" fill="none" viewBox="0 0 14 11" aria-hidden>
        <rect x="2.25" y="0.75" width="7.5" height="9.5" rx="1.2" stroke={color} strokeWidth="1.5" />
        <path d="M4.25 3.2h3.4M4.25 5.4h3.4M4.25 7.6h2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'open') {
    return (
      <svg className="h-[11px] w-[13.75px] shrink-0" fill="none" viewBox="0 0 14 11" aria-hidden>
        <circle cx="6.5" cy="5.5" r="4.5" fill={color} />
        <path d="M6.5 2.8v2.9l2.1 1.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'approval') {
    return (
      <svg className="h-[11px] w-[13.75px] shrink-0" fill="none" viewBox="0 0 14 11" aria-hidden>
        <circle cx="6.5" cy="5.5" r="4.7" fill={color} />
        <path d="M6.5 2.9v3" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="6.5" cy="8" r="0.65" fill="white" />
      </svg>
    );
  }

  return (
    <svg className="h-[11px] w-[13.75px] shrink-0" fill="none" viewBox="0 0 14 11" aria-hidden>
      <circle cx="6.5" cy="5.5" r="4.7" fill={color} />
      <path d="M4.4 5.6l1.35 1.35 2.95-3.1" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
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

function KpiCard({ icon, iconColor, label, value, helper, valueClass = 'text-[#131313]' }: KpiCardProps) {
  return (
    <div className="bg-white border border-[#e3e3e3] border-solid drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] flex h-[92.5px] min-w-0 flex-col items-start rounded-[8px] px-[17px] py-[15px]">
      <div className="flex w-full items-center gap-[6px]">
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

function Badge({ children, tone }: { children: string; tone: BadgeTone }) {
  const classes: Record<BadgeTone, string> = {
    blue: 'bg-[#e6f3ff] text-[#0d3862]',
    mint: 'bg-[#c5fff6] text-[#006153]',
    pink: 'bg-[#ffd0db] text-[#570b1d]',
    orange: 'bg-[#ffe1cd] text-[#532a0e]',
    yellow: 'bg-[#ffeab8] text-[#463100]',
    green: 'bg-[#e0ffd3] text-[#2a5c16]',
  };

  return <span className={`inline-flex items-center rounded-[6px] px-[8px] py-[2px] font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[normal] ${classes[tone]}`}>{children}</span>;
}

function TableFilter({ label, width }: { label: string; width?: string }) {
  return (
    <div className={`bg-white border border-[#d1d1d1] border-solid flex h-[28px] items-center justify-between rounded-[8px] px-[8px] ${width ?? 'w-full'}`}>
      <span className="truncate font-['Inter:Regular',sans-serif] text-[13px] text-[#131313]">{label}</span>
      <span className="text-[11px] text-[#131313]">⌄</span>
    </div>
  );
}

function HeaderCell({ children, gold = false }: { children: string; gold?: boolean }) {
  return (
    <th className="bg-[#001e39] border-r border-[#122e47] px-[12px] py-[9.5px] text-left">
      <div className="flex items-center gap-[3px] whitespace-nowrap">
        <span className={`font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold uppercase tracking-[0.44px] ${gold ? 'text-[#c8a064]' : 'text-[rgba(255,255,255,0.7)]'}`}>{children}</span>
        <span className={gold ? 'text-[#c8a064]' : 'text-[rgba(255,255,255,0.7)]'}>◆</span>
      </div>
    </th>
  );
}

function ProgressCell({ value }: { value: number }) {
  const barColor = value < 50 ? '#bd3b5b' : '#e8a820';
  const textColor = value < 50 ? '#570b1d' : '#463100';
  return (
    <div className="flex w-[95px] items-center gap-[5px]">
      <div className="h-[4px] min-w-[36px] flex-1 rounded-[2px] bg-[#e3e3e3]">
        <div className="h-[4px] rounded-[2px]" style={{ width: `${value}%`, backgroundColor: barColor }} />
      </div>
      <span className="w-[28px] text-right font-['Inter:Bold',sans-serif] text-[10px] font-bold" style={{ color: textColor }}>{value}%</span>
    </div>
  );
}

function InspectionTable() {
  return (
    <div className="bg-white border border-[#e3e3e3] border-solid w-full overflow-hidden rounded-[8px] shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1660px] border-collapse">
          <thead>
            <tr>
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
              <th className="bg-[#001e39] px-[12px] py-[10px] text-left"><span className="font-['Inter:Bold',sans-serif] text-[10px] font-bold uppercase tracking-[0.4px] text-[rgba(255,255,255,0.7)]">Acciones</span></th>
            </tr>
            <tr className="bg-[#f0f4f8]">
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[5px] text-center text-[13px] text-[#acacac]">#</div></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[4px] text-[13px] text-[#acacac]">dd-mm-aaaa</div></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Todos los inspectores" width="w-[175px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Todas las áreas" width="w-[190px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Todas las empresas" width="w-[197px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Todos" width="w-[105px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Ejecutada - Grave" width="w-[172px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[5px] text-center text-[13px] text-[#acacac]">#</div></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><TableFilter label="Todos" width="w-[130px]" /></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><div className="flex gap-[4px]"><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[5px] text-[13px] text-[#acacac]">Min</div><span>-</span><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[5px] text-[13px] text-[#acacac]">Max</div></div></td>
              <td className="border-r border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><div className="bg-white border border-[#d1d1d1] rounded-[8px] px-[8px] py-[5px] text-center text-[13px] text-[#acacac]">#%</div></td>
              <td className="border-b border-[#e3e3e3] px-[12px] py-[5.5px]"><button className="bg-white border border-[#d1d1d1] rounded-[5px] px-[7px] py-[6px] text-[10px] font-semibold text-[#646464]" type="button">↺ Limpiar</button></td>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="h-[61px] border-r border-b border-[#e3e3e3] px-[12px] font-['Inter:Bold',sans-serif] text-[12px] font-bold text-[#24588b]">{row.id}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] font-['Inter:Regular',sans-serif] text-[12px] text-[#333]">{row.date}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#131313]">{row.inspector}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] font-['Inter:Regular',sans-serif] text-[12px] text-[#333]">{row.area}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] font-['Inter:Regular',sans-serif] text-[12px] text-[#333]">{row.company}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px]"><Badge tone={row.type === 'Checklist' ? 'mint' : 'blue'}>{row.type}</Badge></td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px]"><Badge tone={row.urgencyTone}>{row.urgency}</Badge></td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] text-center font-['Inter:Regular',sans-serif] text-[12px] text-[#333]">{row.count}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px]"><div className="flex flex-col items-start gap-[4px]">{row.obs.map((item) => <Badge key={item} tone={item.includes('Cer') ? 'green' : item.includes('Ejec') ? 'mint' : 'yellow'}>{item}</Badge>)}</div></td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px] text-center font-['Inter:Bold',sans-serif] text-[12px] font-bold" style={{ color: row.days > 12 ? '#570b1d' : row.days < 5 ? '#2a5c16' : '#463100' }}>{row.days}</td>
                <td className="border-r border-b border-[#e3e3e3] px-[12px]"><ProgressCell value={row.closure} /></td>
                <td className="border-b border-[#e3e3e3] px-[12px] text-center"><button className="bg-white border border-[#e3e3e3] rounded-[5px] p-[5px] text-[14px] text-[#646464]" type="button">•••</button></td>
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
