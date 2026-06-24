import { httpPost } from '../http-client';

// ── Severity mapping ─────────────────────────────────────────────────────────
const SEVERITY_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  Bajo: 'low',
  Medio: 'medium',
  Alto: 'high',
  Crítico: 'critical',
};

export function mapSeverity(nivel: string | null): 'low' | 'medium' | 'high' | 'critical' {
  return SEVERITY_MAP[nivel ?? ''] ?? 'medium';
}

export function slaToIso(slaDays: number): string {
  return new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000).toISOString();
}

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateInspectionDto {
  inspectionTypeId: string;
  companyId?: string | null;
  areaId?: string | null;
  sectorId?: string | null;
  title: string;
  description?: string | null;
}

export interface CreateFindingDto {
  title: string;
  description?: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ownerUserId?: string | null;
  dueAt?: string | null;
}

// ── Response shapes ───────────────────────────────────────────────────────────
export interface InspectionResponse {
  id: string;
  title: string;
  status: string;
  findingsCount: number;
  createdAt: string;
}

export interface FindingResponse {
  id: string;
  inspectionId: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────
export function createInspection(dto: CreateInspectionDto): Promise<InspectionResponse> {
  return httpPost<CreateInspectionDto, InspectionResponse>('/inspections', dto);
}

export function createFinding(
  inspectionId: string,
  dto: CreateFindingDto,
): Promise<FindingResponse> {
  return httpPost<CreateFindingDto, FindingResponse>(
    `/inspections/${inspectionId}/findings`,
    dto,
  );
}
