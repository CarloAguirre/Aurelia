interface StartStepProps {
  onStartAssistant: () => void;
  onStartManual: () => void;
  onCancelInspection: () => void;
}

function FeatureRow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[10px] text-[#1E8E3E]">✓</span>
      <span className="text-[13px] text-[#374151]">{children}</span>
    </div>
  );
}

export function StartStep({ onStartAssistant, onStartManual, onCancelInspection }: StartStepProps) {
  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[12px] py-[6px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center justify-between">
          <button
            type="button"
            onClick={onCancelInspection}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px]"
            aria-label="Volver"
          >
            ←
          </button>
          <div className="flex-1 px-[8px]">
            <p className="text-[18px] font-semibold">Nueva inspeccion</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.55)]">SGA · Gold Fields Salares Norte</p>
          </div>
          <div className="w-[40px]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F7F7F7] px-[20px] pb-[24px] pt-[32px]">
        <div className="pb-[4px] text-center">
          <p className="mx-auto max-w-[320px] text-[18px] font-bold leading-[23.4px] text-[#131313]">
            ¿Como deseas registrar esta inspeccion?
          </p>
          <p className="mt-[6px] text-[14px] leading-[18.2px] text-[#646464]">Puedes usar el asistente IA o el formulario manual</p>
        </div>

        <div className="mt-[20px] w-full rounded-[16px] border-[2px] border-[#C8A064] bg-white p-[22px] shadow-[0_4px_8px_rgba(122,90,43,0.16)]">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-[#7A5A2B] text-[20px] text-white">✦</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-[17px] text-[#7A5A2B]">Asistente AurelIA</p>
              <p className="mt-[2px] text-[12px] leading-[14px] text-[#646464]">Modo conversacional con IA</p>
            </div>
            <div className="rounded-[4px] bg-[#C8A064] px-[8px] py-[3px]">
              <span className="text-[9px] font-bold text-[#001E39]">RECOMENDADO</span>
            </div>
          </div>

          <p className="mt-[12px] text-[13px] leading-[18px] text-[#374151]">
            El asistente te guia con preguntas simples, propone medidas correctivas basadas en el historial de la faena y reduce el tiempo de registro.
          </p>

          <div className="mt-[12px] flex flex-col gap-[6px]">
            <FeatureRow>Medidas correctivas sugeridas por IA</FeatureRow>
            <FeatureRow>Criticidad calculada automaticamente</FeatureRow>
            <FeatureRow>Funciona online y offline</FeatureRow>
          </div>

          <button
            type="button"
            onClick={onStartAssistant}
            className="mt-[14px] flex h-[44px] w-full items-center justify-center gap-[8px] rounded-[10px] bg-[#C8A064] text-[14px] font-bold text-white"
          >
            <span>✦</span>
            Iniciar con asistente
          </button>
        </div>

        <div className="mt-[20px] rounded-[16px] border border-[#e3e3e3] bg-white p-[22px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-[#eef2f7] text-[20px] text-[#001E39]">📋</div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold leading-[17px] text-[#131313]">Formulario manual</p>
              <p className="mt-[2px] text-[12px] leading-[14px] text-[#646464]">Wizard de 5 pasos</p>
            </div>
          </div>

          <p className="mt-[12px] text-[13px] leading-[18px] text-[#374151]">
            Completa el formulario paso a paso como siempre. Sin asistencia de IA.
          </p>

          <button
            type="button"
            onClick={onStartManual}
            className="mt-[14px] h-[44px] w-full rounded-[10px] border-[2px] border-[#C8A064] bg-white text-[14px] font-bold text-[#7A5A2B]"
          >
            Usar formulario manual
          </button>
        </div>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[8px] pt-[10px]">
        <button
          type="button"
          className="h-[44px] w-full rounded-[14px] border-[2px] border-[#C8A064] text-[14px] font-bold text-[#C8A064]"
          onClick={onCancelInspection}
        >
          Cancelar inspeccion
        </button>
        <div className="mx-auto mb-[4px] mt-[12px] h-[4px] w-[120px] rounded-[2px] bg-[#d1d1d1]" />
      </div>
    </>
  );
}
