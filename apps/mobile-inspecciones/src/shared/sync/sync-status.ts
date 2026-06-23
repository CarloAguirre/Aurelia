export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  ERROR = 'ERROR',
}

export interface SyncQueueItem<TPayload> {
  id: string;
  payload: TPayload;
  status: SyncStatus;
  createdAt: string;
  lastError?: string;
}
