import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { CommentsModule } from '../comments/comments.module';
import { EvidencesModule } from '../evidences/evidences.module';
import { AreaEntity } from '../organization/entities/area.entity';
import { CompanyEntity } from '../organization/entities/company.entity';
import { InspectionFindingSeverityEntity } from './entities/inspection-finding-severity.entity';
import { InspectionFindingResponsibleEntity } from './entities/inspection-finding-responsible.entity';
import { InspectionFindingTypeEntity } from './entities/inspection-finding-type.entity';
import { InspectionFindingEntity } from './entities/inspection-finding.entity';
import { InspectionFollowupEntity } from './entities/inspection-followup.entity';
import { InspectionFormItemEntity } from './entities/inspection-form-item.entity';
import { InspectionFormSectionEntity } from './entities/inspection-form-section.entity';
import { InspectionFormTemplateEntity } from './entities/inspection-form-template.entity';
import { InspectionItemResponseEntity } from './entities/inspection-item-response.entity';
import { InspectionRiskConsequenceEntity } from './entities/inspection-risk-consequence.entity';
import { InspectionRiskProbabilityEntity } from './entities/inspection-risk-probability.entity';
import { InspectionStateEntity } from './entities/inspection-state.entity';
import { InspectionTypeEntity } from './entities/inspection-type.entity';
import { InspectionEntity } from './entities/inspection.entity';
import { InspectionCriticalityCatalogController } from './inspection-criticality-catalog.controller';
import { InspectionDashboardController } from './inspection-dashboard.controller';
import { InspectionDashboardService } from './inspection-dashboard.service';
import { InspectionFindingCatalogController } from './inspection-finding-catalog.controller';
import { InspectionFindingCatalogService } from './inspection-finding-catalog.service';
import { InspectionTransversalController } from './inspection-transversal.controller';
import { InspectionTransversalService } from './inspection-transversal.service';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';

@Module({
  imports: [
    AuditModule,
    CommentsModule,
    EvidencesModule,
    TypeOrmModule.forFeature([
      InspectionTypeEntity,
      InspectionFindingTypeEntity,
      InspectionFindingSeverityEntity,
      InspectionRiskProbabilityEntity,
      InspectionRiskConsequenceEntity,
      InspectionFormTemplateEntity,
      InspectionFormSectionEntity,
      InspectionFormItemEntity,
      InspectionEntity,
      InspectionItemResponseEntity,
      InspectionFindingEntity,
      InspectionFindingResponsibleEntity,
      InspectionFollowupEntity,
      InspectionStateEntity,
      AreaEntity,
      CompanyEntity,
    ]),
  ],
  controllers: [InspectionsController, InspectionDashboardController, InspectionTransversalController, InspectionFindingCatalogController, InspectionCriticalityCatalogController],
  providers: [InspectionsService, InspectionDashboardService, InspectionTransversalService, InspectionFindingCatalogService],
  exports: [InspectionsService, InspectionDashboardService, InspectionFindingCatalogService],
})
export class InspectionsModule {}
