import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InspectionFindingStatus, type UpdateInspectionFindingRequest } from '@aurelia/contracts';
import { updateInspectionFinding } from '../services/inspection-detail.service';

type FindingActionInput = {
  inspectionId: string;
  findingId: string;
  payload: UpdateInspectionFindingRequest;
};

function nowIso() {
  return new Date().toISOString();
}

export function useInspectionFindingActions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ findingId, payload }: FindingActionInput) => updateInspectionFinding(findingId, payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inspections', 'detail', variables.inspectionId] }),
        queryClient.invalidateQueries({ queryKey: ['inspections', 'management'] }),
        queryClient.invalidateQueries({ queryKey: ['inspections', 'dashboard'] }),
      ]);
    },
  });

  return {
    isPending: mutation.isPending,
    executeFinding: (inspectionId: string, findingId: string, executedActionDescription: string | null) => mutation.mutate({
      inspectionId,
      findingId,
      payload: {
        status: InspectionFindingStatus.IN_PROGRESS,
        executedAt: nowIso(),
        executedActionDescription,
      },
    }),
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
  };
}
