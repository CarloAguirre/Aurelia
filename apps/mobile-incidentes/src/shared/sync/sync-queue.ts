import type { CreateIncidentRequest } from '@aurelia/contracts';
import { SyncQueueItem, SyncStatus } from './sync-status';

// Placeholder: la cola de sincronización offline-first se implementará más adelante.
export const incidentSyncQueue: SyncQueueItem<CreateIncidentRequest>[] = [];

export function enqueueIncident(payload: CreateIncidentRequest): void {
  incidentSyncQueue.push({
    id: `${Date.now()}`,
    payload,
    status: SyncStatus.PENDING,
    createdAt: new Date().toISOString(),
  });
}
