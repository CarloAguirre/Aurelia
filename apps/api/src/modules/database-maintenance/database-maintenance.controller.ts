import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DatabaseMaintenanceGuard } from './database-maintenance.guard';
import { DatabaseMaintenanceService } from './database-maintenance.service';
import { RunDatabaseMaintenanceDto } from './dto/run-database-maintenance.dto';

@UseGuards(DatabaseMaintenanceGuard)
@Controller('admin/database')
export class DatabaseMaintenanceController {
  constructor(private readonly databaseMaintenanceService: DatabaseMaintenanceService) {}

  @Get('maintenance/plan')
  plan() {
    return this.databaseMaintenanceService.plan();
  }

  @Post('maintenance')
  run(@Body() dto: RunDatabaseMaintenanceDto) {
    return this.databaseMaintenanceService.run(dto);
  }
}
