import { Injectable } from '@nestjs/common';
import type {
  CreateInspectionFindingRequest,
  CreateInspectionRequest,
  MobileSyncBatchRequest,
  MobileSyncBatchResponse,
  MobileSyncOperationRequest,
  MobileSyncOperationResult,
  MobileSyncStatus,
  UpsertInspectionAnswerRequest,
} from '@aurelia/contracts';
import { InspectionStatus } from '@aurelia/contracts';
import { InMemoryMobileSyncBroker } from '../../shared/messaging/in-memory-mobile-sync-broker';
import { InspectionsService } from '../inspections/inspections.service';

const PROCESSING = 'PROCESSING' as MobileSyncStatus;
const SYNCED = 'SYNCED' as MobileSyncStatus;
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
  materializedOperationCounts: Record<string, number>;
  timestamp: string;
}

interface LocalizedPayload {
  inspectionLocalId?: string;
  findingLocalId?: string;
  localEvidenceId?: string;
}

function isSupportedOperation(operation: MobileSyncOperationRequest): boolean {
  return SUPPORTED_OPERATIONS.has(String(operation.operationType));
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function actorId(value: string): string | null {
  return isUuid(value) ? value : null;
}

function remoteIdFromPayload(payload: unknown, key: keyof LocalizedPayload): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const value = (payload as LocalizedPayload)[key];
  return typeof value === 'string' ? value : null;
}

function batchStatus(results: MobileSyncOperationResult[]): MobileSyncStatus {
  if (results.some((result) => result.status === ERROR)) return ERROR;
  if (results.some((result) => result.status === PROCESSING)) return PROCESSING;
  return SYNCED;
}

@Injectable()
export class MobileSyncService {
  private readonly broker = new InMemoryMobileSyncBroker();
  private readonly batches = new Map<string, MobileSyncBatchResponse>();
  private readonly localToRemoteIds = new Map<string, string>();
  private readonly materializedOperationCounts: Record<string, number> = {};

  constructor(private readonly inspectionsService: InspectionsService) {}

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

