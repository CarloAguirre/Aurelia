import { Module } from '@nestjs/common';
import { DatabaseMaintenanceController } from './database-maintenance.controller';
import { DatabaseMaintenanceService } from './database-maintenance.service';

@Module({
  controllers: [DatabaseMaintenanceController],
  providers: [DatabaseMaintenanceService],
})
export class DatabaseMaintenanceModule {}
