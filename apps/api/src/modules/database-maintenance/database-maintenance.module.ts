import { Module } from '@nestjs/common';
import { DatabaseMaintenanceController } from './database-maintenance.controller';
import { DatabaseMaintenanceGuard } from './database-maintenance.guard';
import { DatabaseMaintenanceService } from './database-maintenance.service';

@Module({
  controllers: [DatabaseMaintenanceController],
  providers: [DatabaseMaintenanceGuard, DatabaseMaintenanceService],
})
export class DatabaseMaintenanceModule {}
