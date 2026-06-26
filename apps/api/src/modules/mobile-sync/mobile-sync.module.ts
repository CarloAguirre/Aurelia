import { Module } from '@nestjs/common';
import { InspectionsModule } from '../inspections/inspections.module';
import { MobileSyncController } from './mobile-sync.controller';
import { MobileSyncService } from './mobile-sync.service';

@Module({
  imports: [InspectionsModule],
  controllers: [MobileSyncController],
  providers: [MobileSyncService],
})
export class MobileSyncModule {}
