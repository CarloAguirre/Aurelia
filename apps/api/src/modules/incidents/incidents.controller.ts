import { Body, Controller, Get, Post } from '@nestjs/common';
import { IncidentResponse } from '@aurelia/contracts';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(): Promise<IncidentResponse[]> {
    return this.incidentsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateIncidentDto): Promise<IncidentResponse> {
    return this.incidentsService.create(dto, 'system');
  }
}
