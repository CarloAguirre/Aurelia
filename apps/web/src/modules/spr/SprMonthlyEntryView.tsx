import { useMemo, useState } from 'react';
import type {
  CreateSprMonthlyRecordRequest,
  SprMonthlyRecordResponse,
  SprParameterAreaAssignmentResponse,
  SprParameterResponse,
  SprUnitResponse,
  UpdateSprMonthlyRecordRequest,
} from '@aurelia/contracts';
import { SprRecordStatus } from '@aurelia/contracts';
import { useSprParameters } from '../../shared/hooks/useSprParameters';
import { useSprAssignments } from '../../shared/hooks/useSprAssignments';
import { useSprUnits } from '../../shared/hooks/useSprUnits';
import { useSprMonthlyRecords } from '../../shared/hooks/useSprMonthlyRecords';
import { useSaveSprMonthlyRecord } from '../../shared/hooks/useSaveSprMonthlyRecord';
import { useSubmitSprMonthlyRecord } from '../../shared/hooks/useSubmitSprMonthlyRecord';
import { useSprRecordEvidences } from '../../shared/hooks/useSprRecordEvidences';
import { useUploadSprRecordEvidence } from '../../shared/hooks/useUploadSprRecordEvidence';
import { getSprRecordEvidences } from '../../shared/services/spr.service';
import { SprCycleContextHeader } from './components/SprCycleContextHeader';
import { SprParametersList } from './components/SprParametersList';
import { SprParameterDetailForm } from './components/SprParameterDetailForm';
import { SprDocumentsSection } from './components/SprDocumentsSection';
import { SprFooterActions } from './components/SprFooterActions';
import { SprSubmitModal } from './components/SprSubmitModal';
import { SprHistoricalRangeBadge } from './components/SprHistoricalRangeBadge';
import { SprRejectionAlertBanner } from './components/SprRejectionAlertBanner';
import { SprTraceabilityIcon } from './icons/SprIcons';
import { SPR_ACTIVE_CYCLE } from './spr.constants';
import { parameterRequiresEvidence } from './sprEvidence';
import { evaluateHistoricalRange, parseSprNumericValue } from './sprHistoricalRange';
import type { SprRejectionContext } from './sprRejectedContext';
import { getSprFormEntry, useSprMonthlyFormStore, type SprParameterFormEntry } from './state/sprMonthlyForm.store';
import type { SprParameterRow } from './spr.types';

interface SprMonthlyEntryViewProps {
  correctionMode?: boolean;
  rejectionContext?: SprRejectionContext | null;
}

const numberFormatter = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function looksNotApplicable(text: string | null | undefined) {
  return Boolean(text && /no aplica/i.test(text));
}

function recordHasValue(record: SprMonthlyRecordResponse | null) {
  if (!record) return false;
  return record.numericValue !== null || (record.textValue !== null && record.textValue.trim() !== '');
}

function buildUnitSymbolMap(units: SprUnitResponse[] | undefined) {
  const map = new Map<string, string>();
  (units ?? []).forEach((unit) => {
    if (unit.symbol) map.set(unit.id, unit.symbol);
  });
  return map;
}

function buildRecordMap(records: SprMonthlyRecordResponse[] | undefined) {
  const map = new Map<string, SprMonthlyRecordResponse>();
  (records ?? []).forEach((record) => map.set(record.parameterId, record));
  return map;
}

function buildAssignmentMap(assignments: SprParameterAreaAssignmentResponse[] | undefined) {
  const map = new Map<string, SprParameterAreaAssignmentResponse>();
  (assignments ?? []).forEach((assignment) => {
    if (!map.has(assignment.parameterId)) map.set(assignment.parameterId, assignment);
  });
  return map;
}

// Combina el borrador de UI (Zustand) con el registro persistido para mostrar el valor efectivo.
function resolveEntry(draft: SprParameterFormEntry, record: SprMonthlyRecordResponse | null): SprParameterFormEntry {
  const recordValue = record?.numericValue !== null && record?.numericValue !== undefined
    ? formatNumber(record.numericValue)
    : record?.textValue ?? '';
  return {
    value: draft.value !== '' ? draft.value : recordValue,
    notApplicable: draft.notApplicable || looksNotApplicable(record?.textValue),
    source: draft.source,
    note: draft.note !== '' ? draft.note : record?.notes ?? '',
  };
}

