import { useEffect, useMemo } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSessionStore } from '../../../shared/stores/session.store';

type RuntimeAuthUser = {
  role?: string;
  roles?: string[];
  permissions?: string[];
};

function userRolesOf(user: RuntimeAuthUser | null): string[] {
  return [...new Set([...(user?.roles ?? []), user?.role].filter((role): role is string => Boolean(role)))];
}

function canReviewExecutedFindings(user: RuntimeAuthUser | null): boolean {
  const roles = userRolesOf(user);
  const permissions = user?.permissions ?? [];
  return roles.includes('ADMIN') || permissions.includes('inspections:review');
}

function WaitingApprovalIcon() {
  return (
    <svg className="h-[11px] w-[13.75px] shrink-0" width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="5.5" fill="#E8A820" />
      <path d="M5.5 2.55V5.5L7.55 6.65" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaitingReviewRow() {
  return (
    <div className="relative shrink-0">
      <div className="flex items-center gap-[6px] relative size-full">
        <WaitingApprovalIcon />
        <p className="whitespace-nowrap font-['Inter:Regular',sans-serif] text-[11px] font-normal leading-normal text-[#646464]">Esperando Aprobación o rechazo de observación</p>
      </div>
    </div>
  );
}

function isApproveButton(button: Element): boolean {
  return button.textContent?.replace(/\s+/g, ' ').trim().includes('Aprobar cierre') ?? false;
}

export function InspectionExecutedReviewRoleBridge() {
  const user = useSessionStore((state) => state.user) as RuntimeAuthUser | null;
  const canReview = useMemo(() => canReviewExecutedFindings(user), [user]);

  useEffect(() => {
    if (canReview) return undefined;

    const roots = new Map<HTMLElement, Root>();

    const apply = () => {
      document.querySelectorAll('button').forEach((button) => {
        if (!isApproveButton(button)) return;
        const row = button.parentElement;
        if (!(row instanceof HTMLElement)) return;
        if (row.dataset.executedReviewRoleBridge === 'waiting') return;

        row.dataset.executedReviewRoleBridge = 'waiting';
        row.className = 'flex w-full items-center justify-between rounded-[8px] bg-white px-[12px] py-[9px]';
        row.replaceChildren();
        const mount = document.createElement('div');
        mount.className = 'relative shrink-0';
        row.appendChild(mount);
        const root = createRoot(mount);
        roots.set(row, root);
        root.render(<WaitingReviewRow />);
      });
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    apply();

    return () => {
      observer.disconnect();
      roots.forEach((root) => root.unmount());
      roots.clear();
    };
  }, [canReview]);

  return null;
}
