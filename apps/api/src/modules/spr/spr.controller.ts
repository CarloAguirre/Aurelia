import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SprService } from './spr.service';
import { CreateSprMonthlyRecordDto } from './dto/create-spr-monthly-record.dto';
import { UpdateSprMonthlyRecordStatusDto } from './dto/update-spr-monthly-record-status.dto';
import { UpdateSprMonthlyRecordDto } from './dto/update-spr-monthly-record.dto';

@Controller('spr')
export class SprController {
  constructor(private readonly sprService: SprService) {}

  @Get('groups')
  findGroups() {
    return this.sprService.findGroups();
  }

  @Get('measure-groups')
  findMeasureGroups() {
    return this.sprService.findGroups();
  }

  @Get('units')
  findUnits() {
    return this.sprService.findUnits();
  }

  @Get('parameters')
  findParameters() {
    return this.sprService.findParameters();
  }

  @Get('assignments')
  findAssignments() {
    return this.sprService.findAssignments();
  }

  @Post('monthly-records')
  createMonthlyRecord(@Body() dto: CreateSprMonthlyRecordDto) {
    return this.sprService.createMonthlyRecord(dto);
  }

  @Get('monthly-records')
  findMonthlyRecords(@Query() query: Record<string, string | undefined>) {
    return this.sprService.findMonthlyRecords(query);
  }

  @Get('monthly-records/:id')
  findMonthlyRecord(@Param('id') id: string) {
    return this.sprService.findMonthlyRecord(id);
  }

  @Patch('monthly-records/:id')
  updateMonthlyRecord(@Param('id') id: string, @Body() dto: UpdateSprMonthlyRecordDto) {
    return this.sprService.updateMonthlyRecord(id, dto);
  }

  @Patch('monthly-records/:id/status')
  updateMonthlyRecordStatus(@Param('id') id: string, @Body() dto: UpdateSprMonthlyRecordStatusDto) {
    return this.sprService.updateMonthlyRecordStatus(id, dto);
  }
}
