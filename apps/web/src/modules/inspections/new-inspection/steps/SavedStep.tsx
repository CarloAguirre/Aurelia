import { InspectionAnswerValue, InspectionType } from '@aurelia/contracts';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';

interface SavedStepProps {
  onClose: () => void;
  onCreateAnother: () => void;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-[12px] border-b border-[#E3E3E3] px-[12px] py-[9px] last:border-b-0">
      <span className="text-[12px] font-semibold text-[#646464]">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right text-[12px] font-bold text-[#131313]">{value || '—'}</span>
    </div>
  );
}

export function SavedStep({ onClose, onCreateAnother }: SavedStepProps) {
  const draft = useNewInspectionDraftStore();
  const isFinding = draft.inspectionType === InspectionType.ENVIRONMENTAL;
  const checklistFindings = Object.values(draft.answersByItemId).filter((value) => value === InspectionAnswerValue.NOT_COMPLIANT).length;
  const findingObservations = draft.findingObservations.filter((item) => item.saved).length;
  const recordType = isFinding ? 'Hallazgo' : 'Checklist normativo';
  const findingsLabel = isFinding ? `${findingObservations} observación${findingObservations === 1 ? '' : 'es'}` : `${checklistFindings} hallazgo${checklistFindings === 1 ? '' : 's'}`;

  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[16px] py-[8px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center justify-between">
          <div>
            <p className="text-[18px] font-semibold">Inspección guardada</p>
            <p className="mt-[1px] text-[13px] text-[rgba(255,255,255,0.62)]">AurelIA · Registro finalizado</p>
          </div>
          <div className="mr-[2px] rounded-[16px] bg-[#C8A064] px-[10px] py-[2px]">
            <span className="text-[10px] font-bold text-[#001E39]">GF HSE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[20px] pb-[24px] pt-[28px] text-center">
        <div className="mx-auto mb-[14px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#35A137] text-[36px] text-white">✓</div>
        <p className="text-[22px] font-bold text-[#131313]">Registro completado</p>
        <p className="mx-auto mt-[8px] max-w-[310px] text-[13px] leading-[18px] text-[#646464]">
          La inspección fue guardada correctamente. El dashboard se actualizará con los nuevos datos.
        </p>

        <div className="mt-[18px] overflow-hidden rounded-[16px] border border-[#E3E3E3] bg-white text-left shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between bg-[#002659] px-[12px] py-[9px] text-white">
            <span className="text-[12px] font-bold">Resumen enviado</span>
            <span className="rounded-full bg-[#DDF7F3] px-[8px] py-[3px] text-[10px] font-bold text-[#006153]">{recordType}</span>
          </div>
          <SummaryItem label="Área" value={draft.areaName ?? 'Sin área'} />
          <SummaryItem label="Sector" value={draft.sectorName ?? 'Sin sector'} />
          <SummaryItem label="Fecha" value={draft.inspectionDate} />
          <SummaryItem label="Registro" value={draft.findingTypeLabel ?? draft.templateName ?? recordType} />
          <SummaryItem label="Empresa" value={draft.findingCompanyName ?? (checklistFindings > 0 || isFinding ? 'Sin empresa' : 'No aplica')} />
          <SummaryItem label="Observaciones" value={findingsLabel} />
        </div>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[10px] pt-[10px]">
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[16px] text-[14px] font-bold text-[#C8A064]"
            onClick={onCreateAnother}
          >
            Nueva inspección
          </button>
          <button
            type="button"
            className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] bg-[#35A137] text-[14px] font-bold text-white"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
