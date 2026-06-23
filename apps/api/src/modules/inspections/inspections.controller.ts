import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { InspectionResponse } from '@aurelia/contracts';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get()
  findAll(): Promise<InspectionResponse[]> {
    return this.inspectionsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateInspectionDto): Promise<InspectionResponse> {
    // inspectorId provendrá del usuario autenticado cuando exista auth real.
    return this.inspectionsService.create(dto, 'system');
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspectionStatusDto,
  ): Promise<InspectionResponse> {
    return this.inspectionsService.updateStatus(id, dto);
  }
}
