type IconProps = {
  className?: string;
};

export function ClearFiltersIcon({ className = 'h-[10px] w-[12.5px]' }: IconProps) {
  return (
    <svg className={className} width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">
      <path d="M2.25 1.25L10.75 8.75M10.75 1.25L2.25 8.75" stroke="#646464" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
