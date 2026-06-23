import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
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
import { FileEntity } from '../modules/files/entities/file.entity';
import { EntityReferenceTypeEntity } from '../modules/evidences/entities/entity-reference-type.entity';
import { EvidenceEntity } from '../modules/evidences/entities/evidence.entity';
import { EvidenceLinkEntity } from '../modules/evidences/entities/evidence-link.entity';
import { CommentEntity } from '../modules/comments/entities/comment.entity';
import { AuditLogEntity } from '../modules/audit/entities/audit-log.entity';
import { WorkflowDefinitionEntity } from '../modules/workflows/entities/workflow-definition.entity';
import { WorkflowDefinitionStepEntity } from '../modules/workflows/entities/workflow-definition-step.entity';
import { WorkflowInstanceEntity } from '../modules/workflows/entities/workflow-instance.entity';
import { WorkflowInstanceStepEntity } from '../modules/workflows/entities/workflow-instance-step.entity';

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
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
