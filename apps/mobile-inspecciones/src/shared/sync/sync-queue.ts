import type { CreateInspectionRequest } from '@aurelia/contracts';
import { SyncQueueItem, SyncStatus } from './sync-status';

// Placeholder: la cola de sincronización offline-first se implementará más adelante.
export const inspectionSyncQueue: SyncQueueItem<CreateInspectionRequest>[] = [];

export function enqueueInspection(payload: CreateInspectionRequest): void {
  inspectionSyncQueue.push({
    id: `${Date.now()}`,
    payload,
    status: SyncStatus.PENDING,
    createdAt: new Date().toISOString(),
  });
}
