import type { InspectionDashboardOpenFindingRowResponse } from '@aurelia/contracts';

type DashboardFigmaOpenFindingsDetailsTableProps = {
  rows: InspectionDashboardOpenFindingRowResponse[];
  severeOpenFindings: number;
  openInspections: string;
  sortIconPath: string;
  expandIconPath: string;
  isLoading?: boolean;
  isError?: boolean;
};

type SortIconProps = {
  path: string;
  color?: string;
};

type ExpandIconProps = {
  path: string;
};

type HeaderCellProps = {
  label: string;
  sortIconPath?: string;
  accent?: boolean;
  center?: boolean;
};

const tableColumns = '86px minmax(180px,1fr) minmax(180px,1fr) 121.5px 127.5px 122px';

function SortIcon({ path, color = 'white' }: SortIconProps) {
  return (
    <div className="h-[10px] relative shrink-0 w-[12.5px]" data-name="Image">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 10.001">
        <path d={path} fill={color} fillOpacity={color === 'white' ? 0.7 : 1} />
      </svg>
    </div>
  );
}

function ExpandIcon({ path }: ExpandIconProps) {
  return (
    <div className="h-[10px] relative shrink-0 w-[12.5px]" data-name="Image">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.5 10">
        <path d={path} fill="#131313" />
      </svg>
    </div>
  );
}

function HeaderCell({ label, sortIconPath, accent = false, center = false }: HeaderCellProps) {
  return (
    <div className="bg-[#001e39] min-w-0 relative h-[32px] border-r border-[#122e47] border-solid">
      <div className={`flex h-full items-center gap-[3px] px-[12px] py-[9.5px] ${center ? 'justify-center' : ''}`}>
        <p className={`font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold leading-[normal] tracking-[0.44px] uppercase whitespace-nowrap ${accent ? 'text-[#c8a064]' : 'text-[rgba(255,255,255,0.7)]'}`}>{label}</p>
        {sortIconPath ? <SortIcon path={sortIconPath} color={accent ? '#c8a064' : 'white'} /> : null}
      </div>
    </div>
  );
}

function getAgeTextClass(row: InspectionDashboardOpenFindingRowResponse) {
  if (row.hasSevereOpenFindings) return 'text-[#570b1d]';
  if (row.ageDays >= 10) return 'text-[#463100]';
  return 'text-[#2a5c16]';
}

function rowBackground(row: InspectionDashboardOpenFindingRowResponse) {
  return row.hasSevereOpenFindings ? 'bg-[#ffd0db]' : 'bg-white';
}

export function DashboardFigmaOpenFindingsDetailsTable({ rows, severeOpenFindings, openInspections, sortIconPath, expandIconPath, isLoading = false, isError = false }: DashboardFigmaOpenFindingsDetailsTableProps) {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-hidden px-[19px] py-[17px] relative rounded-[inherit] size-full">
        <div className="relative shrink-0 w-full border-b border-[#e3e3e3] border-solid">
          <div className="flex flex-row items-center justify-between pb-[15px] pt-[14px] px-[18px] relative size-full">
            <div className="relative shrink-0 w-[267.82px]" data-name="Container">
              <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] text-[#131313] text-[13px] whitespace-nowrap">Detalle de observaciones abiertas</p>
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] text-[#646464] text-[11px] whitespace-nowrap">Ordenadas por días abierto · seguimiento prioritario</p>
            </div>
            <div className="flex gap-[12px] items-center relative shrink-0">
              <div className="bg-[#ffd0db] h-[21px] relative rounded-[6px] shrink-0 w-[252px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#570b1d] text-[11px] top-[4px] whitespace-nowrap">{severeOpenFindings} tienen observaciones en estado grave</p>
              </div>
              <div className="bg-[#e6f3ff] h-[21px] relative rounded-[6px] shrink-0 w-[150.594px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[10px] text-[#24588b] text-[11px] top-[4px] whitespace-nowrap">{openInspections} inspecciones abiertas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[920px] w-full">
            <div className="grid" style={{ gridTemplateColumns: tableColumns }}>
              <HeaderCell label="Nº" sortIconPath={sortIconPath} />
              <HeaderCell label="Empresa" sortIconPath={sortIconPath} />
              <HeaderCell label="Área" sortIconPath={sortIconPath} />
              <HeaderCell label="Días abierto" sortIconPath={sortIconPath} accent center />
              <HeaderCell label="Obs. abiertas" sortIconPath={sortIconPath} center />
              <HeaderCell label="Desplegar fila" center />
            </div>

            {isLoading ? (
              <div className="h-[66px] flex items-center justify-center text-[12px] text-[#646464] border-b border-[#e3e3e3] border-solid">Cargando detalle de observaciones...</div>
            ) : isError ? (
              <div className="h-[66px] flex items-center justify-center text-[12px] text-[#570b1d] border-b border-[#e3e3e3] border-solid">Error al cargar detalle de observaciones.</div>
            ) : rows.length === 0 ? (
              <div className="h-[66px] flex items-center justify-center text-[12px] text-[#646464] border-b border-[#e3e3e3] border-solid">Sin observaciones abiertas</div>
            ) : (
              rows.map((row) => {
                const bgClass = rowBackground(row);

                return (
                  <div className="grid h-[33px]" style={{ gridTemplateColumns: tableColumns }} key={row.inspectionId}>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center px-[12px]`}>
                      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] text-[#24588b] text-[12px] whitespace-nowrap">{row.inspectionNumber}</p>
                    </div>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center px-[12px] min-w-0`}>
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] text-[#131313] text-[12px] truncate">{row.company}</p>
                    </div>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center px-[12px] min-w-0`}>
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] text-[#333] text-[12px] truncate">{row.area}</p>
                    </div>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center justify-center px-[12px]`}>
                      <p className={`font-['Inter:Bold',sans-serif] font-bold leading-[normal] text-[12px] whitespace-nowrap ${getAgeTextClass(row)}`}>{row.ageDays}</p>
                    </div>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center justify-center px-[12px]`}>
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] text-[#333] text-[12px] whitespace-nowrap">{row.openFindings}</p>
                    </div>
                    <div className={`${bgClass} border-b border-r border-[#e3e3e3] border-solid flex items-center justify-center px-[12px]`}>
                      <ExpandIcon path={expandIconPath} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div aria-hidden className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
