import type { DashboardAreaObservationRow } from '../dashboardRuntime';

type DashboardFigmaAreaObservationsChartProps = {
  rows: DashboardAreaObservationRow[];
};

const CLOSED = '#27677c';
const OPEN = '#d87b40';
const GRID = '#e3e3e3';
const AXIS_MAX = 1400;
const AXIS_TICKS = [0, 200, 400, 600, 800, 1000, 1200, 1400];
const PLOT_WIDTH = 840;

function clampRatio(value: number) {
  return Math.max(0, Math.min(1, value / AXIS_MAX));
}

function barWidth(value: number) {
  if (value <= 0) return 1;
  return Math.max(1, Math.round(clampRatio(value) * PLOT_WIDTH));
}

function formatTick(value: number) {
  return new Intl.NumberFormat('es-CL').format(value);
}

export function DashboardFigmaAreaObservationsChart({ rows }: DashboardFigmaAreaObservationsChartProps) {
  const visibleRows = rows.slice(0, 10);

  if (visibleRows.length === 0) {
    return (
      <div className="bg-white min-h-[400px] relative shrink-0 w-full" data-name="bar-chart-editable">
        <div className="flex min-h-[400px] w-full items-center justify-center text-[12px] text-[#646464]">Sin observaciones por área</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[400px] relative shrink-0 w-full" data-name="bar-chart-editable">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start min-h-[inherit] relative size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="plot-container">
          <div className="absolute bottom-0 content-stretch flex items-start justify-between left-[176px] top-0 w-[840px]" data-name="grid-lines">
            {AXIS_TICKS.map((tick) => (
              <div className="relative h-full w-px shrink-0" data-name={`grid-${tick}`} key={tick} style={{ backgroundColor: GRID }} />
            ))}
          </div>

          {visibleRows.map((row, index) => (
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="chart-row" key={`${row.area}-${index}`}>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[160px]" data-name="y-axis-label">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-px not-italic relative text-[#646464] text-[12px] text-right">{row.area}</p>
              </div>
              <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[840px]" data-name="bar-pair">
                <div className="h-[6px] relative rounded-[1px] shrink-0" data-name="bar-cerradas" style={{ width: `${barWidth(row.closedFindings)}px`, backgroundColor: CLOSED }} />
                <div className="h-[6px] relative rounded-[1px] shrink-0" data-name="bar-abiertas" style={{ width: `${barWidth(row.openFindings)}px`, backgroundColor: OPEN }} />
              </div>
            </div>
          ))}

          <div className="content-stretch flex h-[40px] items-start relative shrink-0 w-full" data-name="footer-spacer">
            <div className="[word-break:break-word] absolute bottom-0 content-stretch flex font-['Inter:Regular',sans-serif] font-normal items-start justify-between leading-[normal] left-[170px] not-italic pt-[8px] text-[#646464] text-[11px] text-center w-[780px]" data-name="x-axis">
              {AXIS_TICKS.map((tick) => (
                <p className="relative shrink-0 w-[30px]" key={tick}>{formatTick(tick)}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="content-stretch flex gap-[20px] h-[35px] items-center justify-center relative shrink-0 w-full" data-name="legend">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="legend-item">
            <div className="relative rounded-[2px] shrink-0 size-[14px]" data-name="Rectangle" style={{ backgroundColor: CLOSED }} />
            <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#646464] text-[12px] whitespace-nowrap">Cerradas</p>
          </div>
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="legend-item">
            <div className="relative rounded-[2px] shrink-0 size-[14px]" data-name="Rectangle" style={{ backgroundColor: OPEN }} />
            <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#646464] text-[12px] whitespace-nowrap">Abiertas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
