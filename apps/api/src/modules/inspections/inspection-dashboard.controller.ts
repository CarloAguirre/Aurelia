import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InspectionFindingSeverity,
  type InspectionDashboardChartsResponse,
  type InspectionDashboardCompanyAnalysisResponse,
  type InspectionDashboardOpenFindingsResponse,
  type InspectionDashboardSummaryResponse,
  type InspectionManagementKpisResponse,
  type InspectionManagementTableResponse,
  type InspectionManagementTableRowResponse,
} from '@aurelia/contracts';
import type { Response } from 'express';
import { Repository } from 'typeorm';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CompanyEntity } from '../organization/entities/company.entity';
import { XlsxWorkbookService, type XlsxCellStyle } from '../reports/xlsx-workbook.service';
import { UserEntity } from '../users/entities/user.entity';
import { InspectionDashboardService, type ManagementTableQuery } from './inspection-dashboard.service';
import type { DashboardQuery } from './inspection-dashboard-period';

@RequirePermissions('inspections:read')
@Controller('inspections/dashboard')
export class InspectionDashboardController {
  constructor(
    private readonly inspectionDashboardService: InspectionDashboardService,
    private readonly workbook: XlsxWorkbookService,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  @Get('management-kpis')
  getManagementKpis(): Promise<InspectionManagementKpisResponse> {
    return this.inspectionDashboardService.getManagementKpis();
  }

  @Get('management-table')
  async getManagementTable(@Query() query: ManagementTableQuery, @Req() request: AuthenticatedRequest): Promise<InspectionManagementTableResponse> {
    return this.inspectionDashboardService.getManagementTable(await this.resolveManagementTableQuery(query, request));
  }

  @Get('management-table/xlsx')
  async exportManagementTableXlsx(
    @Query() query: ManagementTableQuery,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ): Promise<void> {
    const scopedQuery = await this.resolveManagementTableQuery(query, request);
    const firstPage = await this.inspectionDashboardService.getManagementTable({
      ...scopedQuery,
      page: '1',
      pageSize: '50',
    });
    const rows = [...firstPage.rows];

    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      const result = await this.inspectionDashboardService.getManagementTable({
        ...scopedQuery,
        page: String(page),
        pageSize: '50',
      });
      rows.push(...result.rows);
    }

    const generatedAt = new Date();
    const buffer = this.workbook.build([
      {
        name: 'Inspecciones',
        columns: [
          { width: 11 },
          { width: 13 },
          { width: 25 },
          { width: 36 },
          { width: 24 },
          { width: 16 },
          { width: 25 },
          { width: 12 },
          { width: 34 },
          { width: 12 },
          { width: 12 },
        ],
        rows: this.buildManagementTableRows(rows),
        freezeRows: 1,
        autoFilter: `A1:K${Math.max(1, rows.length + 1)}`,
      },
    ], {
      title: 'Gestión de inspecciones · tabla filtrada',
      creator: request.user.email || 'AurelIA',
      createdAt: generatedAt.toISOString(),
    });

    const dateSuffix = generatedAt.toISOString().slice(0, 10);
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', `attachment; filename="inspecciones-filtradas-${dateSuffix}.xlsx"`);
    response.send(buffer);
  }

  @Get('filtered-summary')
  getSummary(@Query() query: DashboardQuery): Promise<InspectionDashboardSummaryResponse> {
    return this.inspectionDashboardService.getSummary(query);
  }

  @Get('charts')
  getCharts(@Query() query: DashboardQuery): Promise<InspectionDashboardChartsResponse> {
    return this.inspectionDashboardService.getCharts(query);
  }

  @Get('company-analysis')
  getCompanyAnalysis(@Query() query: DashboardQuery): Promise<InspectionDashboardCompanyAnalysisResponse> {
    return this.inspectionDashboardService.getCompanyAnalysis(query);
  }

