import { Injectable } from '@nestjs/common';
import type { MobileSyncBatchRequest, MobileSyncBatchResponse, MobileSyncStatus } from '@aurelia/contracts';
import { InMemoryMobileSyncBroker } from '../../shared/messaging/in-memory-mobile-sync-broker';

const PROCESSING = 'PROCESSING' as MobileSyncStatus;

@Injectable()
export class MobileSyncService {
  private readonly broker = new InMemoryMobileSyncBroker();
  private readonly batches = new Map<string, MobileSyncBatchResponse>();

  async acceptBatch(batch: MobileSyncBatchRequest): Promise<MobileSyncBatchResponse> {
    const existing = this.batches.get(batch.batchId);
    if (existing) return existing;

    const acceptedAt = new Date().toISOString();
    await this.broker.publish({
      messageId: batch.batchId,
      sessionId: batch.deviceSessionId,
      batch,
      enqueuedAt: acceptedAt,
    });

    const response: MobileSyncBatchResponse = {
      batchId: batch.batchId,
      acceptedAt,
      status: PROCESSING,
      results: batch.operations.map((operation) => ({
        localId: operation.localId,
        remoteId: null,
        status: PROCESSING,
        syncedAt: null,
      })),
      nextRecommendedSyncAt: null,
    };
    this.batches.set(batch.batchId, response);
    return response;
  }

  getBatch(batchId: string): MobileSyncBatchResponse | null {
    return this.batches.get(batchId) ?? null;
  }

  getPendingMessagesCount(): number {
    return this.broker.peek().length;
  }
}
