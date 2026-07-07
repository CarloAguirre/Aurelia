import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TwoStepTableSelectFilter } from './TwoStepTableSelectFilter';

type SelectTarget = {
  select: HTMLSelectElement;
  host: HTMLElement;
};

type SelectBridgeConfig = {
  selector: string;
  width: number;
  allLabel: string;
  detailTitle?: (group: string) => string;
};

const dateInputSelector = 'table thead tr:nth-child(2) td:nth-child(2) input';

function findSelectTarget(selector: string): SelectTarget | null {
  const select = document.querySelector<HTMLSelectElement>(selector);
  const host = select?.parentElement;
  if (!select || !host) return null;
  return { select, host };
}

function readSelectOptions(select: HTMLSelectElement) {
  return Array.from(select.options)
    .map((option) => option.value.trim())
    .filter(Boolean);
}

function readSelectLabel(select: HTMLSelectElement, fallback: string) {
  return select.options[0]?.textContent?.trim() || fallback;
}

function toShortYearDate(value: string) {
  const match = value.match(/^(\d{2}-\d{2})-(\d{4})$/);
  const prefix = match?.[1];
  const year = match?.[2];
  if (!prefix || !year) return value;
  return `${prefix}-${year.slice(-2)}`;
}

function normalizeDateInput() {
  const input = document.querySelector<HTMLInputElement>(dateInputSelector);
  if (!input) return;
  input.placeholder = 'dd-mm-aa';
  const normalized = toShortYearDate(input.value);
  if (normalized === input.value) return;
  input.value = normalized;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function SelectFilterBridge({ selector, width, allLabel, detailTitle }: SelectBridgeConfig) {
  const [target, setTarget] = useState<SelectTarget | null>(null);
  const [value, setValue] = useState('');
  const [label, setLabel] = useState(allLabel);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    function syncTarget() {
      const nextTarget = findSelectTarget(selector);
      normalizeDateInput();
      if (!nextTarget) {
        setTarget(null);
        return;
      }
      nextTarget.host.style.position = 'relative';
      nextTarget.select.style.opacity = '0';
      nextTarget.select.style.pointerEvents = 'none';
      nextTarget.select.tabIndex = -1;
      setTarget(nextTarget);
      setValue(nextTarget.select.value);
      setLabel(readSelectLabel(nextTarget.select, allLabel));
      setOptions(readSelectOptions(nextTarget.select));
    }

    syncTarget();
    const observer = new MutationObserver(syncTarget);
    const interval = window.setInterval(normalizeDateInput, 100);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [allLabel, selector]);

  useEffect(() => {
    if (!target) return undefined;
    const select = target.select;
    function syncValue() {
      setValue(select.value);
    }
    select.addEventListener('change', syncValue);
    return () => select.removeEventListener('change', syncValue);
  }, [target]);

  function changeValue(nextValue: string) {
    if (!target) return;
    target.select.value = nextValue;
    setValue(nextValue);
    target.select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (!target) return null;

  return createPortal(<div className="absolute left-0 top-0 z-[1]"><TwoStepTableSelectFilter value={value} onChange={changeValue} width={width} allLabel={label} options={options} detailTitle={detailTitle} /></div>, target.host);
}

export function InspectionAreaSectorFilterBridge() {
  return <><SelectFilterBridge selector="table thead tr:nth-child(2) td:nth-child(4) select" width={184} allLabel="Todas las áreas" detailTitle={(group) => `Sectores de ${group}`} /><SelectFilterBridge selector="table thead tr:nth-child(2) td:nth-child(7) select" width={172} allLabel="Todas" detailTitle={(group) => group} /></>;
}
