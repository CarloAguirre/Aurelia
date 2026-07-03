import type { InspectionDashboardPeriod, InspectionDashboardQueryParams } from '../../../shared/services/inspections.service';

type Props = {
  value: InspectionDashboardQueryParams;
  onChange: (value: InspectionDashboardQueryParams) => void;
  clearIconPath: string;
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, index) => currentYear - index);
const periods: { value: InspectionDashboardPeriod; label: string }[] = [
  { value: 'q1', label: 'T1 · Ene–Mar' },
  { value: 'm1', label: 'Enero' },
  { value: 'm2', label: 'Febrero' },
  { value: 'm3', label: 'Marzo' },
  { value: 'q2', label: 'T2 · Abr–Jun' },
  { value: 'm4', label: 'Abril' },
  { value: 'm5', label: 'Mayo' },
  { value: 'm6', label: 'Junio' },
  { value: 'q3', label: 'T3 · Jul–Sep' },
  { value: 'q4', label: 'T4 · Oct–Dic' },
];

export function DashboardPeriodLite({ value, onChange, clearIconPath }: Props) {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative">
      <select className="bg-white border border-[#d1d1d1] border-solid h-[36px] w-[128px] rounded-[8px] px-[14px] font-['Inter:Regular',sans-serif] text-[#131313] text-[13px]" value={value.year} onChange={(event) => onChange({ ...value, year: Number(event.target.value) })}>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
      <select className="bg-white border border-[#d1d1d1] border-solid h-[36px] w-[174px] rounded-[8px] px-[14px] font-['Inter:Regular',sans-serif] text-[#131313] text-[13px]" value={value.period} onChange={(event) => onChange({ ...value, period: event.target.value as InspectionDashboardPeriod })}>
        {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
      </select>
      <button className="bg-white content-stretch flex gap-[5px] h-[34px] items-center px-[13px] py-px relative rounded-[7px] shrink-0 border border-[#d1d1d1] border-solid" type="button" onClick={() => onChange({ year: currentYear, period: 'q1' })}>
        <svg className="h-[11px] w-[13.75px]" fill="none" preserveAspectRatio="none" viewBox="0 0 13.75 11.0005"><path d={clearIconPath} fill="#646464" /></svg>
        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#646464] text-[11px] text-center whitespace-nowrap"> Limpiar</span>
      </button>
    </div>
  );
}
