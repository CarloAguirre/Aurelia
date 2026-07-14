import { Controller, Get, Query, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  InspectionDashboardChartsResponse,
  InspectionDashboardCompanyAnalysisResponse,
  InspectionDashboardOpenFindingsResponse,
  InspectionDashboardSummaryResponse,
  InspectionManagementKpisResponse,
  InspectionManagementTableResponse,
} from '@aurelia/contracts';
import { Repository } from 'typeorm';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { InspectionDashboardService, type ManagementTableQuery } from './inspection-dashboard.service';
import type { DashboardQuery } from './inspection-dashboard-period';

@RequirePermissions('inspections:read')
@Controller('inspections/dashboard')
export class InspectionDashboardController {
  constructor(
    private readonly inspectionDashboardService: InspectionDashboardService,
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
    const companies = [row?.company, ...(row?.userCompanies ?? []).map((userCompany) => userCompany.company)].filter((company): company is NonNullable<typeof company> => Boolean(company));
    if (companies.some((company) => this.isPrincipalCompany(company))) return query;
    const companyNames = Array.from(new Set(companies.map((company) => company.name.trim()).filter(Boolean)));
    if (companyNames.length === 0) return { ...query, company: '__sin_scope_eecc__' };
    if (query.company?.trim()) return companyNames.includes(query.company.trim()) ? query : { ...query, company: '__sin_scope_eecc__' };
    return { ...query, company: companyNames[0] };
  }

  private isPrincipalCompany(company: UserEntity['company']): boolean {
    if (!company) return false;
    const code = company.code?.trim().toUpperCase() ?? '';
    const name = company.name.trim().toLowerCase();
    return code === 'CORP' || company.isContractor === false || name.includes('gold field');
  }
}
