import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
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
  create(@Body() dto: CreateInspectionDto): Promise<InspectionResponse> {
    return this.inspectionsService.create(dto, null);
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
  ): Promise<InspectionFindingResponse> {
    return this.inspectionsService.createFinding(id, dto, null);
  }

  @RequirePermissions('inspections:write')
  @Post(':id/close')
  async closeInspection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseInspectionDto,
  ): Promise<InspectionResponse> {
    const inspection = await this.inspectionsService.findOne(id);
    if (inspection.openFindingsCount > 0) {
      throw new BadRequestException('Inspection has open findings');
    }
    return this.inspectionsService.updateStatus(
      id,
      { status: InspectionStatus.CLOSED, comment: dto.reason ?? undefined },
      null,
    );
  }

  @RequirePermissions('inspections:write')
  @Post(':id/answers')
  upsertAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertInspectionAnswerDto,
  ): Promise<InspectionChecklistAnswerResponse> {
    return this.inspectionsService.upsertAnswer(id, dto, null);
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
  ): Promise<InspectionResponse> {
    return this.inspectionsService.updateStatus(id, dto, null);
  }

  @RequirePermissions('inspections:write')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionDto,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.update(id, dto, null);
  }

  @RequirePermissions('inspections:write')
  @Post('findings/:findingId/followups')
  createFollowup(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: CreateInspectionFollowupDto,
  ): Promise<InspectionFollowupResponse> {
    return this.inspectionsService.createFollowup(findingId, dto, null);
  }

  @RequirePermissions('inspections:write')
  @Patch('findings/:findingId')
  updateFinding(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: UpdateInspectionFindingDto,
  ): Promise<InspectionFindingResponse> {
    return this.inspectionsService.updateFinding(findingId, dto, null);
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
