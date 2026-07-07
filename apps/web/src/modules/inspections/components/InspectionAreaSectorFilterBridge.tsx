import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TwoStepTableSelectFilter } from './TwoStepTableSelectFilter';

type AreaSectorTarget = {
  select: HTMLSelectElement;
  host: HTMLElement;
};

const areaSectorSelectSelector = 'table thead tr:nth-child(2) td:nth-child(4) select';
const dateInputSelector = 'table thead tr:nth-child(2) td:nth-child(2) input';

function findAreaSectorTarget(): AreaSectorTarget | null {
  const select = document.querySelector<HTMLSelectElement>(areaSectorSelectSelector);
  const host = select?.parentElement;
  if (!select || !host) return null;
  return { select, host };
}

function readSelectOptions(select: HTMLSelectElement) {
  return Array.from(select.options)
    .map((option) => option.value.trim())
    .filter(Boolean);
}

function readSelectLabel(select: HTMLSelectElement) {
  return select.options[0]?.textContent?.trim() || 'Todas las áreas';
}

function toShortYearDate(value: string) {
  return value.replace(/^(\d{2}-\d{2})-(\d{4})$/, '$1-$2'.replace(/(\d{2}-\d{2})-(\d{2})(\d{2})/, '$1-$3'));
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
}

function normalizeDateInput() {
  const input = document.querySelector<HTMLInputElement>(dateInputSelector);
  if (!input) return;
  input.placeholder = 'dd-mm-aa';
  const normalized = toShortYearDate(input.value);
  if (normalized === input.value) return;
  setNativeInputValue(input, normalized);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function InspectionAreaSectorFilterBridge() {
  const [target, setTarget] = useState<AreaSectorTarget | null>(null);
  const [value, setValue] = useState('');
  const [allLabel, setAllLabel] = useState('Todas las áreas');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    function syncTarget() {
      const nextTarget = findAreaSectorTarget();
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
      setAllLabel(readSelectLabel(nextTarget.select));
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
  }, []);

  useEffect(() => {
    const currentTarget = target;
    if (!currentTarget) return undefined;
    function syncValue() {
      setValue(currentTarget.select.value);
    }
    currentTarget.select.addEventListener('change', syncValue);
    return () => currentTarget.select.removeEventListener('change', syncValue);
  }, [target]);

  function changeValue(nextValue: string) {
    if (!target) return;
    target.select.value = nextValue;
    setValue(nextValue);
    target.select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (!target) return null;

  return createPortal(<div className="absolute left-0 top-0 z-[1]"><TwoStepTableSelectFilter value={value} onChange={changeValue} width={184} allLabel={allLabel} options={options} /></div>, target.host);
}
