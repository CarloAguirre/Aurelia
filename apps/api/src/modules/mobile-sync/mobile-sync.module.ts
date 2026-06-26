import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionsModule } from '../inspections/inspections.module';
import { MobileSyncOperationEntity } from './entities/mobile-sync-operation.entity';
import { MobileSyncController } from './mobile-sync.controller';
import { MobileSyncService } from './mobile-sync.service';

@Module({
  imports: [InspectionsModule, TypeOrmModule.forFeature([MobileSyncOperationEntity])],
  controllers: [MobileSyncController],
  providers: [MobileSyncService],
})
export class MobileSyncModule {}
