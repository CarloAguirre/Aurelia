import { httpGet, httpPost } from './http-client';

export interface DatabaseMaintenancePlanResponse {
  migration: {
    status: 'ready' | 'noop' | 'review_required';
    filePath: string | null;
    migrationName: string | null;
    upQueries: number;
    downQueries: number;
    riskyQueries: string[];
  };
  availableSeeds: string[];
}

export interface DatabaseMaintenanceRunResponse {
  migration: {
    status: 'applied' | 'noop' | 'review_required';
    filePath: string | null;
    migrationName: string | null;
    upQueries: number;
    downQueries: number;
    riskyQueries: string[];
  };
  seeds: Array<{
    seed: string;
    status: 'applied' | 'skipped' | 'failed';
    error?: string;
  }>;
  availableSeeds: string[];
}

export interface RunDatabaseMaintenanceRequest {
  seeds?: string[];
}

export async function getDatabaseMaintenancePlan(): Promise<DatabaseMaintenancePlanResponse> {
  return httpGet<DatabaseMaintenancePlanResponse>('api/admin/database/maintenance/plan');
}

export async function runDatabaseMaintenance(payload: RunDatabaseMaintenanceRequest): Promise<DatabaseMaintenanceRunResponse> {
  return httpPost<RunDatabaseMaintenanceRequest, DatabaseMaintenanceRunResponse>('api/admin/database/maintenance', payload);
}