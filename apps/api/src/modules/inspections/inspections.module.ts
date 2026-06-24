import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionFormItemEntity } from './entities/inspection-form-item.entity';
import { InspectionFormSectionEntity } from './entities/inspection-form-section.entity';
import { InspectionFormTemplateEntity } from './entities/inspection-form-template.entity';
import { InspectionItemResponseEntity } from './entities/inspection-item-response.entity';
import { InspectionStateEntity } from './entities/inspection-state.entity';
import { InspectionTypeEntity } from './entities/inspection-type.entity';
import { InspectionEntity } from './entities/inspection.entity';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspectionTypeEntity,
      InspectionFormTemplateEntity,
      InspectionFormSectionEntity,
      InspectionFormItemEntity,
      InspectionEntity,
      InspectionItemResponseEntity,
      InspectionStateEntity,
    ]),
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
