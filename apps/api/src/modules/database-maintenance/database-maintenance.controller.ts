import { Body, Controller, Get, Post } from '@nestjs/common';
import { DatabaseMaintenanceService } from './database-maintenance.service';
import { RunDatabaseMaintenanceDto } from './dto/run-database-maintenance.dto';
import { Public } from '../auth/public.decorator';

@Public()
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
