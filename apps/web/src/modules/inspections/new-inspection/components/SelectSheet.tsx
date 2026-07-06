export interface SelectSheetOption {
  id: string;
  label: string;
  description?: string;
}

interface SelectSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: SelectSheetOption[];
  selectedId?: string | null;
  emptyText?: string;
  loading?: boolean;
  onClose: () => void;
  onSelect: (option: SelectSheetOption) => void;
}

export function SelectSheet({
  visible,
  title,
  subtitle,
  options,
  selectedId,
  emptyText = 'Sin opciones disponibles',
  loading = false,
  onClose,
  onSelect,
}: SelectSheetProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-[16px] right-[20px] top-[16px] z-[1100] flex w-[360px] max-w-[calc(100vw-40px)] items-end overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.58)]"
      onClick={onClose}
    >
      <div
        className="max-h-[76%] w-full overflow-hidden rounded-t-[20px] bg-white shadow-[0_-12px_32px_rgba(0,0,0,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-[76px] items-center gap-[12px] px-[24px] pt-[4px]">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold leading-[22px] text-[#131313]">{title}</p>
            {subtitle ? <p className="mt-[3px] text-[12px] leading-[16px] text-[#646464]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-none bg-transparent text-[34px] font-light leading-none text-[#131313]"
            onClick={onClose}
            aria-label="Cerrar selector"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(76vh-108px)] overflow-y-auto pb-[20px]">
          {loading ? <p className="border-t border-[#E3E3E3] px-[36px] py-[28px] text-[16px] leading-[24px] text-[#646464]">Cargando...</p> : null}
          {!loading && options.length === 0 ? <p className="border-t border-[#E3E3E3] px-[36px] py-[28px] text-[16px] leading-[24px] text-[#646464]">{emptyText}</p> : null}
          {!loading
            ? options.map((option) => {
                const selected = option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex min-h-[78px] w-full items-center border-t border-[#E3E3E3] px-[36px] py-[18px] text-left ${
                      selected ? 'bg-[#F6FAFF]' : 'bg-white'
                    }`}
                    onClick={() => onSelect(option)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-normal leading-[24px] text-[#131313]">{option.label}</p>
                      {option.description ? <p className="mt-[7px] text-[12px] leading-[16px] text-[#646464]">{option.description}</p> : null}
                    </div>
                  </button>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}
