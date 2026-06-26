import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { CommentsModule } from './modules/comments/comments.module';
import { EvidencesModule } from './modules/evidences/evidences.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { MobileSyncModule } from './modules/mobile-sync/mobile-sync.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RolesModule } from './modules/roles/roles.module';
import { SprModule } from './modules/spr/spr.module';
import { UsersModule } from './modules/users/users.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    OrganizationModule,
    UsersModule,
    RolesModule,
    FilesModule,
    EvidencesModule,
    CommentsModule,
    AuditModule,
    WorkflowsModule,
    InspectionsModule,
    IncidentsModule,
    MobileSyncModule,
    SprModule,
    AiModule,
  ],
})
export class AppModule {}
