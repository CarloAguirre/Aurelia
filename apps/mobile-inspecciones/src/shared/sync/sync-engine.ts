import { MobileSyncStatus, type MobileSyncBatchRequest, type MobileSyncOperationRequest } from '@aurelia/contracts';
import { getOrCreateOfflineDeviceSession } from '../offline/offline-device-session';
import { submitMobileSyncBatch } from '../services/api/mobile-sync.api';
import { syncQueue } from './sync-queue';
import type { SyncQueueItem } from './sync-status';

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${random}`;
}

function toOperation(item: SyncQueueItem): MobileSyncOperationRequest {
  return {
    localId: item.localId,
    operationType: item.operationType,
    entityType: item.entityType,
    payload: item.payload,
    evidences: item.evidences,
    createdBy: item.createdBy,
    deviceId: item.deviceId,
    deviceSessionId: item.deviceSessionId,
    schemaVersion: item.schemaVersion,
    clientCreatedAt: item.clientCreatedAt,
    idempotencyKey: item.idempotencyKey,
    dependsOnLocalIds: item.dependsOnLocalIds,
  };
}

export interface SyncNowResult {
  attempted: number;
  synced: number;
  error: number;
  conflict: number;
}

export async function syncPendingOperations(): Promise<SyncNowResult> {
  const ready = await syncQueue.getReadyToSync();
  if (ready.length === 0) return { attempted: 0, synced: 0, error: 0, conflict: 0 };

  const session = await getOrCreateOfflineDeviceSession();
  const batch: MobileSyncBatchRequest = {
    batchId: createId('batch'),
    appId: 'mobile-inspecciones',
    deviceId: session.deviceId,
    deviceSessionId: session.deviceSessionId,
    bootstrapVersion: session.bootstrapVersion,
    createdAt: new Date().toISOString(),
    operations: ready.map(toOperation),
  };

  await syncQueue.markProcessing(ready.map((item) => item.localId));

  try {
    const response = await submitMobileSyncBatch(batch);
    let synced = 0;
    let error = 0;
    let conflict = 0;
    for (const result of response.results) {
      if (result.status === MobileSyncStatus.SYNCED || result.status === MobileSyncStatus.PROCESSING || result.status === MobileSyncStatus.PENDING) {
        await syncQueue.markSynced(result.localId, result.remoteId);
        synced += 1;
      } else if (result.status === MobileSyncStatus.CONFLICT) {
        await syncQueue.markConflict(result.localId, result.conflictReason ?? 'Conflicto de sincronización');
        conflict += 1;
      } else {
        await syncQueue.markError(result.localId, result.errorMessage ?? 'Error de sincronización');
        error += 1;
      }
    }
    return { attempted: ready.length, synced, error, conflict };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de sincronización';
    await Promise.all(ready.map((item) => syncQueue.markError(item.localId, message)));
    return { attempted: ready.length, synced: 0, error: ready.length, conflict: 0 };
  }
}