    const results = await this.materializeBatch(batch);
    const response: MobileSyncBatchResponse = {
      batchId: batch.batchId,
      acceptedAt,
      status: batchStatus(results),
      results,
      nextRecommendedSyncAt: null,
    };
    this.batches.set(batch.batchId, response);
    this.broker.drain();
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
      broker: process.env.MOBILE_SYNC_BROKER ?? 'in-memory-dev-materializer',
      pendingMessages: this.broker.peek().length,
      acceptedBatches: this.batches.size,
      operationCounts,
      materializedOperationCounts: { ...this.materializedOperationCounts },
      timestamp: new Date().toISOString(),
    };
  }

  getPendingMessagesCount(): number {
    return this.broker.peek().length;
  }

  private async materializeBatch(batch: MobileSyncBatchRequest): Promise<MobileSyncOperationResult[]> {
    const results: MobileSyncOperationResult[] = [];
    for (const operation of batch.operations) {
      results.push(await this.materializeOperation(operation));
    }
    return results;
  }

  private async materializeOperation(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    if (!isSupportedOperation(operation)) {
      return this.errorResult(operation.localId, 'UNSUPPORTED_OPERATION', `Unsupported operation: ${String(operation.operationType)}`);
    }
    const existingRemoteId = this.localToRemoteIds.get(operation.localId);
    if (existingRemoteId) return this.syncedResult(operation.localId, existingRemoteId);

    try {
      switch (String(operation.operationType)) {
        case 'CREATE_INSPECTION':
          return await this.createInspection(operation);
        case 'UPSERT_INSPECTION_ANSWER':
          return await this.upsertInspectionAnswer(operation);
        case 'CREATE_INSPECTION_FINDING':
          return await this.createInspectionFinding(operation);
        case 'CLOSE_INSPECTION':
          return await this.closeInspection(operation);
        case 'UPLOAD_ATTACHMENT':
          return await this.uploadAttachment(operation);
        case 'CREATE_INCIDENT':
          return this.processingResult(operation.localId);
        default:
          return this.errorResult(operation.localId, 'UNSUPPORTED_OPERATION', `Unsupported operation: ${String(operation.operationType)}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mobile sync materialization failed';
      return this.errorResult(operation.localId, 'MATERIALIZATION_ERROR', message);
    }
  }

  private async createInspection(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    const created = await this.inspectionsService.create(operation.payload as CreateInspectionRequest, actorId(operation.createdBy));
    this.localToRemoteIds.set(operation.localId, created.id);
    this.incrementMaterialized(String(operation.operationType));
    return this.syncedResult(operation.localId, created.id);
  }

  private async upsertInspectionAnswer(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    const inspectionId = this.resolveInspectionId(operation.payload);
    if (!inspectionId) return this.errorResult(operation.localId, 'MISSING_INSPECTION_REMOTE_ID', 'Inspection dependency was not materialized');
    const payload = operation.payload as UpsertInspectionAnswerRequest & LocalizedPayload;
    const answer = await this.inspectionsService.upsertAnswer(inspectionId, payload, actorId(operation.createdBy));
    this.localToRemoteIds.set(operation.localId, answer.id);
    this.incrementMaterialized(String(operation.operationType));
    return this.syncedResult(operation.localId, answer.id);
  }

  private async createInspectionFinding(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    const inspectionId = this.resolveInspectionId(operation.payload);
    if (!inspectionId) return this.errorResult(operation.localId, 'MISSING_INSPECTION_REMOTE_ID', 'Inspection dependency was not materialized');
    const finding = await this.inspectionsService.createFinding(inspectionId, operation.payload as CreateInspectionFindingRequest, actorId(operation.createdBy));
    this.localToRemoteIds.set(operation.localId, finding.id);
    this.incrementMaterialized(String(operation.operationType));
    return this.syncedResult(operation.localId, finding.id);
  }

  private async closeInspection(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    const inspectionId = this.resolveInspectionId(operation.payload);
    if (!inspectionId) return this.errorResult(operation.localId, 'MISSING_INSPECTION_REMOTE_ID', 'Inspection dependency was not materialized');
    const closed = await this.inspectionsService.updateStatus(inspectionId, { status: InspectionStatus.CLOSED, comment: 'Closed from mobile sync' }, actorId(operation.createdBy));
    this.localToRemoteIds.set(operation.localId, closed.id);
    this.incrementMaterialized(String(operation.operationType));
    return this.syncedResult(operation.localId, closed.id);
  }

  private async uploadAttachment(operation: MobileSyncOperationRequest): Promise<MobileSyncOperationResult> {
    const localEvidenceId = remoteIdFromPayload(operation.payload, 'localEvidenceId') ?? operation.localId;
    this.localToRemoteIds.set(operation.localId, localEvidenceId);
    this.incrementMaterialized(String(operation.operationType));
    return this.syncedResult(operation.localId, localEvidenceId);
  }

  private resolveInspectionId(payload: unknown): string | null {
    const localInspectionId = remoteIdFromPayload(payload, 'inspectionLocalId');
    if (!localInspectionId) return null;
    return this.localToRemoteIds.get(localInspectionId) ?? null;
  }

  private syncedResult(localId: string, remoteId: string): MobileSyncOperationResult {
    return { localId, remoteId, status: SYNCED, syncedAt: new Date().toISOString() };
  }

  private processingResult(localId: string): MobileSyncOperationResult {
    return { localId, remoteId: null, status: PROCESSING, syncedAt: null };
  }

  private errorResult(localId: string, errorCode: string, errorMessage: string): MobileSyncOperationResult {
    return { localId, remoteId: null, status: ERROR, syncedAt: null, errorCode, errorMessage };
  }

  private incrementMaterialized(operationType: string): void {
    this.materializedOperationCounts[operationType] = (this.materializedOperationCounts[operationType] ?? 0) + 1;
  }
}
