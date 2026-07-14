import { useEffect, useMemo } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSessionStore } from '../../../shared/stores/session.store';
import { InspectionDetailStatusRowIcon } from './InspectionDetailIcons';

type RuntimeAuthUser = {
  email?: string;
  role?: string;
  roles?: string[];
  companyName?: string | null;
};

function userRolesOf(user: RuntimeAuthUser | null): string[] {
  return [...new Set([...(user?.roles ?? []), user?.role].filter((role): role is string => Boolean(role)))];
}

function canReviewExecutedFindings(user: RuntimeAuthUser | null): boolean {
  const roles = userRolesOf(user);
  const email = user?.email?.trim().toLowerCase() ?? '';
  const companyName = user?.companyName?.trim().toLowerCase() ?? '';
  return roles.some((role) => ['ADMIN', 'SUPERVISOR', 'APPROVER'].includes(role)) || email.endsWith('@goldfields.com') || companyName.includes('gold field');
}

function WaitingReviewRow() {
  return (
    <div className="flex w-full items-center gap-[6px] rounded-[8px] bg-white px-[12px] py-[9px]">
      <InspectionDetailStatusRowIcon status="open" className="h-[11px] w-[13.75px] shrink-0" />
      <p className="whitespace-nowrap text-[11px] font-normal leading-none text-[#646464]">Esperando Aprobación o rechazo de observación</p>
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
        row.className = 'flex items-center gap-[8px] rounded-[8px] bg-white px-[12px] py-[9px]';
        row.replaceChildren();
        const mount = document.createElement('div');
        mount.className = 'w-full';
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
