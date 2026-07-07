import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TwoStepTableSelectFilter } from './TwoStepTableSelectFilter';

type AreaSectorTarget = {
  select: HTMLSelectElement;
  host: HTMLElement;
};

const areaSectorSelectSelector = 'table thead tr:nth-child(2) td:nth-child(4) select';

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

export function InspectionAreaSectorFilterBridge() {
  const [target, setTarget] = useState<AreaSectorTarget | null>(null);
  const [value, setValue] = useState('');
  const [allLabel, setAllLabel] = useState('Todas las áreas');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    function syncTarget() {
      const nextTarget = findAreaSectorTarget();
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
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!target) return undefined;
    function syncValue() {
      setValue(target.select.value);
    }
    target.select.addEventListener('change', syncValue);
    return () => target.select.removeEventListener('change', syncValue);
  }, [target]);

  function changeValue(nextValue: string) {
    if (!target) return;
    target.select.value = nextValue;
    setValue(nextValue);
    target.select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (!target) return null;

  return createPortal(<TwoStepTableSelectFilter value={value} onChange={changeValue} width={184} allLabel={allLabel} options={options} />, target.host);
}
