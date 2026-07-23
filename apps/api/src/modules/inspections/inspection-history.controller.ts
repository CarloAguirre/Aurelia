import { Controller, Get, Query, Req } from '@nestjs/common';
import { INSPECTION_CAPABILITIES } from '@aurelia/contracts';
import type {
  InspectionHistoryKpisResponse,
  InspectionManagementTableFilterOptionsResponse,
  InspectionManagementTableResponse,
  InspectionManagementTableRowResponse,
} from '@aurelia/contracts';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { InspectionAccessService } from './inspection-access.service';
import type { ManagementTableQuery } from './inspection-dashboard.service';
import { InspectionHistoryService } from './inspection-history.service';

@RequirePermissions(INSPECTION_CAPABILITIES.read)
@Controller('inspections/history')
export class InspectionHistoryController {
  constructor(
    private readonly inspectionHistoryService: InspectionHistoryService,
    private readonly inspectionAccess: InspectionAccessService,
  ) {}

  @Get('kpis')
  getHistoryKpis(@Req() request: AuthenticatedRequest): Promise<InspectionHistoryKpisResponse> {
    return this.inspectionAccess.getHistoryKpis(request.user);
  }

  @Get('table')
  async getHistoryTable(
    @Req() request: AuthenticatedRequest,
    @Query() query: ManagementTableQuery,
  ): Promise<InspectionManagementTableResponse> {
    const scopedIds = new Set(await this.inspectionAccess.getScopedInspectionIds(request.user));
    const rows = await this.loadAllFilteredRows(query);
    const scopedRows = rows.filter((row) => scopedIds.has(row.inspectionId));
    const pageSize = this.resolvePageSize(query.pageSize);
    const totalPages = Math.max(1, Math.ceil(scopedRows.length / pageSize));
    const page = this.resolvePage(query.page, totalPages);
    const start = (page - 1) * pageSize;

    return {
      page,
      pageSize,
      total: scopedRows.length,
      totalPages,
      rows: scopedRows.slice(start, start + pageSize),
      filterOptions: this.buildFilterOptions(scopedRows),
    };
  }

  private async loadAllFilteredRows(query: ManagementTableQuery): Promise<InspectionManagementTableRowResponse[]> {
    const rows: InspectionManagementTableRowResponse[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.inspectionHistoryService.getHistoryTable({
        ...query,
        page: String(page),
        pageSize: '50',
      });
      rows.push(...response.rows);
      totalPages = response.totalPages;
      page += 1;
    } while (page <= totalPages);

    return rows;
  }

  private buildFilterOptions(rows: InspectionManagementTableRowResponse[]): InspectionManagementTableFilterOptionsResponse {
    return {
      inspectors: this.uniqueSorted(rows.map((row) => row.inspector)),
      areas: this.uniqueSorted(rows.map((row) => row.areaSector)),
      companies: this.uniqueSorted(rows.map((row) => row.company)),
      types: this.uniqueSorted(rows.map((row) => row.type)),
      urgencies: this.uniqueSorted(rows.map((row) => row.urgencyLabel)),
    };
  }

  private resolvePageSize(value?: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 10;
    return [10, 25, 50].includes(parsed) ? parsed : 10;
  }

  private resolvePage(value: string | undefined, totalPages: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(Math.floor(parsed), totalPages);
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((left, right) =>
      left.localeCompare(right, 'es'),
    );
  }
}
