export type InspectionDetailIconStatus = 'executed' | 'open' | 'closed' | 'rejected';

type IconProps = {
  className?: string;
};

type StatusIconProps = IconProps & {
  status: InspectionDetailIconStatus;
};

const statusColors: Record<InspectionDetailIconStatus, string> = {
  executed: '#570B1D',
  open: '#463100',
  closed: '#2A5C16',
  rejected: '#646464',
};

export function InspectionDetailCloseIcon({ className = 'size-[32px]' }: IconProps) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M7.5 7.5L24.5 24.5M24.5 7.5L7.5 24.5" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function InspectionDetailCaretDownIcon({ className = 'size-[16px]' }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.15 5.7C2.78 5.26 3.09 4.58 3.67 4.58H12.33C12.91 4.58 13.22 5.26 12.85 5.7L8.52 10.9C8.25 11.23 7.75 11.23 7.48 10.9L3.15 5.7Z" fill="#131313" />
    </svg>
  );
}

export function InspectionDetailStatusChipIcon({ status, className = 'h-[6px] w-[7.5px]' }: StatusIconProps) {
  return (
    <svg className={className} width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
      <circle cx="3.75" cy="3" r="3" fill={statusColors[status]} />
    </svg>
  );
}

export function InspectionDetailStatusRowIcon({ status, className = 'h-[11px] w-[13.75px]' }: StatusIconProps) {
  const color = statusColors[status];
  if (status === 'closed') {
    return (
      <svg className={className} width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
        <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
        <path d="M3.15 5.55L4.75 7.15L8.35 3.65" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'open') {
    return (
      <svg className={className} width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
        <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
        <path d="M5.5 2.55V5.5L7.55 6.65" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={className} width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
      <path d="M5.5 2.4V5.8" stroke="white" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="5.5" cy="8" r="0.7" fill="white" />
    </svg>
  );
}

export function InspectionDetailPdfIcon({ className = 'h-[13px] w-[16.25px]' }: IconProps) {
  return (
    <svg className={className} width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden="true">
      <path d="M4.25 1.25H9.65L12.75 4.4V12.75H4.25V1.25Z" fill="#333333" />
      <path d="M9.65 1.25V4.4H12.75" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M5.35 10.75V7.75H6.55C7.18 7.75 7.62 8.17 7.62 8.78C7.62 9.39 7.18 9.8 6.55 9.8H6.05V10.75H5.35ZM6.05 9.2H6.46C6.72 9.2 6.9 9.03 6.9 8.78C6.9 8.52 6.72 8.35 6.46 8.35H6.05V9.2Z" fill="white" />
      <path d="M7.95 10.75V7.75H9.05C9.93 7.75 10.5 8.35 10.5 9.25C10.5 10.15 9.93 10.75 9.05 10.75H7.95ZM8.65 10.12H9.01C9.49 10.12 9.78 9.8 9.78 9.25C9.78 8.7 9.49 8.38 9.01 8.38H8.65V10.12Z" fill="white" />
      <path d="M10.82 10.75V7.75H12.75V8.37H11.52V8.97H12.58V9.58H11.52V10.75H10.82Z" fill="white" />
    </svg>
  );
}

export function InspectionDetailImageIcon({ className = 'h-[18px] w-[22.5px]', tone = '#24588B' }: IconProps & { tone?: string }) {
  return (
    <svg className={className} width="23" height="18" viewBox="0 0 23 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="1" width="20" height="16" rx="2.5" fill={tone} />
      <circle cx="7.2" cy="6" r="2" fill="white" />
      <path d="M4.3 14.2L9.1 9.6L12.2 12.4L15.3 8.8L19.2 14.2H4.3Z" fill="white" />
    </svg>
  );
}

export function InspectionDetailRejectIcon({ className = 'h-[12px] w-[15px]' }: IconProps) {
  return (
    <svg className={className} width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
      <path d="M3.75 2.25L11.25 9.75M11.25 2.25L3.75 9.75" stroke="#570B1D" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InspectionDetailApproveIcon({ className = 'h-[12px] w-[15px]' }: IconProps) {
  return (
    <svg className={className} width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
      <path d="M3.1 6.2L6.15 9.25L11.9 2.75" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
