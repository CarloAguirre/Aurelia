import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InspectionEvidenceRelationType, InspectionFindingStatus, type UpdateInspectionFindingRequest } from '@aurelia/contracts';
import { updateInspectionFinding } from '../services/inspection-detail.service';
import { createEvidence, linkEvidence, uploadFile } from '../services/inspections.service';

type FindingActionInput = {
  inspectionId: string;
  findingId: string;
  payload: UpdateInspectionFindingRequest;
};

type ExecuteFindingWithAfterEvidenceInput = {
  inspectionId: string;
  findingId: string;
  executedActionDescription: string;
  file: File;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeCoordinate(value: number | string | null | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export function useInspectionFindingActions() {
  const queryClient = useQueryClient();
  const invalidateInspectionQueries = async (inspectionId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inspections', 'detail', inspectionId] }),
      queryClient.invalidateQueries({ queryKey: ['inspections', 'management'] }),
      queryClient.invalidateQueries({ queryKey: ['inspections', 'dashboard'] }),
    ]);
  };
  const mutation = useMutation({
    mutationFn: ({ findingId, payload }: FindingActionInput) => updateInspectionFinding(findingId, payload),
    onSuccess: async (_result, variables) => {
      await invalidateInspectionQueries(variables.inspectionId);
    },
  });
  const executionMutation = useMutation({
    mutationFn: async ({ inspectionId, findingId, executedActionDescription, file, latitude, longitude }: ExecuteFindingWithAfterEvidenceInput) => {
      const fileResponse = await uploadFile(file, null);
      const evidence = await createEvidence({
        fileId: fileResponse.id,
        title: 'Evidencia posterior del hallazgo',
        description: executedActionDescription,
        evidenceType: 'photo',
        capturedAt: nowIso(),
        latitude: normalizeCoordinate(latitude),
        longitude: normalizeCoordinate(longitude),
      });
      await linkEvidence(evidence.id, {
        entityType: 'inspection_finding',
        entityId: findingId,
        relationType: InspectionEvidenceRelationType.AFTER_PHOTO,
      });
      return updateInspectionFinding(findingId, {
        status: InspectionFindingStatus.IN_PROGRESS,
        executedAt: nowIso(),
        executedActionDescription,
      });
    },
    onSuccess: async (_result, variables) => {
      await invalidateInspectionQueries(variables.inspectionId);
    },
  });

  return {
    isPending: mutation.isPending || executionMutation.isPending,
    executeFinding: (inspectionId: string, findingId: string, executedActionDescription: string | null) => mutation.mutate({
      inspectionId,
      findingId,
      payload: {
        status: InspectionFindingStatus.IN_PROGRESS,
        executedAt: nowIso(),
        executedActionDescription,
      },
    }),
    executeFindingWithAfterEvidence: (input: ExecuteFindingWithAfterEvidenceInput) => executionMutation.mutateAsync(input),
    approveFinding: (inspectionId: string, findingId: string) => mutation.mutate({
      inspectionId,
      findingId,
      payload: {
        status: InspectionFindingStatus.CLOSED,
        closedAt: nowIso(),
      },
    }),
    rejectFinding: (inspectionId: string, findingId: string, rejectionReason: string | null) => mutation.mutate({
      inspectionId,
      findingId,
      payload: {
        status: InspectionFindingStatus.REJECTED,
        rejectedAt: nowIso(),
        rejectionReason,
      },
    }),
    rescheduleFinding: (inspectionId: string, findingId: string, dueAt: string) => mutation.mutate({
      inspectionId,
      findingId,
      payload: { dueAt },
    }),
    reassignResponsibleUsers: async (inspectionId: string, findingIds: string[], responsibleUserIds: string[]) => {
      for (const findingId of findingIds) {
        await mutation.mutateAsync({
          inspectionId,
          findingId,
          payload: { responsibleUserIds },
        });
      }
    },
  };
}
