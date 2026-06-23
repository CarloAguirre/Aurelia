import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MueEntity } from './entities/mue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MueEntity])],
})
export class MueModule {}
