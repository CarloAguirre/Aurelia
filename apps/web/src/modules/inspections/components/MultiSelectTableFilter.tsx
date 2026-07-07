import { useMemo, useState } from 'react';

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectTableFilterProps = {
  value: string;
  onChange: (value: string) => void;
  width: number;
  allLabel: string;
  options: MultiSelectOption[];
};

function parseValue(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function CheckIcon() {
  return <svg className="h-[12px] w-[12px]" fill="none" viewBox="0 0 12 12" aria-hidden><path d="M2.2 6.2 4.8 8.8 9.8 2.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Checkbox({ checked }: { checked: boolean }) {
  return <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-solid ${checked ? 'border-[#c8a064] bg-[#c8a064]' : 'border-[#131313] bg-white'}`}>{checked ? <CheckIcon /> : null}</span>;
}

export function MultiSelectTableFilter({ value, onChange, width, allLabel, options }: MultiSelectTableFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedValues = useMemo(() => parseValue(value), [value]);
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const selectedLabels = options.filter((option) => selectedSet.has(option.value)).map((option) => option.label);
  const displayValue = selectedLabels.length === 0 ? allLabel : selectedLabels.length === 1 ? selectedLabels[0] : `${selectedLabels.length} seleccionadas`;

  function close() {
    setOpen(false);
  }

  function toggleOption(optionValue: string) {
    const nextValues = selectedSet.has(optionValue) ? selectedValues.filter((item) => item !== optionValue) : [...selectedValues, optionValue];
    onChange(nextValues.join(','));
  }

  return (
    <div className="relative">
      {open ? <button className="fixed inset-0 z-[90] cursor-default" type="button" aria-label="Cerrar selector" onClick={close} /> : null}
      <button className="bg-white border border-[#d1d1d1] border-solid flex h-[26px] items-center justify-center gap-[8px] overflow-hidden rounded-[8px] px-[8px] font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] text-[#131313]" style={{ width: `${width}px` }} type="button" onClick={() => setOpen((current) => !current)}>
        <span className="min-w-0 flex-1 truncate text-left">{displayValue}</span>
        <span className="shrink-0 text-[10px] leading-[10px] text-[#646464]">⌄</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-[30px] z-[100] flex w-[316px] flex-col items-start rounded-[12px] bg-white p-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
          <button className="flex w-full items-center gap-[8px] rounded-[8px] bg-white px-[8px] py-[12px] text-left" type="button" onClick={() => onChange('')}>
            <Checkbox checked={selectedValues.length === 0} />
            <span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">{allLabel}</span>
          </button>
          {options.map((option) => (
            <button key={option.value} className="flex w-full items-center gap-[8px] rounded-[8px] bg-white px-[8px] py-[12px] text-left" type="button" onClick={() => toggleOption(option.value)}>
              <Checkbox checked={selectedSet.has(option.value)} />
              <span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
