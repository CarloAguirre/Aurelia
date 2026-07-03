const CLOSED = '#1f6f8b';
const OPEN = '#e07838';
const GRID = '#e8e8e8';
const AXIS = '#ccc';
const TEXT = '#888';
const MAX_VALUE = 30;
const TICKS = [0, 5, 10, 15, 20, 25, 30];
const ROWS = [
  { company: 'ICV', closed: 28, open: 14 },
  { company: 'AGGREKO', closed: 24, open: 13 },
  { company: 'SOMACOR', closed: 18, open: 9 },
  { company: 'AKD', closed: 11, open: 5 },
  { company: 'GARDE CORPS', closed: 9, open: 4 },
  { company: 'FAST MODULAR', closed: 8, open: 4 },
  { company: 'GOLD FIELDS', closed: 7, open: 3 },
  { company: 'RESITER', closed: 6, open: 3 },
];

function getCurrentMonthLabel() {
  const now = new Date();
  const month = new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(now);
  return `${month} ${now.getFullYear()}`;
}

function widthFor(value: number) {
  return `${Math.max(0, Math.min(100, (value / MAX_VALUE) * 100))}%`;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <div className="h-[10px] w-[12px] shrink-0" style={{ backgroundColor: color }} />
      <p className="font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-[normal] text-[#888] whitespace-nowrap">{label}</p>
    </div>
  );
}

export function DashboardFigmaCompanyAnalysisChart() {
  return (
    <div className="relative h-auto min-h-[397px] w-full shrink-0 rounded-[8px] bg-white drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)]" data-name="Container">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[8px] border border-[#e3e3e3] border-solid" />
      <div className="relative flex size-full flex-col items-start px-[19px] py-[17px]">
        <div className="relative h-[18px] w-full shrink-0" data-name="Container (margin)">
          <p className="font-['Inter:Bold',sans-serif] text-[13px] font-bold leading-[normal] text-[#131313] whitespace-nowrap">Inspecciones abiertas y cerradas por empresa</p>
        </div>
        <div className="relative h-[27px] w-full shrink-0" data-name="Container (margin)">
          <p className="font-['Inter:Regular',sans-serif] text-[11px] font-normal leading-[normal] text-[#646464] whitespace-nowrap">Empresas con observaciones {getCurrentMonthLabel()}</p>
        </div>
        <div className="relative h-[315px] w-full shrink-0 bg-white" data-name="Canvas">
          <div className="relative size-full overflow-visible rounded-[inherit]">
            <div className="absolute bottom-[42px] left-[90px] right-0 top-[12px]" data-name="plot-area">
              <div className="absolute inset-0 flex justify-between">
                {TICKS.map((tick) => (
                  <div className="h-full w-px shrink-0" data-name={`gridline-${tick}`} key={tick} style={{ backgroundColor: GRID }} />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col justify-between py-[6px]">
                {ROWS.map((row) => (
                  <div className="relative h-[21px] w-full" key={row.company}>
                    <div className="absolute left-0 top-0 h-[11px] rounded-[2px]" data-name={`bar-cerradas-${row.company}`} style={{ width: widthFor(row.closed), backgroundColor: CLOSED }} />
                    <div className="absolute left-0 top-[15px] h-[11px] rounded-[2px]" data-name={`bar-abiertas-${row.company}`} style={{ width: widthFor(row.open), backgroundColor: OPEN }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-[42px] left-[90px] right-0 h-px" data-name="x-axis" style={{ backgroundColor: AXIS }} />
            <div className="absolute bottom-[28px] left-[90px] right-0 flex justify-between">
              {TICKS.map((tick) => (
                <div className="relative flex w-[1px] justify-center" key={tick}>
                  <div className="absolute bottom-[11px] h-[5px] w-px" data-name={`tick-${tick}`} style={{ backgroundColor: '#aaa' }} />
                  <p className="absolute top-0 font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-[normal] text-[#aaa] whitespace-nowrap">{tick}</p>
                </div>
              ))}
            </div>

            <div className="absolute bottom-[54px] left-0 top-[12px] flex w-[84px] flex-col justify-between py-[6px]">
              {ROWS.map((row) => (
                <div className="flex h-[21px] items-center justify-end" key={row.company}>
                  <p className="font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-[normal] text-[#888] whitespace-nowrap">{row.company}</p>
                </div>
              ))}
            </div>

            <div className="absolute bottom-[3px] left-[90px] right-0 flex justify-center gap-[72px]">
              <LegendItem color={CLOSED} label="Obs. cerradas" />
              <LegendItem color={OPEN} label="Obs. abiertas" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