function buildRow(
  parameter: SprParameterResponse,
  record: SprMonthlyRecordResponse | null,
  unitSymbol: string | null,
  draft: SprParameterFormEntry,
): SprParameterRow {
  const notApplicable = draft.notApplicable || looksNotApplicable(record?.textValue);
  const hasDraftValue = draft.value.trim() !== '';
  const completed = notApplicable || hasDraftValue || recordHasValue(record);
  const completion = notApplicable ? 'not-applicable' : completed ? 'completed' : 'pending';

  let valueLabel = 'Sin completar';
  if (notApplicable) {
    valueLabel = 'No aplica';
  } else if (hasDraftValue) {
    valueLabel = unitSymbol ? `${draft.value} ${unitSymbol}` : draft.value;
  } else if (record?.numericValue !== null && record?.numericValue !== undefined) {
    valueLabel = unitSymbol ? `${formatNumber(record.numericValue)} ${unitSymbol}` : formatNumber(record.numericValue);
  } else if (record?.textValue) {
    valueLabel = record.textValue;
  }

  const effectiveValue = hasDraftValue
    ? draft.value
    : record?.numericValue !== null && record?.numericValue !== undefined
      ? String(record.numericValue).replace('.', ',')
      : record?.textValue ?? '';

  const historicalRange = notApplicable ? null : evaluateHistoricalRange(parameter.code, effectiveValue);
  const needsHistoricalReview = Boolean(historicalRange?.isOutOfRange);

  return { parameter, record, unitSymbol, completion, valueLabel, needsHistoricalReview, historicalRange };
}

function parseNumeric(value: string): number | null {
  return parseSprNumericValue(value);
}

