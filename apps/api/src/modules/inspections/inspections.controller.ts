import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import {
  InspectionChecklistAnswerResponse,
  InspectionChecklistTemplateResponse,
  InspectionDashboardSummaryResponse,
  InspectionFindingResponse,
  InspectionFollowupResponse,
  InspectionResponse,
  InspectionStatus,
  InspectionTypeResponse,
  UserResponse,
} from '@aurelia/contracts';
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
import { InspectionsService } from './inspections.service';

@RequirePermissions('inspections:read')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService, private readonly usersService: UsersService) {}

  @Get('types')
  findTypes(): Promise<InspectionTypeResponse[]> {
    return this.inspectionsService.findTypes();
  }

  @Get('templates')
  findTemplates(): Promise<InspectionChecklistTemplateResponse[]> {
    return this.inspectionsService.findTemplates();
  }

  @Get('responsible-users')
  findResponsibleUsers(@Query('companyId') companyId?: string): Promise<UserResponse[]> {
    return this.usersService.findAll({ companyId });
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
  create(@Body() dto: CreateInspectionDto, @Req() request: AuthenticatedRequest): Promise<InspectionResponse> {
    return this.inspectionsService.create(dto, request.user.sub);
  }

  @Get(':id/findings')
  findFindings(@Param('id', ParseUUIDPipe) id: string): Promise<InspectionFindingResponse[]> {
    return this.inspectionsService.findFindings(id);
  }

  @RequirePermissions('inspections:write')
  @Post(':id/findings')
  createFinding(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInspectionFindingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionFindingResponse> {
    return this.inspectionsService.createFinding(id, dto, request.user.sub);
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
    return this.inspectionsService.updateStatus(
      id,
      { status: InspectionStatus.CLOSED, comment: dto.reason ?? undefined },
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
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionStatusDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.updateStatus(id, dto, request.user.sub);
  }

  @RequirePermissions('inspections:write')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.update(id, dto, request.user.sub);
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
  updateFinding(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: UpdateInspectionFindingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<InspectionFindingResponse> {
    return this.inspectionsService.updateFinding(findingId, dto, request.user.sub);
  }

  @RequirePermissions('inspections:write')
  @Patch('followups/:followupId')
  updateFollowup(
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Body() dto: UpdateInspectionFollowupDto,
  ): Promise<InspectionFollowupResponse> {
    return this.inspectionsService.updateFollowup(followupId, dto);
  }
}
