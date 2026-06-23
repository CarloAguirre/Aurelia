import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceEntity } from './entities/evidence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvidenceEntity])],
})
export class EvidencesModule {}
