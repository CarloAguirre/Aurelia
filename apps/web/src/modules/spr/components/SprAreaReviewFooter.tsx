import { useState } from 'react';
import { SprFooterInfoIcon, SprRejectCrossIcon, SprSubmitIcon } from '../icons/SprIcons';
import { SPR_AREA_REVIEW } from '../spr.constants';
import { SprAreaRejectModal } from './SprAreaRejectModal';

interface SprAreaReviewFooterProps {
  isApproving: boolean;
  isRejecting: boolean;
  canAct: boolean;
  actionErrorMessage: string | null;
  responsibleLabel: string;
  rejectErrorMessage: string | null;
  onRejectConfirm: (comments: string) => Promise<void>;
  onApprove: () => void;
}

// Footer de acciones del gerente (Figma 1395:12112) + modal rechazo (1399:14886).
export function SprAreaReviewFooter({
  isApproving,
  isRejecting,
  canAct,
  actionErrorMessage,
  responsibleLabel,
  rejectErrorMessage,
  onRejectConfirm,
  onApprove,
}: SprAreaReviewFooterProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const isBusy = isApproving || isRejecting;
  const footerMessage = actionErrorMessage ?? SPR_AREA_REVIEW.footerInfo;

  function handleOpenRejectModal() {
    if (!canAct || isBusy) return;
    setRejectModalOpen(true);
  }

  function handleCloseRejectModal() {
    if (isRejecting) return;
    setRejectModalOpen(false);
  }

  async function handleConfirmReject(comments: string) {
    try {
      await onRejectConfirm(comments);
      setRejectModalOpen(false);
    } catch {
      // Mantener el modal abierto; el error se muestra via rejectErrorMessage.
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[10px] border-t border-[#e3e3e3] bg-white px-[24px] py-[13px]">
        <div className="flex items-center gap-[6px]">
          <SprFooterInfoIcon className="h-[11px] w-[13.75px] shrink-0 text-[#646464]" />
          <p
            className={`font-['Inter:Regular',sans-serif] text-[11px] ${actionErrorMessage ? 'text-[#bd3b5b]' : 'text-[#646464]'}`}
          >
            {footerMessage}
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            data-action="spr-area-reject"
            onClick={handleOpenRejectModal}
            disabled={!canAct || isBusy}
            className="flex h-[36px] items-center gap-[6px] rounded-[8px] border-[1.5px] border-[#e3e3e3] bg-white px-[21.5px] font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#bd3b5b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SprRejectCrossIcon className="h-[11px] w-[13.75px] shrink-0 text-[#bd3b5b]" />
            {isRejecting ? 'Rechazando…' : SPR_AREA_REVIEW.rejectLabel}
          </button>
          <button
            type="button"
            data-action="spr-area-approve"
            onClick={onApprove}
            disabled={!canAct || isBusy}
            className="flex h-[36px] items-center gap-[6px] rounded-[8px] bg-[#c8a064] px-[24px] font-['Inter:Bold',sans-serif] text-[12px] font-bold text-[#001e39] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SprSubmitIcon className="h-[13px] w-[16.25px] shrink-0 text-[#001e39]" />
            {isApproving ? 'Aprobando…' : SPR_AREA_REVIEW.approveLabel}
          </button>
        </div>
      </div>

      <SprAreaRejectModal
        open={rejectModalOpen}
        responsibleLabel={responsibleLabel}
        isSubmitting={isRejecting}
        submitErrorMessage={rejectModalOpen ? rejectErrorMessage : null}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
