interface SavedStepProps {
  onClose: () => void;
  onCreateAnother: () => void;
}

export function SavedStep({ onClose, onCreateAnother }: SavedStepProps) {
  return (
    <>
      <div className="h-[56px] bg-[#001E39] px-[16px] py-[8px] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <div className="flex h-full items-center justify-between">
          <div>
            <p className="text-[18px] font-semibold">Inspeccion guardada</p>
            <p className="mt-[1px] text-[13px] text-[rgba(255,255,255,0.62)]">Paso final</p>
          </div>
          <div className="mr-[2px] rounded-[16px] bg-[#C8A064] px-[10px] py-[2px]">
            <span className="text-[10px] font-bold text-[#001E39]">GF HSE</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-[#F7F7F7] px-[20px] text-center">
        <div className="mb-[14px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#35A137] text-[36px] text-white">✓</div>
        <p className="text-[22px] font-bold text-[#131313]">Registro completado</p>
        <p className="mt-[8px] max-w-[300px] text-[13px] leading-[18px] text-[#646464]">
          La inspeccion fue guardada correctamente y el dashboard se actualizara con los nuevos datos.
        </p>
      </div>

      <div className="border-t border-[#e3e3e3] bg-white px-[14px] pb-[10px] pt-[10px]">
        <div className="flex w-full gap-[10px]">
          <button
            type="button"
            className="flex h-[50px] items-center justify-center rounded-[14px] border-[2px] border-[#C8A064] px-[16px] text-[14px] font-bold text-[#C8A064]"
            onClick={onCreateAnother}
          >
            Nueva inspeccion
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
