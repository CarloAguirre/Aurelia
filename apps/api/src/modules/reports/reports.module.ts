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
import { InspectionDetailReportPdfService } from './inspection-detail-report-pdf.service';
import { InspectionPeriodicReportController } from './inspection-periodic-report.controller';
import { InspectionPeriodicReportService } from './inspection-periodic-report.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportPeriodService } from './report-period.service';
import { ReportScopeService } from './report-scope.service';
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
    InspectionPeriodicReportService,
    InspectionDetailReportPdfService,
  ],
  exports: [ReportPdfService, ReportPeriodService, ReportScopeService, InspectionDetailReportPdfService],
})
export class ReportsModule {}
