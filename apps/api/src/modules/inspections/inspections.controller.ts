import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import {
  InspectionChecklistAnswerResponse,
  InspectionChecklistTemplateResponse,
  InspectionResponse,
  InspectionTypeResponse,
} from '@aurelia/contracts';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';
import { UpsertInspectionAnswerDto } from './dto/upsert-inspection-answer.dto';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get('types')
  findTypes(): Promise<InspectionTypeResponse[]> {
    return this.inspectionsService.findTypes();
  }

  @Get('templates')
  findTemplates(): Promise<InspectionChecklistTemplateResponse[]> {
    return this.inspectionsService.findTemplates();
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('inspectionTypeId') inspectionTypeId?: string,
  ): Promise<InspectionResponse[]> {
    return this.inspectionsService.findAll({ status, inspectionTypeId });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<InspectionResponse> {
    return this.inspectionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInspectionDto): Promise<InspectionResponse> {
    return this.inspectionsService.create(dto, null);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionDto,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.update(id, dto, null);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionStatusDto,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.updateStatus(id, dto, null);
  }

  @Post(':id/answers')
  upsertAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertInspectionAnswerDto,
  ): Promise<InspectionChecklistAnswerResponse> {
    return this.inspectionsService.upsertAnswer(id, dto, null);
  }
}
