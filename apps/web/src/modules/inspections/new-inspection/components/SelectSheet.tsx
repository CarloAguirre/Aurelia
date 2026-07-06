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
    <div className="absolute inset-0 z-[6] flex items-end bg-[rgba(0,0,0,0.42)]" onClick={onClose}>
      <div
        className="max-h-[72%] w-full rounded-t-[20px] bg-white px-[16px] pb-[22px] pt-[8px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[12px] h-[4px] w-[46px] self-center rounded-[2px] bg-[#d1d1d1]" />
        <div className="flex items-center gap-[12px] pb-[10px]">
          <div className="flex-1">
            <p className="text-[18px] font-bold leading-[22px] text-[#131313]">{title}</p>
            {subtitle ? <p className="mt-[3px] text-[12px] leading-[16px] text-[#646464]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f2f2f2] text-[14px] text-[#131313]"
            onClick={onClose}
            aria-label="Cerrar selector"
          >
            ×
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto pb-[12px]">
          {loading ? <p className="py-[18px] text-center text-[13px] text-[#646464]">Cargando...</p> : null}
          {!loading && options.length === 0 ? <p className="py-[18px] text-center text-[13px] text-[#646464]">{emptyText}</p> : null}
          {!loading
            ? options.map((option) => {
                const selected = option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`mb-[8px] flex min-h-[52px] w-full items-center gap-[12px] rounded-[12px] border-[1.5px] px-[14px] py-[10px] text-left ${
                      selected ? 'border-[#00b398] bg-[#E9FFFB]' : 'border-[#e3e3e3] bg-[#FAFAFA]'
                    }`}
                    onClick={() => onSelect(option)}
                  >
                    <div className="flex-1">
                      <p className={`text-[14px] font-semibold leading-[18px] ${selected ? 'text-[#00b398]' : 'text-[#131313]'}`}>
                        {option.label}
                      </p>
                      {option.description ? (
                        <p className="mt-[2px] text-[11px] leading-[14px] text-[#646464]">{option.description}</p>
                      ) : null}
                    </div>
                    {selected ? <span className="text-[16px] text-[#00b398]">●</span> : null}
                  </button>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
}
