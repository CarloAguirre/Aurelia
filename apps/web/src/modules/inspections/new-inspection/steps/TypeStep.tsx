import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InspectionType } from '@aurelia/contracts';
import { ManualFormStepper } from '../components/ManualFormStepper';
import { useNewInspectionDraftStore } from '../state/newInspectionDraft.store';
import { getInspectionTemplates } from '../../../../shared/services/inspections.service';

interface TypeStepProps {
  onBack: () => void;
  onNext: () => void;
}

type ManualTypeOption = {
  type: InspectionType;
  title: string;
  description: string;
  icon: string;
};

function buildTypeOptions(templateCount: number | null, templatesLoading: boolean): ManualTypeOption[] {
  const templateText = templatesLoading
    ? 'Cargando plantillas · items NO generan hallazgo automatico'
    : `${templateCount ?? 0} plantillas disponibles · items NO generan hallazgo automatico`;

  return [
    {
      type: InspectionType.ENVIRONMENTAL,
      title: 'Hallazgo',
      description: 'Condicion subestandar detectada · registro libre con foto',
      icon: '⌕',
    },
    {
      type: InspectionType.REGULATORY,
      title: 'Checklist normativo',
      description: templateText,
      icon: '✓',
    },
  ];
}

function TypeOptionCard({
  option,
  selected,
  onPress,
}: {
  option: ManualTypeOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-[68px] w-full items-center gap-[12px] rounded-[12px] border-[1.5px] px-[15.5px] py-[15.5px] text-left shadow-[0_1px_1.5px_rgba(0,0,0,0.06)] ${
        selected ? 'border-[#C8A064] bg-[#FDF8F1]' : 'border-[#E3E3E3] bg-white opacity-50'
      }`}
      onClick={onPress}
    >
      <div
        className={`flex h-[40px] w-[40px] items-center justify-center rounded-[8px] ${
          selected ? 'bg-[#FDF0DC]' : 'bg-[#F7F7F7]'
        }`}
      >
        <span className={`text-[16px] ${selected ? 'text-[#8E6E3E]' : 'text-[#AAAAAA]'}`}>{option.icon}</span>
      </div>
      <div className="flex-1">
        <p className={`text-[14px] font-bold leading-[18px] ${selected ? 'text-[#8E6E3E]' : 'text-[#131313]'}`}>{option.title}</p>
        <p className="mt-[2px] text-[11px] leading-[14.3px] text-[#646464]">{option.description}</p>
      </div>
    </button>
  );
}

export function TypeStep({ onBack, onNext }: TypeStepProps) {
  const draft = useNewInspectionDraftStore();
  const setInspectionType = useNewInspectionDraftStore((state) => state.setInspectionType);
  const templatesQuery = useQuery({
    queryKey: ['inspections', 'new-inspection', 'templates'],
    queryFn: getInspectionTemplates,
  });

  const templateCount = templatesQuery.data?.length ?? null;
  const typeOptions = useMemo(
    () => buildTypeOptions(templateCount, templatesQuery.isLoading),
    [templateCount, templatesQuery.isLoading],
  );
  const canContinue = Boolean(draft.inspectionType);

  function selectType(option: ManualTypeOption) {
    setInspectionType(option.type, option.title);
  }

  function handleNext() {
    if (!canContinue) return;
    onNext();
  }

  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[12px] py-[6px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center">
          <button type="button" className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px]" onClick={onBack}>
            ←
          </button>
          <div className="flex-1 px-[4px]">
            <p className="text-[18px] font-semibold">Tipo de inspeccion</p>
            <p className="mt-[1px] text-[14px] text-[rgba(255,255,255,0.55)]">Paso 2 de 5</p>
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

      <ManualFormStepper activeStep={2} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[14px] pb-[24px] pt-[14px]">
        <div className="flex flex-col gap-[4px]">
          <p className="text-[18px] font-bold leading-[21.6px] text-[#131313]">Tipo de inspeccion</p>
          <p className="text-[12px] leading-[16.8px] text-[#646464]">
            Para esta inspeccion se ha seleccionado {draft.inspectionTypeLabel}
          </p>
        </div>

        <div className="mt-[12px] grid gap-[12px]">
          {typeOptions.map((option) => (
            <TypeOptionCard
              key={option.type}
              option={option}
              selected={draft.inspectionType === option.type}
              onPress={() => selectType(option)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
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
            className={`flex h-[50px] flex-1 items-center justify-center gap-[8px] rounded-[14px] text-[14px] font-bold ${
              canContinue ? 'bg-[#C8A064] text-white' : 'bg-[#E3E3E3] text-[#9aa0a6]'
            }`}
            onClick={handleNext}
            disabled={!canContinue}
          >
            Continuar
            <span>→</span>
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[14px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