  @Get('open-findings')
  getOpenFindings(@Query() query: DashboardQuery): Promise<InspectionDashboardOpenFindingsResponse> {
    return this.inspectionDashboardService.getOpenFindings(query);
  }

  private buildManagementTableRows(rows: InspectionManagementTableRowResponse[]) {
    const cell = this.workbook.cell.bind(this.workbook);
    const headers = [
      'N°',
      'Fecha',
      'Inspector',
      'Área · Sector',
      'Empresa',
      'Tipo',
      'Urgencia máxima',
      'N° obs.',
      'Observaciones',
      'Días',
      '% cierre',
    ];

    return [
      headers.map((header) => cell(header, 'header')),
      ...rows.map((row) => {
        const inspectionNumber = row.inspectionNumber.startsWith('#') ? row.inspectionNumber : `#${row.inspectionNumber}`;
        const typeLabel = row.type.toLowerCase().includes('check') ? 'Checklist' : row.type;
        return [
          cell(inspectionNumber),
          cell(row.date ? new Date(row.date) : null, 'date'),
          cell(row.inspector),
          cell(row.areaSector),
          cell(row.company),
          cell(typeLabel, typeLabel === 'Checklist' ? 'teal' : 'default'),
          cell(row.urgencyLabel, this.urgencyStyle(row)),
          cell(row.observationsCount, 'integer'),
          cell(this.observationSummary(row)),
          cell(row.daysOpen, row.daysOpen > 0 ? 'integer' : 'default'),
          cell(row.closureRate / 100, 'percent'),
        ];
      }),
    ];
  }

  private observationSummary(row: InspectionManagementTableRowResponse): string {
    const parts: string[] = [];
    if (row.observations.executed > 0) parts.push(`${row.observations.executed} ejecutada${row.observations.executed === 1 ? '' : 's'}`);
    if (row.observations.open > 0) parts.push(`${row.observations.open} abierta${row.observations.open === 1 ? '' : 's'}`);
    if (row.observations.closed > 0) parts.push(`${row.observations.closed} cerrada${row.observations.closed === 1 ? '' : 's'}`);
    return parts.length > 0 ? parts.join(' · ') : 'Sin observaciones';
  }

  private urgencyStyle(row: InspectionManagementTableRowResponse): XlsxCellStyle {
    if (row.urgencySeverity === InspectionFindingSeverity.CRITICAL || row.urgencySeverity === InspectionFindingSeverity.HIGH) return 'danger';
    if (row.urgencyLabel.toLowerCase().startsWith('ejecutada')) return 'teal';
    if (row.urgencyLabel.toLowerCase().startsWith('cerrada')) return 'success';
    return 'warning';
  }

  private async resolveManagementTableQuery(query: ManagementTableQuery, request: AuthenticatedRequest): Promise<ManagementTableQuery> {
    if (request.user.roles.includes('ADMIN') || request.user.email.toLowerCase().endsWith('@goldfields.com')) return query;
    const row = await this.users.findOne({
      where: { id: request.user.sub, isActive: true },
      relations: {
        company: true,
        userCompanies: {
          company: true,
        },
      },
    });
    const companies = [row?.company, ...(row?.userCompanies ?? []).map((userCompany) => userCompany.company)].filter((company): company is CompanyEntity => Boolean(company));
    if (companies.some((company) => this.isPrincipalCompany(company))) return query;
    const companyNames = Array.from(new Set(companies.map((company) => company.name.trim()).filter(Boolean)));
    if (companyNames.length === 0) return { ...query, company: '__sin_scope_eecc__' };
    if (query.company?.trim()) return companyNames.includes(query.company.trim()) ? query : { ...query, company: '__sin_scope_eecc__' };
    return { ...query, company: companyNames[0] };
  }

  private isPrincipalCompany(company: CompanyEntity): boolean {
    const code = company.code?.trim().toUpperCase() ?? '';
    const name = company.name.trim().toLowerCase();
    return code === 'CORP' || company.isContractor === false || name.includes('gold field');
  }
}
