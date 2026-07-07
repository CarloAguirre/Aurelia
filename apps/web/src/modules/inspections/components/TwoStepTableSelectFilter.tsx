import { useMemo, useState } from 'react';

type SelectOption = {
  label: string;
  value: string;
};

type OptionGroup = {
  label: string;
  options: SelectOption[];
};

type TwoStepTableSelectFilterProps = {
  value: string;
  onChange: (value: string) => void;
  width: number;
  allLabel: string;
  options: string[];
  detailTitle?: (group: string) => string;
};

const separators = [' · ', ' - ', ' – ', ' / ', '/', '|'];

function splitOption(option: string) {
  const normalized = option.trim();
  const separator = separators.find((item) => normalized.includes(item));
  if (!separator) return { group: normalized, label: normalized };
  const parts = normalized.split(separator);
  const group = parts[0]?.trim() ?? normalized;
  const label = parts.slice(1).join(separator).trim();
  return { group, label: label || normalized };
}

function buildGroups(options: string[]) {
  const groups: OptionGroup[] = [];
  const byLabel = new Map<string, OptionGroup>();
  options.forEach((option) => {
    const { group, label } = splitOption(option);
    if (!group) return;
    const current = byLabel.get(group) ?? { label: group, options: [] };
    current.options.push({ label, value: option });
    if (!byLabel.has(group)) {
      byLabel.set(group, current);
      groups.push(current);
    }
  });
  return groups;
}

function BackIcon() {
  return <svg className="h-[16px] w-[22px] shrink-0" fill="none" viewBox="0 0 22 16" aria-hidden><path d="M7.1 1.6 1.7 8l5.4 6.4M2.5 8h18" stroke="#131313" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronDownIcon() {
  return <svg className="size-[16px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8.7063 11.3741C8.31584 11.7646 7.68173 11.7646 7.29127 11.3741L3.29293 7.3757C3.00555 7.08831 2.92121 6.66035 3.0774 6.2855C3.23358 5.91065 3.59593 5.66699 4.00201 5.66699H11.9987C12.4016 5.66699 12.7671 5.91065 12.9233 6.2855C13.0795 6.66035 12.992 7.08831 12.7078 7.3757L8.70942 11.3741H8.7063Z" fill="#131313" /></svg>;
}

export function TwoStepTableSelectFilter({ value, onChange, width, allLabel, options, detailTitle = (group) => `Sectores de ${group}` }: TwoStepTableSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const groups = useMemo(() => buildGroups(options), [options]);
  const selectedGroup = groups.find((group) => group.options.some((option) => option.value === value));
  const activeOptions = groups.find((group) => group.label === activeGroup)?.options ?? [];
  const displayValue = value || allLabel;

  function close() {
    setOpen(false);
    setActiveGroup(null);
  }

  function selectGroup(group: OptionGroup) {
    if (group.options.length <= 1 && group.options[0]) {
      onChange(group.options[0].value);
      close();
      return;
    }
    setActiveGroup(group.label);
  }

  return (
    <div className="relative">
      {open ? <button className="fixed inset-0 z-[90] cursor-default" type="button" aria-label="Cerrar selector" onClick={close} /> : null}
      <button className="bg-white border border-[#d1d1d1] border-solid flex h-[26px] items-center justify-center gap-[8px] overflow-hidden rounded-[8px] px-[8px] py-[5px] font-['Inter:Regular',sans-serif] text-[13px] font-normal leading-[normal] text-[#131313] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0" style={{ width: `${width}px` }} type="button" onClick={() => setOpen((current) => !current)}>
        <span className="min-w-0 flex-1 truncate text-left">{displayValue}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div className="absolute left-0 top-[30px] z-[100] flex w-[316px] flex-col items-start rounded-[12px] bg-white p-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
          {activeGroup ? (
            <>
              <button className="flex w-full items-center gap-[8px] rounded-[8px] bg-white px-[8px] py-[12px] text-left" type="button" onClick={() => setActiveGroup(null)}>
                <BackIcon />
                <span className="min-w-0 flex-1 font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold leading-[22.7px] tracking-[0.28px] text-[#131313]">{detailTitle(activeGroup)}</span>
              </button>
              {activeOptions.map((option) => (
                <button key={option.value} className={`flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[12px] text-left ${option.value === value ? 'bg-[#e3e3e3]' : 'bg-white'}`} type="button" onClick={() => { onChange(option.value); close(); }}>
                  <span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">{option.label}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <button className={`flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[12px] text-left ${!value ? 'bg-[#e3e3e3]' : 'bg-white'}`} type="button" onClick={() => { onChange(''); close(); }}>
                <span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">{allLabel}</span>
              </button>
              {groups.map((group) => (
                <button key={group.label} className={`flex w-full items-center gap-[8px] rounded-[8px] px-[8px] py-[12px] text-left ${selectedGroup?.label === group.label ? 'bg-[#e3e3e3]' : 'bg-white'}`} type="button" onClick={() => selectGroup(group)}>
                  <span className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[22.7px] tracking-[0.28px] text-[#131313]">{group.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
