import { SprHistoricalAlertArrowIcon, SprHistoricalAlertIcon } from '../icons/SprIcons';
import { SPR_AREA_REVIEW } from '../spr.constants';
import { formatDeviationPercent, type SprHistoricalRangeResult } from '../sprHistoricalRange';

const numberFormatter = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });

interface SprHistoricalRangeAlertProps {
  historicalRange: SprHistoricalRangeResult;
  unitSymbol: string | null;
  variant?: 'entry' | 'review';
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col rounded-[6px] bg-[rgba(232,114,12,0.08)] px-[10px] py-[7px]">
      <p className="text-center font-['Inter:Bold',sans-serif] text-[9px] font-bold uppercase tracking-[0.54px] text-[#e8720c] opacity-70">{label}</p>
      <p className="pt-[2px] text-center font-['Inter:Bold',sans-serif] text-[13px] font-bold text-[#e8720c]">{value}</p>
    </div>
  );
}

// PLACEHOLDER: alerta de rango historico sin respaldo en backend (Figma 1395:4780 / 1399:14263).
export function SprHistoricalRangeAlert({ historicalRange, unitSymbol, variant = 'entry' }: SprHistoricalRangeAlertProps) {
  const { enteredValue, averageValue, deviationPercent } = historicalRange;
  if (enteredValue === null || averageValue === null || deviationPercent === null) return null;

  const unitSuffix = unitSymbol ? ` ${unitSymbol}` : '';
  const isReview = variant === 'review';

  return (
    <div className="flex flex-col gap-[8px] rounded-[9px] border-[1.5px] border-[#f5c4a0] bg-[#fff0e6] px-[14.5px] py-[12.5px]">
      <div className="flex items-start gap-[8px]">
        <SprHistoricalAlertIcon className="size-[16px] shrink-0 text-black" />
        <div className="flex flex-col gap-[2px]">
          <p className="font-['Inter:Bold',sans-serif] text-[11.5px] font-bold text-[#e8720c]">
            {isReview ? SPR_AREA_REVIEW.historicalAlertTitle : 'Valor fuera del rango histórico habitual'}
          </p>
          <p className="font-['Inter:Regular',sans-serif] text-[10.5px] leading-[15.75px] text-[#6b3a1f]">
            {isReview
              ? SPR_AREA_REVIEW.historicalAlertDescription
              : 'AurelIA detectó que el valor ingresado difiere en más de un 10% respecto al promedio de los últimos 6 meses para este parámetro. Revisa el dato e indica el motivo de la diferencia en el campo de notas.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-[10px] pt-[4px]">
        <MetricCard label="Valor ingresado" value={`${numberFormatter.format(enteredValue)}${unitSuffix}`} />
        <MetricCard label="Promedio 6 meses" value={`${numberFormatter.format(averageValue)}${unitSuffix}`} />
        <MetricCard label="Desviación" value={formatDeviationPercent(deviationPercent)} />
      </div>

      {!isReview ? (
        <div className="flex items-center gap-[6px] rounded-[6px] bg-[rgba(232,114,12,0.06)] px-[10px] py-[6px]">
          <SprHistoricalAlertArrowIcon className="h-[10.5px] w-[13.125px] shrink-0 text-[#6b3a1f]" />
          <p className="font-['Inter:Regular',sans-serif] text-[10.5px] text-[#6b3a1f]">
            Indica el motivo de la diferencia en el campo de notas — no bloquea el envío
          </p>
        </div>
      ) : null}
    </div>
  );
}
