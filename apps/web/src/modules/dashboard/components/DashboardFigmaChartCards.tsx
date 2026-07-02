import type { DashboardMonthlySeriesRow } from '../dashboardRuntime';

type AnnualInspectionChartCardProps = {
  closedInspections: string;
  openInspections: string;
};

type AnnualFindingsChartCardProps = {
  rows: DashboardMonthlySeriesRow[];
};

type PairedBarRow = {
  label: string;
  closed: number;
  open: number;
  closedColor?: string;
  tooltip?: {
    label: string;
    value: string;
  };
};

const CLOSED = '#1e4d5c';
const CLOSED_HISTORICAL = '#b8cdd9';
const CLOSED_CURRENT = '#2d6a7f';
const OPEN = '#f4a460';
const GRID = '#e5e7eb';

const INSPECTION_CONTEXT_ROWS = [
  { label: '2023', closed: 652, open: 80, closedColor: CLOSED_HISTORICAL },
  { label: '2024', closed: 680, open: 76, closedColor: CLOSED_HISTORICAL },
  { label: '2025', closed: 728, open: 64, closedColor: CLOSED_HISTORICAL },
];

const FINDING_CONTEXT_ROWS = [
  { label: 'Ene', closed: 860, open: 80 },
  { label: 'Feb', closed: 380, open: 45 },
  { label: 'Mar', closed: 600, open: 60 },
  { label: 'Abr', closed: 980, open: 50 },
  { label: 'May', closed: 150, open: 95 },
];

function parseMetric(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.').match(/[0-9.]+/)?.[0];
  const parsed = normalized ? Number(normalized) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMonthLabel(month: string) {
  const normalized = month.replace('.', '').trim().toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1, 3) : '';
}

function resolveTickHeight(totalTicks: number, index: number) {
  if (totalTicks === 5) {
    return [20, 40, 40, 40, 60][index] ?? 40;
  }

  if (totalTicks === 7) {
    return [14, 19, 34, 33, 34, 33, 33][index] ?? 33;
  }

  return 200 / Math.max(totalTicks, 1);
}

function buildFindingRows(rows: DashboardMonthlySeriesRow[]) {
  const firstFiveRows = rows.slice(0, 5).map((row) => ({
    label: formatMonthLabel(row.month),
    closed: Math.max(0, row.closedFindings),
    open: Math.max(0, row.openFindings),
  }));

  const hasRuntimeValues = firstFiveRows.some((row) => row.closed > 0 || row.open > 0);
  return hasRuntimeValues ? firstFiveRows : FINDING_CONTEXT_ROWS;
}

