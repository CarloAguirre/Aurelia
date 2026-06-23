import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AreasModule } from './modules/areas/areas.module';
import { MueModule } from './modules/mue/mue.module';
import { CriticalControlsModule } from './modules/critical-controls/critical-controls.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { EvidencesModule } from './modules/evidences/evidences.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AreasModule,
    MueModule,
    CriticalControlsModule,
    InspectionsModule,
    IncidentsModule,
    EvidencesModule,
    WorkflowsModule,
    NotificationsModule,
    ReportsModule,
    AiModule,
  ],
})
export class AppModule {}
