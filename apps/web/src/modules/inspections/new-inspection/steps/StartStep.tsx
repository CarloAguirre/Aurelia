interface StartStepProps {
  onStartAssistant: () => void;
  onResumeAssistant?: () => void;
  onDiscardDraft?: () => void;
  onStartManual: () => void;
  onCancelInspection: () => void;
  hasAssistantDraft?: boolean;
  assistantDraftSavedAt?: string | null;
}

function FeatureRow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[5px]">
      <span className="text-[11px] leading-none text-[#2A5C16]">✓</span>
      <span className="text-[11px] leading-[15px] text-[#2A5C16]">{children}</span>
    </div>
  );
}

function formatDraftDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function StartStep({
  onStartAssistant,
  onResumeAssistant,
  onDiscardDraft,
  onStartManual,
  onCancelInspection,
  hasAssistantDraft = false,
  assistantDraftSavedAt = null,
}: StartStepProps) {
  const savedAtLabel = formatDraftDate(assistantDraftSavedAt);

  return (
    <>
      <div className="h-[56px] bg-[#002659] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center gap-[4px] px-[4px]">
          <button
            type="button"
            onClick={onCancelInspection}
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-[26px] font-light leading-none"
            aria-label="Volver"
          >
            ←
          </button>
          <div className="min-w-0 flex-1 px-[4px]">
            <p className="truncate text-[14px] font-semibold leading-[17px]">Nueva inspección</p>
            <p className="mt-[1px] truncate text-[11px] leading-[14px] text-[rgba(255,255,255,0.55)]">SGA · Gold Fields Salares Norte</p>
          </div>
          <div className="h-0 w-[48px] shrink-0" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F4F6F9] px-[20px] py-[24px]">
        <div className="pb-[4px] pt-[8px] text-center">
          <p className="mx-auto max-w-[320px] text-[18px] font-bold leading-[23.4px] text-[#131313]">
            ¿Cómo deseas registrar esta inspección?
          </p>
          <p className="mt-[6px] whitespace-nowrap text-[13px] leading-[18.2px] text-[#646464]">Puedes usar el asistente IA o el formulario manual</p>
        </div>

        {hasAssistantDraft ? (
          <div className="mt-[20px] w-full rounded-[16px] border-[2px] border-[#C8A064] bg-[#FFF8EA] p-[18px] shadow-[0_4px_8px_rgba(122,90,43,0.12)]">
            <div className="flex items-start gap-[12px]">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#8E6E3E] text-[18px] text-white">✦</div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#8E6E3E]">Borrador AurelIA disponible</p>
                <p className="mt-[4px] text-[12px] leading-[16px] text-[#646464]">
                  {savedAtLabel ? `Guardado el ${savedAtLabel}.` : 'Tienes una inspección conversacional sin terminar.'}
                </p>
              </div>
            </div>
            <div className="mt-[14px] grid gap-[8px]">
              <button
                type="button"
                onClick={onResumeAssistant}
                className="flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#C8A064] text-[13px] font-bold text-[#001E39]"
              >
                Continuar borrador
              </button>
              <button
                type="button"
                onClick={onDiscardDraft}
                className="h-[38px] w-full rounded-[10px] border border-[#C8A064] bg-white text-[12px] font-bold text-[#8E6E3E]"
              >
                Descartar borrador
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-[20px] w-full rounded-[16px] border-[2px] border-[#C8A064] bg-white p-[22px] shadow-[0_4px_8px_rgba(200,160,100,0.2)]">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#C8A064] to-[#8E6E3E] text-[16px] font-black text-white">AI</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-[17px] text-[#8E6E3E]">Asistente AurelIA</p>
              <p className="mt-[2px] text-[11px] leading-[13px] text-[#646464]">Modo conversacional con IA</p>
            </div>
            <div className="rounded-[4px] bg-[#C8A064] px-[8px] py-[3px]">
              <span className="text-[9px] font-bold leading-none text-[#001E39]">RECOMENDADO</span>
            </div>
          </div>

          <p className="mt-[12px] text-[12px] leading-[19.2px] text-[#333]">
            El asistente te guía con preguntas simples, propone medidas correctivas basadas en el historial de la faena y reduce el tiempo de registro.
          </p>

          <div className="mt-[12px] flex flex-col gap-[5px]">
            <FeatureRow>Medidas correctivas sugeridas por IA</FeatureRow>
            <FeatureRow>Criticidad calculada automáticamente</FeatureRow>
            <FeatureRow>Funciona online y offline</FeatureRow>
          </div>

          <button
            type="button"
            onClick={onStartAssistant}
            className="mt-[14px] flex h-[46px] w-full items-center justify-center gap-[8px] rounded-[12px] bg-[#C8A064] text-[14px] font-bold text-[#001E39]"
          >
            <span className="text-[16px]">✦</span>
            Iniciar con asistente
          </button>
        </div>

        <div className="mt-[20px] rounded-[16px] border-[1.5px] border-[#E3E3E3] bg-white p-[21.5px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] border border-[#E3E3E3] bg-[#F4F6F9] text-[20px] text-[#646464]">▣</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-[17px] text-[#131313]">Formulario manual</p>
              <p className="mt-[2px] text-[11px] leading-[14px] text-[#646464]">Wizard de 5 pasos</p>
            </div>
          </div>

          <p className="mt-[10px] pb-[12px] text-[12px] leading-[18px] text-[#646464]">
            Completa el formulario paso a paso como siempre. Sin asistencia de IA.
          </p>

          <button
            type="button"
            onClick={onStartManual}
            className="h-[42px] w-full rounded-[12px] border-[2px] border-[#D1D1D1] bg-white text-[13px] font-semibold text-[#333]"
          >
            Usar formulario manual
          </button>
        </div>
      </div>

      <div className="new-inspection-start-footer shrink-0 border-t border-[#E3E3E3] bg-white pb-[8px] pt-[10px]">
        <div className="px-[14px]">
          <button
            type="button"
            className="!flex !h-[50px] !w-full !min-w-0 !items-center !justify-center !rounded-[14px] !border-[2px] !border-[#C8A064] !bg-white !px-[20px] !text-center !text-[14px] !font-bold !text-[#C8A064]"
            onClick={onCancelInspection}
          >
            Cancelar inspección
          </button>
        </div>
        <div className="mx-auto mb-[4px] mt-[12px] h-[4px] w-[120px] rounded-[2px] bg-[#D1D1D1]" />
      </div>
    </>
  );
}
