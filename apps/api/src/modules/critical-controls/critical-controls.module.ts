import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriticalControlEntity } from './entities/critical-control.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CriticalControlEntity])],
})
export class CriticalControlsModule {}
