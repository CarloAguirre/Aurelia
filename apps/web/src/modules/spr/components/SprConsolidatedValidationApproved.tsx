import { Fragment, useState } from 'react';
import { SprConfirmSendIcon, SprProcessStatusDocumentIcon, SprWarningTriangleIcon } from '../icons/SprIcons';
import { SPR_CONSOLIDATED_REPORT, type SprKpiValidationRowStatus } from '../spr.constants';

const copy = SPR_CONSOLIDATED_REPORT.validacionAprobada;
const kpiRows = SPR_CONSOLIDATED_REPORT.validacionAprobadaKpiRows;

function areaPillClass(tone: 'blue' | 'amber') {
  return tone === 'blue' ? 'bg-[#e6f3ff] text-[#0d3862]' : 'bg-[#fdf3e3] text-[#8e6e3e]';
}

function avatarClass(tone: 'blue' | 'amber') {
  return tone === 'blue' ? 'bg-[#e6f3ff] text-[#0d3862]' : 'bg-[#fdf3e3] text-[#8e6e3e]';
}

function StatusBadge({ status }: { status: SprKpiValidationRowStatus }) {
  if (status === 'confirmedWithDiscrepancy') {
    return (
      <span className="inline-flex items-center gap-[4px] rounded-[4px] bg-[#e0ffd3] px-[7px] py-[2px] font-['Inter:Bold',sans-serif] text-[9px] font-bold text-[#2a5c16]">
        <span aria-hidden>✓</span>
        Confirmado con 1 discrepancia
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[4px] rounded-[4px] bg-[#e0ffd3] px-[7px] py-[2px] font-['Inter:Bold',sans-serif] text-[9px] font-bold text-[#2a5c16]">
      <span aria-hidden>✓</span>
      Confirmado
    </span>
  );
}

function DiscrepancyBadge() {
  return (
    <span className="inline-flex items-center gap-[4px] rounded-[4px] bg-[#ffd0db] px-[7px] py-[2px] font-['Inter:Bold',sans-serif] text-[9px] font-bold text-[#570b1d]">
      <SprWarningTriangleIcon className="h-[8px] w-[10px] shrink-0" />
      Discrepancia
    </span>
  );
}

function ValidacionAprobadaInfoBanner() {
  return (
    <div className="flex items-start gap-[9px] rounded-[8px] border border-[rgba(42,92,22,0.2)] bg-[#e0ffd3] px-[15px] py-[11px]">
      <span className="mt-px flex h-[14px] w-[17.5px] shrink-0 items-center justify-center text-[#2a5c16]" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M4.25 7.25L6.25 9.25L9.75 4.75"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="font-['Inter:Regular',sans-serif] text-[10.5px] leading-[15.75px] text-[#2a5c16]">
        {copy.sacTabInfoBanner}
      </p>
    </div>
  );
}

// Figma 2035:6977 / 2035:7228 / 2035:10382 — tabla KPI validación aprobada con fila expandible.
export function SprConsolidatedValidationApproved({
  hideInfoBanner = false,
  defaultExpandedRowId = null,
}: {
  hideInfoBanner?: boolean;
  defaultExpandedRowId?: string | null;
}) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(defaultExpandedRowId);

  return (
    <div className="flex flex-col gap-[14px]">
      {hideInfoBanner ? null : <ValidacionAprobadaInfoBanner />}

      <section className="overflow-hidden rounded-[9px] border border-[#e3e3e3] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-[8px] border-b border-[#e3e3e3] px-[14px] py-[10px]">
          <div className="flex items-center gap-[7px]">
            <SprProcessStatusDocumentIcon className="h-[12px] w-[15px] shrink-0 text-[#001e39]" />
            <p className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#001e39]">
              {copy.kpiTableTitle}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7]">
                {['KPI', 'Área', 'Responsable', 'Valor SAC', 'Estado', 'Comentario'].map((header) => (
                  <th
                    key={header}
                    className="border-b border-[#e3e3e3] px-[12px] py-[8px] text-left font-['Inter:Bold',sans-serif] text-[9.5px] font-bold uppercase tracking-[0.48px] text-[#646464]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpiRows.map((row) => {
                const isExpandable = 'expandable' in row && row.expandable;
                const isExpanded = expandedRowId === row.id;
                const discrepancyComment =
                  'discrepancyComment' in row && row.discrepancyComment
                    ? row.discrepancyComment
                    : SPR_CONSOLIDATED_REPORT.validacionDiscrepancia.commentFallback;

                return (
                  <Fragment key={row.id}>
                    <tr key={row.id} className="border-b border-[#f4f6f9]">
                      <td
                        className="px-[12px] py-[10px] font-['Inter:Regular',sans-serif] text-[11px] text-[#333]"
                        rowSpan={isExpandable && isExpanded ? 2 : 1}
                      >
                        {row.kpi}
                      </td>
                      <td
                        className="px-[12px] py-[10px]"
                        rowSpan={isExpandable && isExpanded ? 2 : 1}
                      >
                        <span
                          className={`rounded-[4px] px-[6px] py-[2px] font-['Inter:Semi_Bold',sans-serif] text-[9px] font-semibold ${areaPillClass(row.areaTone)}`}
                        >
                          {row.area}
                        </span>
                      </td>
                      <td
                        className="px-[12px] py-[10px]"
                        rowSpan={isExpandable && isExpanded ? 2 : 1}
                      >
                        <div className="flex items-center gap-[7px]">
                          <span
                            className={`flex size-[24px] items-center justify-center rounded-full font-['Inter:Bold',sans-serif] text-[9px] font-bold ${avatarClass(row.responsibleTone)}`}
                          >
                            {row.responsibleInitials}
                          </span>
                          <span className="font-['Inter:Regular',sans-serif] text-[11px] text-[#333]">
                            {row.responsibleName}
                          </span>
                        </div>
                      </td>
                      <td className="px-[12px] py-[10px] font-['Inter:Bold',sans-serif] text-[11px] font-bold text-[#333]">
                        {row.sacValue}
                      </td>
                      <td className="px-[12px] py-[10px]">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="max-w-[280px] px-[12px] py-[10px]">
                        {isExpandable ? (
                          <button
                            type="button"
                            onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                            className="flex w-full items-center justify-between gap-[8px] text-left"
                            aria-expanded={isExpanded}
                          >
                            <span className="font-['Inter:Regular',sans-serif] text-[10px] text-[#acacac]">
                              {row.comment}
                            </span>
                            <svg
                              className={`size-[16px] shrink-0 text-[#646464] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M4 6L8 10L12 6"
                                stroke="currentColor"
                                strokeWidth="1.25"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          <p className="font-['Inter:Regular',sans-serif] text-[10px] text-[#acacac]">{row.comment}</p>
                        )}
                      </td>
                    </tr>
                    {isExpandable && isExpanded ? (
                      <tr key={`${row.id}-detail`} className="border-b border-[#f4f6f9]">
                        <td className="px-[12px] py-[10px] font-['Inter:Bold',sans-serif] text-[11px] font-bold text-[#333]">
                          {copy.previousSacValueLabel}
                        </td>
                        <td className="px-[12px] py-[10px]">
                          <DiscrepancyBadge />
                        </td>
                        <td className="max-w-[280px] px-[12px] py-[10px]">
                          <p className="rounded-[5px] bg-[#ffd0db] px-[8px] py-[6px] font-['Inter:Italic',sans-serif] text-[10.5px] italic leading-[15.75px] text-[#570b1d]">
                            {discrepancyComment}
                          </p>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[10px] border-t border-[#e3e3e3] bg-[#f7f7f7] px-[14px] py-[10px]">
          <p className="font-['Inter:Regular',sans-serif] text-[11px] text-[#646464]">{copy.footerSummary}</p>
          <button
            type="button"
            className="flex h-[27px] items-center gap-[5px] rounded-[6px] border border-[#e3e3e3] bg-white px-[12px] font-['Inter:Semi_Bold',sans-serif] text-[10.5px] font-semibold text-[#646464]"
          >
            <SprConfirmSendIcon className="h-[10px] w-[12.5px] shrink-0 text-[#646464]" />
            {copy.resendReminderLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
