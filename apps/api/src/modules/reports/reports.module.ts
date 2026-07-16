import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { InspectionFindingEntity } from '../inspections/entities/inspection-finding.entity';
import { InspectionTypeEntity } from '../inspections/entities/inspection-type.entity';
import { InspectionEntity } from '../inspections/entities/inspection.entity';
import { AreaEntity } from '../organization/entities/area.entity';
import { CompanyEntity } from '../organization/entities/company.entity';
import { SectorEntity } from '../organization/entities/sector.entity';
import { UserEntity } from '../users/entities/user.entity';
import { InspectionDetailReportPdfFidelityService } from './inspection-detail-report-pdf-fidelity.service';
import { InspectionDetailReportPdfFinalService } from './inspection-detail-report-pdf-final.service';
import { InspectionDetailReportPdfPixelPerfectService } from './inspection-detail-report-pdf-pixel-perfect.service';
import { InspectionDetailReportPdfRuntimeService } from './inspection-detail-report-pdf-runtime.service';
import { InspectionDetailReportPdfService } from './inspection-detail-report-pdf.service';
import { InspectionDetailReportPdfTranslatedService } from './inspection-detail-report-pdf-translated.service';
import { InspectionPeriodicReportController } from './inspection-periodic-report.controller';
import { InspectionPeriodicReportService } from './inspection-periodic-report.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportPeriodService } from './report-period.service';
import { ReportScopeService } from './report-scope.service';
import { ReportTranslationService } from './report-translation.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    FilesModule,
    TypeOrmModule.forFeature([
      InspectionEntity,
      InspectionFindingEntity,
      InspectionTypeEntity,
      CompanyEntity,
      AreaEntity,
      SectorEntity,
      UserEntity,
    ]),
  ],
  controllers: [ReportsController, InspectionPeriodicReportController],
  providers: [
    ReportsService,
    ReportPdfService,
    ReportPeriodService,
    ReportScopeService,
    ReportTranslationService,
    InspectionPeriodicReportService,
    InspectionDetailReportPdfFidelityService,
    InspectionDetailReportPdfRuntimeService,
    InspectionDetailReportPdfFinalService,
    InspectionDetailReportPdfPixelPerfectService,
    InspectionDetailReportPdfTranslatedService,
    {
      provide: InspectionDetailReportPdfService,
      useExisting: InspectionDetailReportPdfTranslatedService,
    },
  ],
  exports: [ReportPdfService, ReportPeriodService, ReportScopeService, InspectionDetailReportPdfService],
})
export class ReportsModule {}
