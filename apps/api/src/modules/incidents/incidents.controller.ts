import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import {
  IncidentFlashReportResponse,
  IncidentLevelResponse,
  IncidentResponse,
  IncidentTypeResponse,
} from '@aurelia/contracts';
import { IncidentsService } from './incidents.service';
import { CreateIncidentFlashReportDto } from './dto/create-incident-flash-report.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get('types')
  findTypes(): Promise<IncidentTypeResponse[]> {
    return this.incidentsService.findTypes();
  }

  @Get('levels')
  findLevels(): Promise<IncidentLevelResponse[]> {
    return this.incidentsService.findLevels();
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('incidentTypeId') incidentTypeId?: string,
    @Query('incidentLevelId') incidentLevelId?: string,
  ): Promise<IncidentResponse[]> {
    return this.incidentsService.findAll({ status, incidentTypeId, incidentLevelId });
  }

  @Post()
  create(@Body() dto: CreateIncidentDto): Promise<IncidentResponse> {
    return this.incidentsService.create(dto);
  }

  @Post(':id/flash-report')
  upsertFlashReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIncidentFlashReportDto,
  ): Promise<IncidentFlashReportResponse> {
    return this.incidentsService.upsertFlashReport(id, dto);
  }

  @Get(':id/flash-report')
  findFlashReport(@Param('id', ParseUUIDPipe) id: string): Promise<IncidentFlashReportResponse> {
    return this.incidentsService.findFlashReport(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IncidentResponse> {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ): Promise<IncidentResponse> {
    return this.incidentsService.updateStatus(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ): Promise<IncidentResponse> {
    return this.incidentsService.update(id, dto);
  }
}
