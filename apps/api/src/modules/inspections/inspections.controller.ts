import { BadRequestException, Body, Controller, ForbiddenException, Get, Logger, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import {
  InspectionAssignmentScopeResponse,
  InspectionChecklistAnswerResponse,
  InspectionChecklistTemplateResponse,
  InspectionDashboardSummaryResponse,
  InspectionDetailResponse,
  InspectionFindingResponse,
  InspectionFindingStatus,
  InspectionFollowupResponse,
  InspectionResponse,
  InspectionStatus,
  InspectionTypeResponse,
  UserResponse,
} from '@aurelia/contracts';
import { ResourceScopeService } from '../access-control/resource-scope.service';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { UsersService } from '../users/users.service';
import { CloseInspectionDto } from './dto/close-inspection.dto';
import { CreateInspectionFindingDto } from './dto/create-inspection-finding.dto';
import { CreateInspectionFollowupDto } from './dto/create-inspection-followup.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionFindingDto } from './dto/update-inspection-finding.dto';
import { UpdateInspectionFollowupDto } from './dto/update-inspection-followup.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { UpsertInspectionAnswerDto } from './dto/upsert-inspection-answer.dto';
import { InspectionAssignmentEmailService } from './inspection-assignment-email.service';
import { InspectionDetailService } from './inspection-detail.service';
import { InspectionsService } from './inspections.service';

@RequirePermissions('inspections:read')
@Controller('inspections')
export class InspectionsController {
  private readonly logger = new Logger(InspectionsController.name);

  constructor(
    private readonly inspectionsService: InspectionsService,
    private readonly usersService: UsersService,
    private readonly inspectionDetailService: InspectionDetailService,
    private readonly resourceScopeService: ResourceScopeService,
    private readonly assignmentEmails: InspectionAssignmentEmailService,
  ) {}

  @Get('types')
  findTypes(): Promise<InspectionTypeResponse[]> {
    return this.inspectionsService.findTypes();
  }

  @Get('templates')
  findTemplates(): Promise<InspectionChecklistTemplateResponse[]> {
    return this.inspectionsService.findTemplates();
  }

  @Get('responsible-users')
  async findResponsibleUsers(
    @Req() request: AuthenticatedRequest,
    @Query('companyId') companyId?: string,
  ): Promise<UserResponse[]> {
    const scopedCompanyId = await this.resourceScopeService.resolveInspectionAssignmentCompany(request.user, companyId);
    return this.usersService.findAll({ companyId: scopedCompanyId ?? undefined });
  }

  @Get('assignment-scope')
  getAssignmentScope(@Req() request: AuthenticatedRequest): Promise<InspectionAssignmentScopeResponse> {
    return this.resourceScopeService.getInspectionAssignmentScope(request.user);
  }

  @Get('dashboard/summary')
  getDashboardSummary(): Promise<InspectionDashboardSummaryResponse> {
    return this.inspectionsService.getDashboardSummary();
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('inspectionTypeId') inspectionTypeId?: string,
  ): Promise<InspectionResponse[]> {
    return this.inspectionsService.findAll({ status, inspectionTypeId });
  }

  @RequirePermissions('inspections:write')
  @Post()
  async create(@Body() dto: CreateInspectionDto, @Req() request: AuthenticatedRequest): Promise<InspectionResponse> {
    const companyId = await this.resourceScopeService.resolveInspectionAssignmentCompany(request.user, dto.companyId);
    return this.inspectionsService.create({ ...dto, companyId }, request.user.sub);
  }

  @Get(':id/findings')
  findFindings(@Param('id', ParseUUIDPipe) id: string): Promise<InspectionFindingResponse[]> {
    return this.inspectionsService.findFindings(id);
  }

  @Get(':id/detail')
  getDetail(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthenticatedRequest): Promise<InspectionDetailResponse> {
    return this.inspectionDetailService.getDetail(id, request.user.sub);
  }

  @RequirePermissions('inspections:write')
  @Post(':id/findings')
  async createFinding(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInspectionFindingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionFindingResponse> {
    const responsibleCompanyId = await this.resourceScopeService.resolveInspectionAssignmentCompany(
      request.user,
      dto.responsibleCompanyId,
    );
    return this.inspectionsService.createFinding(id, { ...dto, responsibleCompanyId }, request.user.sub);
  }

  @RequirePermissions('inspections:write')
  @Post(':id/close')
  async closeInspection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseInspectionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionResponse> {
    const inspection = await this.inspectionsService.findOne(id);
    if (inspection.openFindingsCount > 0) {
      throw new BadRequestException('Inspection has open findings');
    }
    const closedAt = new Date().toISOString();
    return this.inspectionsService.update(
      id,
      {
        status: InspectionStatus.CLOSED,
        completedAt: inspection.completedAt ?? closedAt,
        closedAt: inspection.closedAt ?? closedAt,
        reason: dto.reason ?? null,
      },
      request.user.sub,
    );
  }

  @RequirePermissions('inspections:write')
  @Post(':id/answers')
  upsertAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertInspectionAnswerDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionChecklistAnswerResponse> {
    return this.inspectionsService.upsertAnswer(id, dto, request.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InspectionResponse> {
    return this.inspectionsService.findOne(id);
  }

  @RequirePermissions('inspections:write')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionStatusDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionResponse> {
    const previous = await this.inspectionsService.findOne(id);
    if (dto.status !== InspectionStatus.CLOSED) {
      const updated = await this.inspectionsService.updateStatus(id, dto, request.user.sub);
      await this.notifyIfInspectionActivated(previous.status, updated);
      return updated;
    }
    const closedAt = new Date().toISOString();
    return this.inspectionsService.update(
      id,
      {
        status: InspectionStatus.CLOSED,
        completedAt: previous.completedAt ?? closedAt,
        closedAt: previous.closedAt ?? closedAt,
        reason: dto.comment ?? null,
      },
      request.user.sub,
    );
  }

  @RequirePermissions('inspections:write')
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionResponse> {
    const previous = await this.inspectionsService.findOne(id);
    const updated = await this.inspectionsService.update(id, dto, request.user.sub);
    await this.notifyIfInspectionActivated(previous.status, updated);
    return updated;
  }

  @RequirePermissions('inspections:write')
  @Post('findings/:findingId/followups')
  createFollowup(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: CreateInspectionFollowupDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionFollowupResponse> {
    return this.inspectionsService.createFollowup(findingId, dto, request.user.sub);
  }

  @RequirePermissions('inspections:write')
  @Patch('findings/:findingId')
  async updateFinding(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: UpdateInspectionFindingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionFindingResponse> {
    if ((dto.status === InspectionFindingStatus.CLOSED || dto.status === InspectionFindingStatus.REJECTED) && !(await this.resourceScopeService.canReviewInspectionFindings(request.user))) {
      throw new ForbiddenException('Only Gold Fields users can approve or reject findings');
    }
    const finding = await this.inspectionsService.updateFinding(findingId, dto, request.user.sub);
    await this.closeInspectionIfAllFindingsClosed(finding.inspectionId, request.user.sub);
    return finding;
  }

  @RequirePermissions('inspections:write')
  @Patch('followups/:followupId')
  updateFollowup(
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Body() dto: UpdateInspectionFollowupDto,
  ): Promise<InspectionFollowupResponse> {
    return this.inspectionsService.updateFollowup(followupId, dto);
  }

  private async notifyIfInspectionActivated(previousStatus: InspectionStatus, updated: InspectionResponse): Promise<void> {
    if (previousStatus === InspectionStatus.IN_PROGRESS || updated.status !== InspectionStatus.IN_PROGRESS) return;
    await this.assignmentEmails.notifyInspectionAssigned(updated.id).catch((error) => {
      this.logAssignmentEmailFailure(updated.id, error);
    });
  }

  private logAssignmentEmailFailure(inspectionId: string, error: unknown): void {
    const detail = error instanceof Error ? error.message : String(error);
    this.logger.error(`Unable to dispatch inspection assignment email inspection=${inspectionId}: ${detail}`);
  }

  private async closeInspectionIfAllFindingsClosed(inspectionId: string, actorId: string | null): Promise<void> {
    const [inspection, findings] = await Promise.all([
      this.inspectionsService.findOne(inspectionId),
      this.inspectionsService.findFindings(inspectionId),
    ]);
    if (inspection.status === InspectionStatus.CLOSED || inspection.status === InspectionStatus.CANCELLED) return;
    const activeFindings = findings.filter((finding) => finding.status !== InspectionFindingStatus.CANCELLED);
    if (activeFindings.length === 0) return;
    if (activeFindings.some((finding) => finding.status !== InspectionFindingStatus.CLOSED)) return;
    const closedAt = new Date().toISOString();
    await this.inspectionsService.update(
      inspectionId,
      {
        status: InspectionStatus.CLOSED,
        completedAt: inspection.completedAt ?? closedAt,
        closedAt: inspection.closedAt ?? closedAt,
        reason: 'all findings closed',
      },
      actorId,
    );
  }
}
