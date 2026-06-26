import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  InspectionAnswerValue,
  InspectionFindingSeverity,
  MobileSyncOperationType,
  type CreateInspectionFindingRequest,
  type CreateInspectionRequest,
  type InspectionChecklistItem,
  type InspectionChecklistTemplateResponse,
  type UpsertInspectionAnswerRequest,
} from '@aurelia/contracts';
import { createLocalInspection } from '../../../shared/offline/local-inspections';
import { getOrCreateOfflineDeviceSession } from '../../../shared/offline/offline-device-session';
import { syncPendingOperations } from '../../../shared/sync/sync-engine';
import { syncQueue } from '../../../shared/sync/sync-queue';
import { useMobileSession } from '../../auth/mobileSession.store';
import type { ManualInspectionDraft, ManualSavedInspectionResult } from '../manualInspection.store';

type ManualTemplateItem = InspectionChecklistItem & { index: number };

interface SaveManualInspectionOfflineInput {
  draft: ManualInspectionDraft;
  template: InspectionChecklistTemplateResponse;
  items: ManualTemplateItem[];
  trySyncNow: boolean;
}

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${random}`;
}

function parseInspectionDate(value: string): string {
  const parts = value.includes('-') ? value.split('-') : value.split('/');
  if (parts.length !== 3) return new Date().toISOString();
  const [day, month, year] = parts.map((part) => Number(part));
  if (!day || !month || !year) return new Date().toISOString();
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

function buildAnswerText(answer: InspectionAnswerValue | undefined, detail: ManualInspectionDraft['detailsByItemId'][string]): string | null {
  if (answer === InspectionAnswerValue.COMPLIANT) return detail?.comment?.trim() || null;
  if (answer === InspectionAnswerValue.NOT_COMPLIANT) return detail?.detectedCondition?.trim() || null;
  return null;
}

function buildAnswerNotes(answer: InspectionAnswerValue | undefined, detail: ManualInspectionDraft['detailsByItemId'][string]): string | null {
  if (answer !== InspectionAnswerValue.NOT_COMPLIANT) return null;
  const correctiveAction = detail?.correctiveAction?.trim();
  const evidenceName = detail?.evidence?.name;
  return [correctiveAction ? `Medida correctiva: ${correctiveAction}` : null, evidenceName ? `Evidencia local: ${evidenceName}` : null].filter(Boolean).join('\n') || null;
}

function buildFindingDescription(detail: ManualInspectionDraft['detailsByItemId'][string]): string {
  return [
    detail?.detectedCondition?.trim() ? `Condición detectada: ${detail.detectedCondition.trim()}` : null,
    detail?.correctiveAction?.trim() ? `Medida correctiva propuesta: ${detail.correctiveAction.trim()}` : null,
    detail?.evidence?.name ? `Evidencia local: ${detail.evidence.name}` : null,
  ].filter(Boolean).join('\n');
}

function getDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

export function useSaveManualInspectionOffline() {
  const queryClient = useQueryClient();
  const user = useMobileSession((state) => state.user);

  return useMutation({
    mutationFn: async ({ draft, template, items, trySyncNow }: SaveManualInspectionOfflineInput): Promise<ManualSavedInspectionResult> => {
      const session = await getOrCreateOfflineDeviceSession();
      const createdBy = user?.id ?? 'local-user';
      const localInspectionId = createId('inspection');
      const scheduledAt = parseInspectionDate(draft.inspectionDate);
      const values = items.map((item) => draft.answersByItemId[item.id]);
      const yesCount = values.filter((value) => value === InspectionAnswerValue.COMPLIANT).length;
      const noCount = values.filter((value) => value === InspectionAnswerValue.NOT_COMPLIANT).length;
      const naCount = values.filter((value) => value === InspectionAnswerValue.NOT_APPLICABLE).length;
      const title = draft.templateName ? `${draft.templateName} · ${draft.inspectionDate}` : `Checklist normativo · ${draft.inspectionDate}`;
      const createPayload: CreateInspectionRequest = {
        inspectionTypeId: template.inspectionTypeId,
        templateId: template.id,
        companyId: draft.findingCompanyId,
        areaId: draft.areaId,
        sectorId: draft.sectorId,
        locationId: null,
        title,
        description: 'Inspección levantada desde mobile-inspecciones',
        scheduledAt,
        latitude: draft.latitude,
        longitude: draft.longitude,
        notes: draft.generalPhoto?.name ? `Foto general local: ${draft.generalPhoto.name}` : null,
      };

      await createLocalInspection({
        localId: localInspectionId,
        title,
        inspectionTypeId: template.inspectionTypeId,
        templateId: template.id,
        companyId: draft.findingCompanyId,
        areaId: draft.areaId,
        sectorId: draft.sectorId,
        scheduledAt,
        latitude: draft.latitude,
        longitude: draft.longitude,
        notes: createPayload.notes ?? null,
        findingsCount: noCount,
        openFindingsCount: noCount,
        closed: noCount === 0,
      });

      await syncQueue.enqueue({
        localId: localInspectionId,
        operationType: MobileSyncOperationType.CREATE_INSPECTION,
        entityType: 'inspection',
        payload: createPayload,
        createdBy,
        deviceId: session.deviceId,
        deviceSessionId: session.deviceSessionId,
      });

      for (const item of items) {
        const answer = draft.answersByItemId[item.id];
        const detail = draft.detailsByItemId[item.id] ?? {};
        if (!answer) continue;
        const answerPayload: UpsertInspectionAnswerRequest = {
          checklistItemId: item.id,
          answerValue: answer,
          answerText: buildAnswerText(answer, detail),
          notes: buildAnswerNotes(answer, detail),
          answeredAt: new Date().toISOString(),
        };
        const answerLocalId = createId('answer');
        await syncQueue.enqueue({
          localId: answerLocalId,
          operationType: MobileSyncOperationType.UPSERT_INSPECTION_ANSWER,
          entityType: 'inspection_answer',
          payload: { inspectionLocalId: localInspectionId, ...answerPayload },
          createdBy,
          deviceId: session.deviceId,
          deviceSessionId: session.deviceSessionId,
          dependsOnLocalIds: [localInspectionId],
        });
        if (answer === InspectionAnswerValue.NOT_COMPLIANT) {
          const findingPayload: CreateInspectionFindingRequest = {
            checklistItemId: item.id,
            title: `Obs. ${item.index + 1} · ${item.code}`.slice(0, 200),
            description: buildFindingDescription(detail),
            severity: InspectionFindingSeverity.HIGH,
            ownerUserId: null,
            dueAt: getDueDate(),
          };
          await syncQueue.enqueue({
            operationType: MobileSyncOperationType.CREATE_INSPECTION_FINDING,
            entityType: 'inspection_finding',
            payload: { inspectionLocalId: localInspectionId, ...findingPayload },
            createdBy,
            deviceId: session.deviceId,
            deviceSessionId: session.deviceSessionId,
            evidences: detail.evidence ? [{ localEvidenceId: createId('evidence'), localEntityId: localInspectionId, fileName: detail.evidence.name, mimeType: 'image/jpeg', sizeBytes: 0 }] : undefined,
            dependsOnLocalIds: [localInspectionId, answerLocalId],
          });
        }
      }

      if (noCount === 0) {
        await syncQueue.enqueue({
          operationType: MobileSyncOperationType.CLOSE_INSPECTION,
          entityType: 'inspection_close',
          payload: { inspectionLocalId: localInspectionId, reason: 'Checklist sin hallazgos abiertos' },
          createdBy,
          deviceId: session.deviceId,
          deviceSessionId: session.deviceSessionId,
          dependsOnLocalIds: [localInspectionId],
        });
      }

      if (trySyncNow) void syncPendingOperations();
      return { inspectionId: localInspectionId, totalCount: items.length, yesCount, noCount, naCount, closed: noCount === 0 };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mobile-inspecciones', 'inspections'] });
    },
  });
}
