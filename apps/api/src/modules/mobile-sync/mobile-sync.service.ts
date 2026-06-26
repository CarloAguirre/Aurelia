import { Injectable } from '@nestjs/common';
import type { MobileSyncBatchRequest, MobileSyncBatchResponse, MobileSyncOperationRequest, MobileSyncStatus } from '@aurelia/contracts';
import { InMemoryMobileSyncBroker } from '../../shared/messaging/in-memory-mobile-sync-broker';

const PROCESSING = 'PROCESSING' as MobileSyncStatus;
const ERROR = 'ERROR' as MobileSyncStatus;
const SUPPORTED_OPERATIONS = new Set([
  'CREATE_INSPECTION',
  'UPSERT_INSPECTION_ANSWER',
  'CREATE_INSPECTION_FINDING',
  'CLOSE_INSPECTION',
  'CREATE_INCIDENT',
  'UPLOAD_ATTACHMENT',
]);

interface MobileSyncServiceStatus {
  broker: string;
  pendingMessages: number;
  acceptedBatches: number;
  operationCounts: Record<string, number>;
  timestamp: string;
}

function isSupportedOperation(operation: MobileSyncOperationRequest): boolean {
  return SUPPORTED_OPERATIONS.has(String(operation.operationType));
}

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

    const results = batch.operations.map((operation) => {
      if (!isSupportedOperation(operation)) {
        return {
          localId: operation.localId,
          remoteId: null,
          status: ERROR,
          syncedAt: null,
          errorCode: 'UNSUPPORTED_OPERATION',
          errorMessage: `Unsupported operation: ${String(operation.operationType)}`,
        };
      }
      return {
        localId: operation.localId,
        remoteId: null,
        status: PROCESSING,
        syncedAt: null,
      };
    });

    const response: MobileSyncBatchResponse = {
      batchId: batch.batchId,
      acceptedAt,
      status: results.some((result) => result.status === ERROR) ? ERROR : PROCESSING,
      results,
      nextRecommendedSyncAt: null,
    };
    this.batches.set(batch.batchId, response);
    return response;
  }

  getBatch(batchId: string): MobileSyncBatchResponse | null {
    return this.batches.get(batchId) ?? null;
  }

  getStatus(): MobileSyncServiceStatus {
    const operationCounts: Record<string, number> = {};
    for (const message of this.broker.peek()) {
      for (const operation of message.batch.operations) {
        const key = String(operation.operationType);
        operationCounts[key] = (operationCounts[key] ?? 0) + 1;
      }
    }
    return {
      broker: process.env.MOBILE_SYNC_BROKER ?? 'in-memory',
      pendingMessages: this.broker.peek().length,
      acceptedBatches: this.batches.size,
      operationCounts,
      timestamp: new Date().toISOString(),
    };
  }

  getPendingMessagesCount(): number {
    return this.broker.peek().length;
  }
}
