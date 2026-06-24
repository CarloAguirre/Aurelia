import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AuditLogEntity } from '../modules/audit/entities/audit-log.entity';
import { CommentEntity } from '../modules/comments/entities/comment.entity';
import { EntityReferenceTypeEntity } from '../modules/evidences/entities/entity-reference-type.entity';
import { EvidenceLinkEntity } from '../modules/evidences/entities/evidence-link.entity';
import { EvidenceEntity } from '../modules/evidences/entities/evidence.entity';
import { FileEntity } from '../modules/files/entities/file.entity';
import { InspectionFindingEntity } from '../modules/inspections/entities/inspection-finding.entity';
import { InspectionFollowupEntity } from '../modules/inspections/entities/inspection-followup.entity';
import { InspectionFormItemEntity } from '../modules/inspections/entities/inspection-form-item.entity';
import { InspectionFormSectionEntity } from '../modules/inspections/entities/inspection-form-section.entity';
import { InspectionFormTemplateEntity } from '../modules/inspections/entities/inspection-form-template.entity';
import { InspectionItemResponseEntity } from '../modules/inspections/entities/inspection-item-response.entity';
import { InspectionStateEntity } from '../modules/inspections/entities/inspection-state.entity';
import { InspectionTypeEntity } from '../modules/inspections/entities/inspection-type.entity';
import { InspectionEntity } from '../modules/inspections/entities/inspection.entity';
import { AreaEntity } from '../modules/organization/entities/area.entity';
import { BusinessUnitEntity } from '../modules/organization/entities/business-unit.entity';
import { CompanyEntity } from '../modules/organization/entities/company.entity';
import { GerenciaEntity } from '../modules/organization/entities/gerencia.entity';
import { LocationEntity } from '../modules/organization/entities/location.entity';
import { SectorEntity } from '../modules/organization/entities/sector.entity';
import { PermissionEntity } from '../modules/roles/entities/permission.entity';
import { RolePermissionEntity } from '../modules/roles/entities/role-permission.entity';
import { RoleEntity } from '../modules/roles/entities/role.entity';
import { UserAreaEntity } from '../modules/users/entities/user-area.entity';
import { UserCompanyEntity } from '../modules/users/entities/user-company.entity';
import { UserRoleEntity } from '../modules/users/entities/user-role.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { WorkflowDefinitionStepEntity } from '../modules/workflows/entities/workflow-definition-step.entity';
import { WorkflowDefinitionEntity } from '../modules/workflows/entities/workflow-definition.entity';
import { WorkflowInstanceStepEntity } from '../modules/workflows/entities/workflow-instance-step.entity';
import { WorkflowInstanceEntity } from '../modules/workflows/entities/workflow-instance.entity';

config();

/**
 * DataSource usado por el CLI de TypeORM (generación/ejecución de migraciones).
 * En tiempo de aplicación, la conexión se configura en database.module.ts.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'aurelia',
  entities: [
    BusinessUnitEntity,
    GerenciaEntity,
    AreaEntity,
    SectorEntity,
    LocationEntity,
    CompanyEntity,
    UserEntity,
    RoleEntity,
    PermissionEntity,
    UserRoleEntity,
    RolePermissionEntity,
    UserCompanyEntity,
    UserAreaEntity,
    FileEntity,
    EntityReferenceTypeEntity,
    EvidenceEntity,
    EvidenceLinkEntity,
    CommentEntity,
    AuditLogEntity,
    WorkflowDefinitionEntity,
    WorkflowDefinitionStepEntity,
    WorkflowInstanceEntity,
    WorkflowInstanceStepEntity,
    InspectionTypeEntity,
    InspectionFormTemplateEntity,
    InspectionFormSectionEntity,
    InspectionFormItemEntity,
    InspectionEntity,
    InspectionItemResponseEntity,
    InspectionFindingEntity,
    InspectionFollowupEntity,
    InspectionStateEntity,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