export function SprMonthlyEntryView({ correctionMode = false, rejectionContext = null }: SprMonthlyEntryViewProps) {
  const parametersQuery = useSprParameters();
  const unitsQuery = useSprUnits();
  const assignmentsQuery = useSprAssignments();
  const recordsQuery = useSprMonthlyRecords({
    periodYear: SPR_ACTIVE_CYCLE.periodYear,
    periodMonth: SPR_ACTIVE_CYCLE.periodMonth,
  });

  const saveMutation = useSaveSprMonthlyRecord();
  const submitMutation = useSubmitSprMonthlyRecord();
  const uploadEvidenceMutation = useUploadSprRecordEvidence();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitEvidenceError, setSubmitEvidenceError] = useState<string | null>(null);
  const [rejectionBannerDismissed, setRejectionBannerDismissed] = useState(false);

  const selectedParameterId = useSprMonthlyFormStore((state) => state.selectedParameterId);
  const entries = useSprMonthlyFormStore((state) => state.entries);
  const selectParameter = useSprMonthlyFormStore((state) => state.selectParameter);
  const setValue = useSprMonthlyFormStore((state) => state.setValue);
  const setNotApplicable = useSprMonthlyFormStore((state) => state.setNotApplicable);
  const setSource = useSprMonthlyFormStore((state) => state.setSource);
  const setNote = useSprMonthlyFormStore((state) => state.setNote);

  const unitSymbolMap = useMemo(() => buildUnitSymbolMap(unitsQuery.data), [unitsQuery.data]);
  const recordMap = useMemo(() => buildRecordMap(recordsQuery.data), [recordsQuery.data]);
  const assignmentMap = useMemo(() => buildAssignmentMap(assignmentsQuery.data), [assignmentsQuery.data]);

  const rows = useMemo<SprParameterRow[]>(() => {
    const parameters = [...(parametersQuery.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'));
    return parameters.map((parameter) => {
      const record = recordMap.get(parameter.id) ?? null;
      const unitSymbol = parameter.unitId ? unitSymbolMap.get(parameter.unitId) ?? null : null;
      const draft = getSprFormEntry(entries, parameter.id);
      return buildRow(parameter, record, unitSymbol, draft);
    });
  }, [parametersQuery.data, recordMap, unitSymbolMap, entries]);

  const totalCount = rows.length;
  const completedCount = rows.filter((row) => row.completion !== 'pending').length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const historicalAlertCount = rows.filter((row) => row.needsHistoricalReview).length;
  const soxParameterCount = rows.filter((row) => row.parameter.isSox).length;

  const activeParameterId = selectedParameterId ?? rows[0]?.parameter.id ?? null;
  const selectedRow = rows.find((row) => row.parameter.id === activeParameterId) ?? null;
  const selectedDraft = getSprFormEntry(entries, activeParameterId);
  const selectedEntry = selectedRow ? resolveEntry(selectedDraft, selectedRow.record) : selectedDraft;
  const selectedRecordId = selectedRow?.record?.id ?? null;
  const selectedEvidencesQuery = useSprRecordEvidences(selectedRecordId);

  // Habilitar envio solo cuando todos los parametros tienen registro persistido con valor.
  const canSubmit = totalCount > 0 && rows.every((row) => recordHasValue(row.record) || looksNotApplicable(row.record?.textValue));

  const saveErrorMessage = saveMutation.error instanceof Error
    ? saveMutation.error.message
    : submitMutation.error instanceof Error
      ? submitMutation.error.message
      : uploadEvidenceMutation.error instanceof Error
        ? uploadEvidenceMutation.error.message
        : submitEvidenceError;

  function handleSaveDraft() {
    if (!selectedRow || !activeParameterId) return;
    const entry = resolveEntry(getSprFormEntry(entries, activeParameterId), selectedRow.record);
    const numericValue = entry.notApplicable ? null : parseNumeric(entry.value);
    const textValue = entry.notApplicable ? 'No aplica' : numericValue === null && entry.value.trim() !== '' ? entry.value.trim() : null;
    const notes = entry.note.trim() === '' ? null : entry.note.trim();

    if (selectedRow.record) {
      const payload: UpdateSprMonthlyRecordRequest = { numericValue, textValue, notes };
      saveMutation.mutate({ mode: 'update', recordId: selectedRow.record.id, payload });
      return;
    }

    const assignment = assignmentMap.get(activeParameterId) ?? null;
    const payload: CreateSprMonthlyRecordRequest = {
      parameterId: activeParameterId,
      areaId: assignment?.areaId ?? null,
      assignmentId: assignment?.id ?? null,
      periodYear: SPR_ACTIVE_CYCLE.periodYear,
      periodMonth: SPR_ACTIVE_CYCLE.periodMonth,
      numericValue,
      textValue,
      notes,
    };
    saveMutation.mutate({ mode: 'create', payload });
  }

  function handleOpenSubmitModal() {
    if (!canSubmit || submitMutation.isPending) return;
    setSubmitModalOpen(true);
  }

  function handleUploadDocument(file: File) {
    if (!selectedRow?.record?.id) return;
    uploadEvidenceMutation.mutate({
      recordId: selectedRow.record.id,
      file,
      parameter: selectedRow.parameter,
    });
  }

  async function handleConfirmSubmit() {
    if (!canSubmit || submitMutation.isPending) return;
    setSubmitEvidenceError(null);

    const rowsRequiringEvidence = rows.filter(
      (row) => parameterRequiresEvidence(row.parameter) && row.record?.id,
    );

    for (const row of rowsRequiringEvidence) {
      const recordId = row.record?.id;
      if (!recordId) continue;
      const evidences = await getSprRecordEvidences(recordId);
      if (evidences.length === 0) {
        setSubmitEvidenceError(
          `El parámetro "${row.parameter.name}" requiere al menos un documento vinculado antes de firmar y enviar.`,
        );
        return;
      }
    }

    const recordIds = rows
      .map((row) => row.record)
      .filter((record): record is SprMonthlyRecordResponse => Boolean(record))
      .filter((record) => [SprRecordStatus.DRAFT, SprRecordStatus.REJECTED].includes(record.status))
      .map((record) => record.id);
    if (recordIds.length === 0) return;

    try {
      for (const recordId of recordIds) {
        await submitMutation.mutateAsync({ recordId });
      }
      setSubmitModalOpen(false);
    } catch {
      // El error se muestra en el footer via submitMutation.error.
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] w-full flex-col bg-[#f7f7f7]">
      {correctionMode && rejectionContext && !rejectionBannerDismissed ? (
        <SprRejectionAlertBanner context={rejectionContext} onDismiss={() => setRejectionBannerDismissed(true)} />
      ) : null}

      <SprCycleContextHeader
        completedCount={completedCount}
        totalCount={totalCount}
        isLoading={parametersQuery.isLoading}
        isError={parametersQuery.isError}
        variant={correctionMode ? 'rejected' : 'draft'}
        rejectionContext={rejectionContext}
      />

      <div className="flex items-center justify-between border-b border-[#e3e3e3] bg-white px-[20px] py-[10px]">
        <p className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#131313]">
          Ingresa los datos de tu área para el período {SPR_ACTIVE_CYCLE.label}
          <span className="font-['Inter:Regular',sans-serif] text-[#acacac]"> · Todos los campos son obligatorios</span>
        </p>
        <div className="flex items-center gap-[8px]">
          <SprHistoricalRangeBadge count={historicalAlertCount} />
          <button
            type="button"
            className="flex h-[26px] items-center gap-[5px] rounded-[6px] border border-[#e3e3e3] bg-white px-[11px] font-['Inter:Semi_Bold',sans-serif] text-[10.5px] font-semibold text-[#24588b] hover:bg-[#fafafa]"
            title="Pendiente de integración con historial/aprobaciones"
          >
            <SprTraceabilityIcon className="h-[11px] w-[13.75px] shrink-0" />
            Ver trazabilidad
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(240px,268px)_1fr]">
        <aside className="min-h-0 overflow-y-auto border-b border-[#e3e3e3] bg-white lg:border-b-0 lg:border-r">
          <SprParametersList
            rows={rows}
            selectedParameterId={activeParameterId}
            isLoading={parametersQuery.isLoading}
            isError={parametersQuery.isError}
            onSelect={selectParameter}
          />
          <SprDocumentsSection
            recordId={selectedRecordId}
            requiresEvidence={selectedRow ? parameterRequiresEvidence(selectedRow.parameter) : false}
            evidences={selectedEvidencesQuery.data ?? []}
            isLoading={selectedEvidencesQuery.isLoading}
            isUploading={uploadEvidenceMutation.isPending}
            uploadErrorMessage={
              uploadEvidenceMutation.error instanceof Error ? uploadEvidenceMutation.error.message : null
            }
            onUpload={handleUploadDocument}
          />
        </aside>

        <section className="min-h-0 overflow-y-auto bg-[#fafbfc]">
          <SprParameterDetailForm
            row={selectedRow}
            entry={selectedEntry}
            onValueChange={(value) => activeParameterId && setValue(activeParameterId, value)}
            onNotApplicableChange={(value) => activeParameterId && setNotApplicable(activeParameterId, value)}
            onSourceChange={(value) => activeParameterId && setSource(activeParameterId, value)}
            onNoteChange={(value) => activeParameterId && setNote(activeParameterId, value)}
          />
        </section>
      </div>

      <SprFooterActions
        remainingCount={remainingCount}
        canSubmit={canSubmit}
        correctionMode={correctionMode}
        isSaving={saveMutation.isPending}
        isSubmitting={submitMutation.isPending}
        saveErrorMessage={saveErrorMessage}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleOpenSubmitModal}
      />

      <SprSubmitModal
        open={submitModalOpen}
        variant={correctionMode ? 'correction' : 'initial'}
        summary={{
          completedCount,
          totalCount,
          attachmentCount: selectedEvidencesQuery.data?.length ?? 0,
          soxParameterCount,
        }}
        isSubmitting={submitMutation.isPending}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
