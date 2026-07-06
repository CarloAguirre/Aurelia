import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InspectionAnswerValue, InspectionType } from '@aurelia/contracts';
import { ManualFormStepper } from '../components/ManualFormStepper';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';
import { getCompanyUsers } from '../../../../shared/services/inspections.service';

interface SummaryStepProps {
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
  errorMessage: string | null;
}

function trimLocationLabel(value: string): string {
  return value.replace(/ \+\- .*/, '').trim();
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[34px] items-center justify-between gap-[10px] border-b border-[#E3E3E3] px-[12px] py-[8px]">
      <p className="text-[12px] font-medium text-[#646464]">{label}</p>
      <p className="max-w-[62%] text-right text-[12px] font-bold text-[#131313]">{value}</p>
    </div>
  );
}

export function SummaryStep({ onBack, onSave, saving, errorMessage }: SummaryStepProps) {
  const draft = useNewInspectionDraftStore();

  const usersByCompanyQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'company-users', draft.findingCompanyId],
    queryFn: () => getCompanyUsers(draft.findingCompanyId ?? ''),
    enabled: Boolean(draft.findingCompanyId),
  });

  const usersById = useMemo(
    () => new Map((usersByCompanyQuery.data ?? []).map((user) => [user.id, user.fullName])),
    [usersByCompanyQuery.data],
  );

  const checklistValues = Object.values(draft.answersByItemId);
  const yesCount = checklistValues.filter((value) => value === InspectionAnswerValue.COMPLIANT).length;
  const noCount = checklistValues.filter((value) => value === InspectionAnswerValue.NOT_COMPLIANT).length;
  const naCount = checklistValues.filter((value) => value === InspectionAnswerValue.NOT_APPLICABLE).length;
  const findingObservations = draft.findingObservations.filter((item) => item.saved);

  const isFindingFlow = draft.inspectionType === InspectionType.ENVIRONMENTAL;
  const stepperSteps = isFindingFlow ? ['Datos', 'Tipo', 'Obs.', 'Resumen'] : ['Datos', 'Tipo', 'Items', 'Resumen'];

  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[12px] py-[6px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center">
          <button type="button" className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px]" onClick={onBack}>
            ←
          </button>
          <div className="flex-1 px-[4px]">
            <p className="text-[18px] font-semibold">Resumen</p>
            <p className="mt-[1px] text-[13px] text-[rgba(255,255,255,0.55)]">Paso 4 de 5</p>
          </div>
          <div className="mr-[4px] rounded-[16px] bg-[#C8A064] px-[10px] py-[2px]">
            <span className="text-[10px] font-bold text-[#001E39]">GF HSE</span>
          </div>
        </div>
      </div>

      <div className="flex h-[23px] items-center gap-[7px] border-b border-[#C8A064] bg-[#2A1A04] px-[16px]">
        <span className="text-[11px] text-[#C8A064]">☁</span>
        <span className="text-[11px] font-semibold text-[#C8A064]">Sin red · guardando localmente</span>
      </div>

      <ManualFormStepper activeStep={4} steps={stepperSteps} />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[16px] pt-[14px]">
        <div className="flex flex-col gap-[4px]">
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Resumen</p>
          <p className="text-[12px] leading-[16.8px] text-[#646464]">Revisa antes de guardar</p>
        </div>

        <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
          <div className="min-h-[29px] border-b border-[#E3E3E3] bg-[#F7F7F7] px-[12px] py-[8px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#646464]">Quien realizo la inspeccion</p>
          </div>
          <SummaryRow label="Nombre" value={draft.inspectorName} />
          <SummaryRow label="Empresa" value={draft.inspectorCompanyName} />
        </div>

        <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
          <div className="min-h-[29px] border-b border-[#E3E3E3] bg-[#F7F7F7] px-[12px] py-[8px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#646464]">Donde y cuando</p>
          </div>
          <SummaryRow label="Area · Sector" value={`${draft.areaName ?? '-'} · ${draft.sectorName ?? '-'}`} />
          <SummaryRow label="Fecha" value={draft.inspectionDate} />
          <SummaryRow label="Tipo" value={draft.inspectionTypeLabel} />
          {!isFindingFlow ? <SummaryRow label="Plantilla" value={draft.templateName ?? '-'} /> : null}
          <SummaryRow label="Ubicacion" value={trimLocationLabel(draft.locationLabel)} />
        </div>

        {!isFindingFlow ? (
          <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
            <div className="min-h-[29px] border-b border-[#E3E3E3] bg-[#F7F7F7] px-[12px] py-[8px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#646464]">Resultado checklist</p>
            </div>
            <SummaryRow label="SI" value={`${yesCount}`} />
            <SummaryRow label="NO" value={`${noCount}`} />
            <SummaryRow label="N/A" value={`${naCount}`} />
          </div>
        ) : null}

        {isFindingFlow ? (
          <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
            <div className="min-h-[29px] border-b border-[#E3E3E3] bg-[#F7F7F7] px-[12px] py-[8px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#646464]">Observaciones ({findingObservations.length})</p>
            </div>
            {findingObservations.map((item, index) => (
              <div key={item.id} className="border-b border-[#E3E3E3] px-[12px] py-[10px] last:border-b-0">
                <div className="mb-[6px] flex items-center gap-[8px]">
                  <span className="rounded-[6px] bg-[#E6F3FF] px-[8px] py-[3px] text-[11px] font-bold text-[#24588B]">Obs. {index + 1}</span>
                  <span className="rounded-[8px] bg-[#FFE1CD] px-[8px] py-[3px] text-[10px] font-bold text-[#532A0E]">{item.severityLabel ?? 'Sin criticidad'}</span>
                </div>
                <p className="text-[12px] text-[#131313]">{item.detectedCondition || 'Sin descripcion'}</p>
              </div>
            ))}
          </div>
        ) : null}

        {draft.findingCompanyName ? (
          <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#E3E3E3] bg-white">
            <div className="min-h-[29px] border-b border-[#E3E3E3] bg-[#F7F7F7] px-[12px] py-[8px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#646464]">Responsables</p>
            </div>
            <SummaryRow label="EECC" value={draft.findingCompanyName} />
            <div className="px-[12px] py-[10px]">
              {draft.findingResponsibleIds.length === 0 ? (
                <p className="text-[12px] text-[#646464]">Sin responsables seleccionados</p>
              ) : (
                draft.findingResponsibleIds.map((id) => (
                  <p key={id} className="mb-[6px] text-[12px] text-[#131313] last:mb-0">• {usersById.get(id) ?? 'Responsable'}</p>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
        {errorMessage ? <p className="mb-[8px] text-[11px] text-[#BD3B5B]">{errorMessage}</p> : null}
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[20px] text-[14px] font-bold text-[#C8A064]"
            onClick={onBack}
          >
            Atras
          </button>
          <button
            type="button"
            className={`flex h-[50px] flex-1 items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold ${saving ? 'bg-[#8BC98C]' : 'bg-[#35A137]'} text-white`}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar inspeccion'}
            <span>✓</span>
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