function ChartCard({ title, subtitle, rows, maxValue, yTicks, closedSwatchColor, barWidth }: { title: string; subtitle: string; rows: PairedBarRow[]; maxValue: number; yTicks: number[]; closedSwatchColor: string; barWidth: number }) {
  return (
    <div className="bg-white border border-[#e3e3e3] border-solid drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] flex flex-col h-[339px] items-start px-[19px] py-[17px] relative rounded-[8px] w-full" data-name="Container">
      <div className="h-[18px] relative shrink-0 w-full" data-name="Container (margin)">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#131313] text-[13px] whitespace-nowrap">{title}</p>
      </div>
      <div className="h-[27px] relative shrink-0 w-full" data-name="Container (margin)">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#646464] text-[11px] whitespace-nowrap">{subtitle}</p>
      </div>
      <div className="bg-white flex-[1_0_0] min-h-px relative w-full" data-name="Canvas">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[12px] pt-[16px] px-[12px] relative rounded-[inherit] size-full">
          <div className="content-stretch flex h-[200px] items-start relative shrink-0 w-full" data-name="chart-area">
            <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal h-full items-start leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[9px] text-right w-[36px]" data-name="y-axis">
              {yTicks.map((tick, index) => (
                <div className="flex flex-col justify-center relative shrink-0 w-[32px]" key={`${tick}-${index}`} style={{ height: `${resolveTickHeight(yTicks.length, index)}px` }}>
                  <p className="leading-[normal]">{tick}</p>
                </div>
              ))}
            </div>
            <div className="bg-white flex-[1_0_0] h-full min-w-px overflow-clip relative" data-name="plot">
              {yTicks.map((tick, index) => (
                <div className="absolute h-px left-0 right-0" data-name={`grid-${tick}`} key={`${tick}-${index}`} style={{ backgroundColor: GRID, top: `${(index / Math.max(yTicks.length - 1, 1)) * 199}px` }} />
              ))}
              <div className="absolute inset-0 flex items-end justify-between gap-[14px]">
                {rows.map((row) => {
                  const closedHeight = Math.max(0, Math.min(200, (row.closed / maxValue) * 200));
                  const openHeight = Math.max(0, Math.min(200, (row.open / maxValue) * 200));

                  return (
                    <div className="relative flex h-full flex-1 items-end justify-center gap-[4px]" key={row.label}>
                      {row.tooltip ? (
                        <div className="[word-break:break-word] absolute bg-[rgba(33,48,64,0.92)] content-stretch flex flex-col gap-[2px] items-center justify-center leading-[normal] not-italic overflow-clip px-[8px] py-[6px] rounded-[6px] top-[54px] whitespace-nowrap z-[1]" data-name="tooltip-2026">
                          <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)]">{row.tooltip.label}</p>
                          <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px] text-white">{row.tooltip.value}</p>
                        </div>
                      ) : null}
                      <div className="rounded-[2px]" data-name={`${row.label}-cerradas`} style={{ backgroundColor: row.closedColor ?? CLOSED, height: `${closedHeight}px`, width: `${barWidth}px` }} />
                      <div className="rounded-[2px]" data-name={`${row.label}-abiertas`} style={{ backgroundColor: OPEN, height: `${openHeight}px`, width: `${barWidth}px` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="[word-break:break-word] bg-white content-stretch flex justify-between font-['Inter:Regular',sans-serif] font-normal h-[20px] leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[10px] text-center w-full" data-name="x-labels">
            <div className="w-[36px]" />
            {rows.map((row) => (
              <p className="flex-1 pt-[4px]" key={row.label}>{row.label}</p>
            ))}
          </div>
          <div className="content-stretch flex gap-[16px] h-[20px] items-center justify-center pt-[2px] relative shrink-0 w-full" data-name="legend">
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0" data-name="legend-cerradas">
              <div className="relative rounded-[2px] shrink-0 size-[10px]" data-name="swatch-cerradas" style={{ backgroundColor: closedSwatchColor }} />
              <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[10px] whitespace-nowrap">Cerradas</p>
            </div>
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0" data-name="legend-abiertas">
              <div className="relative rounded-[2px] shrink-0 size-[10px]" data-name="swatch-abiertas" style={{ backgroundColor: OPEN }} />
              <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[10px] whitespace-nowrap">Abiertas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardFigmaAnnualInspectionsChartCard({ closedInspections, openInspections }: AnnualInspectionChartCardProps) {
  const closed = parseMetric(closedInspections);
  const open = parseMetric(openInspections);
  const rows = [
    ...INSPECTION_CONTEXT_ROWS,
    {
      label: '2026',
      closed,
      open,
      closedColor: CLOSED_CURRENT,
      tooltip: {
        label: 'Inspecciones cerradas',
        value: closedInspections,
      },
    },
  ];

  return <ChartCard title="Inspecciones cerradas y abiertas" subtitle="Año 2026 resaltado · contexto 2023–2026" rows={rows} maxValue={800} yTicks={[800, 600, 400, 200, 0]} closedSwatchColor={CLOSED_HISTORICAL} barWidth={36} />;
}

export function DashboardFigmaAnnualFindingsChartCard({ rows }: AnnualFindingsChartCardProps) {
  return <ChartCard title="Observaciones cerradas y abiertas" subtitle="Acumulado por mes · año 2026" rows={buildFindingRows(rows)} maxValue={1200} yTicks={[1200, 1000, 800, 600, 400, 200, 0]} closedSwatchColor={CLOSED} barWidth={28} />;
}
