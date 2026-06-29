import 'reflect-metadata';
import { pbkdf2, randomBytes } from 'crypto';
import { config } from 'dotenv';
import { promisify } from 'util';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

config();

const deriveKey = promisify(pbkdf2);
const FORMAT = 'pbkdf2_sha256';
const ITERATIONS = 210000;
const KEY_LENGTH = 32;

async function createPasswordHash(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${FORMAT}$${ITERATIONS}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

async function seed(ds: DataSource): Promise<void> {
  const demoPassword = process.env.AURELIA_DEMO_USER_PASSWORD ?? 'AureliaDemo123!';
  const demoPasswordHash = await createPasswordHash(demoPassword);
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    // System roles
    const roles = [
      { code: 'ADMIN',      name: 'Administrador',        is_system: true },
      { code: 'SUPERVISOR', name: 'Supervisor',            is_system: true },
      { code: 'INSPECTOR',  name: 'Inspector',             is_system: true },
      { code: 'APPROVER',   name: 'Aprobador',             is_system: true },
      { code: 'VIEWER',     name: 'Visualizador',          is_system: true },
    ];

    for (const role of roles) {
      await qr.query(
        `INSERT INTO roles (code, name, is_system, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (code) DO NOTHING`,
        [role.code, role.name, role.is_system],
      );
    }

    // Default company (owner org)
    await qr.query(
      `INSERT INTO companies (code, name, is_contractor, status)
       VALUES ($1, $2, false, 'active')
       ON CONFLICT (code) DO NOTHING`,
      ['CORP', 'Empresa Principal'],
    );

    // Default business unit
    await qr.query(
      `INSERT INTO business_units (code, name, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (code) DO NOTHING`,
      ['BU-001', 'Unidad de Negocio Principal'],
    );

    // Default admin user
    await qr.query(
      `INSERT INTO users (email, first_name, last_name, is_active, password_hash, password_changed_at, failed_login_attempts, locked_until)
       VALUES ($1, $2, $3, true, $4, NOW(), 0, NULL)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@aurelia.local', 'Admin', 'Sistema', demoPasswordHash],
    );

    await qr.query(
      `UPDATE users
       SET password_hash = $2,
           password_changed_at = NOW(),
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE email = $1`,
      ['admin@aurelia.local', demoPasswordHash],
    );

    // Assign ADMIN role to default admin user
    await qr.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id
       FROM users u, roles r
       WHERE u.email = 'admin@aurelia.local'
         AND r.code  = 'ADMIN'
       ON CONFLICT DO NOTHING`,
    );

    // Base permissions
    const permissions = [
      { code: 'organization:read',  name: 'Ver organización',       module: 'organization', action: 'read'  },
      { code: 'organization:write', name: 'Editar organización',    module: 'organization', action: 'write' },
      { code: 'users:read',         name: 'Ver usuarios',           module: 'users',        action: 'read'  },
      { code: 'users:write',        name: 'Editar usuarios',        module: 'users',        action: 'write' },
      { code: 'roles:read',         name: 'Ver roles',              module: 'roles',        action: 'read'  },
      { code: 'roles:write',        name: 'Editar roles',           module: 'roles',        action: 'write' },
      { code: 'permissions:read',   name: 'Ver permisos',           module: 'permissions',  action: 'read'  },
      { code: 'permissions:write',  name: 'Editar permisos',        module: 'permissions',  action: 'write' },
      { code: 'mobile:read',        name: 'Ver bootstrap mobile',    module: 'mobile',       action: 'read'  },
      { code: 'mobile:sync',        name: 'Sincronizar mobile',      module: 'mobile',       action: 'sync'  },
      { code: 'inspections:read',   name: 'Ver inspecciones',       module: 'inspections',  action: 'read'  },
      { code: 'inspections:write',  name: 'Editar inspecciones',    module: 'inspections',  action: 'write' },
      { code: 'incidents:read',     name: 'Ver incidentes',         module: 'incidents',    action: 'read'  },
      { code: 'incidents:write',    name: 'Editar incidentes',      module: 'incidents',    action: 'write' },
      { code: 'spr:read',           name: 'Ver SPR',                module: 'spr',          action: 'read'  },
      { code: 'spr:write',          name: 'Editar SPR',             module: 'spr',          action: 'write' },
      { code: 'spr:submit',         name: 'Enviar SPR',             module: 'spr',          action: 'submit' },
      { code: 'spr:approve',        name: 'Aprobar SPR',            module: 'spr',          action: 'approve' },
      { code: 'evidences:read',     name: 'Ver evidencias',         module: 'evidences',    action: 'read'  },
      { code: 'evidences:write',    name: 'Editar evidencias',      module: 'evidences',    action: 'write' },
      { code: 'evidences:validate', name: 'Validar evidencias',     module: 'evidences',    action: 'validate' },
      { code: 'comments:read',      name: 'Ver comentarios',        module: 'comments',     action: 'read'  },
      { code: 'comments:write',     name: 'Crear comentarios',      module: 'comments',     action: 'write' },
      { code: 'workflows:read',     name: 'Ver workflows',          module: 'workflows',    action: 'read'  },
      { code: 'workflows:write',    name: 'Editar workflows',       module: 'workflows',    action: 'write' },
      { code: 'workflows:approve',  name: 'Aprobar workflows',      module: 'workflows',    action: 'approve' },
    ];

    for (const perm of permissions) {
      await qr.query(
        `INSERT INTO permissions (code, name, module, action)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [perm.code, perm.name, perm.module, perm.action],
      );
    }

    // Assign all base permissions to ADMIN role
    await qr.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r, permissions p
       WHERE r.code = 'ADMIN'
       ON CONFLICT DO NOTHING`,
    );

    const rolePermissions: Record<string, string[]> = {
      SUPERVISOR: [
        'organization:read',
        'users:read',
        'mobile:read',
        'mobile:sync',
        'inspections:read',
        'inspections:write',
        'incidents:read',
        'incidents:write',
        'spr:read',
        'spr:write',
        'spr:submit',
        'spr:approve',
        'evidences:read',
        'evidences:write',
        'evidences:validate',
        'comments:read',
        'comments:write',
        'workflows:read',
        'workflows:write',
        'workflows:approve',
      ],
      INSPECTOR: [
        'organization:read',
        'mobile:read',
        'mobile:sync',
        'inspections:read',
        'inspections:write',
        'incidents:read',
        'incidents:write',
        'spr:read',
        'spr:write',
        'spr:submit',
        'evidences:read',
        'evidences:write',
        'comments:read',
        'comments:write',
        'workflows:read',
      ],
      APPROVER: [
        'organization:read',
        'users:read',
        'mobile:read',
        'inspections:read',
        'incidents:read',
        'spr:read',
        'spr:approve',
        'evidences:read',
        'evidences:validate',
        'comments:read',
        'comments:write',
        'workflows:read',
        'workflows:approve',
      ],
      VIEWER: [
        'organization:read',
        'mobile:read',
        'inspections:read',
        'incidents:read',
        'spr:read',
        'evidences:read',
        'comments:read',
        'workflows:read',
      ],
    };

    for (const [roleCode, permissionCodes] of Object.entries(rolePermissions)) {
      await qr.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT r.id, p.id
         FROM roles r, permissions p
         WHERE r.code = $1
           AND p.code = ANY($2::text[])
         ON CONFLICT DO NOTHING`,
        [roleCode, permissionCodes],
      );
    }

    // Entity reference type catalog (Phase 2)
    const entityRefTypes = [
      { code: 'inspection',                description: 'Inspección' },
      { code: 'inspection_finding',        description: 'Hallazgo de inspección' },
      { code: 'inspection_followup',       description: 'Seguimiento de hallazgo' },
      { code: 'incident',                  description: 'Incidente ambiental' },
      { code: 'incident_flash_report',     description: 'Flash report de incidente' },
      { code: 'incident_investigation',    description: 'Investigación de incidente' },
      { code: 'incident_action_plan',      description: 'Plan de acción de incidente' },
      { code: 'mue',                       description: 'Evento no deseado mayor' },
      { code: 'critical_control',          description: 'Control crítico' },
      { code: 'control_assessment',        description: 'Autoevaluación de control crítico' },
      { code: 'control_assessment_answer', description: 'Respuesta de autoevaluación' },
      { code: 'spr_record',                description: 'Registro mensual SPR' },
      { code: 'emission_source',           description: 'Fuente de emisión fija' },
      { code: 'emission_activity_level',   description: 'Nivel de actividad de emisión mensual' },
    ];

    for (const ert of entityRefTypes) {
      await qr.query(
        `INSERT INTO entity_reference_types (code, description)
         VALUES ($1, $2)
         ON CONFLICT (code) DO NOTHING`,
        [ert.code, ert.description],
      );
    }

    // Seed workflow definitions: inspection and incident validation flows
    await qr.query(
      `INSERT INTO workflow_definitions (code, name, description, entity_type, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (code) DO NOTHING`,
      ['WF-INSPECTION-VALIDATION', 'Validación de Inspección',
       'Flujo de revisión y aprobación de inspecciones', 'inspection'],
    );
    await qr.query(
      `INSERT INTO workflow_definitions (code, name, description, entity_type, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (code) DO NOTHING`,
      ['WF-INCIDENT-VALIDATION', 'Validación de Incidente',
       'Flujo de revisión y aprobación de incidentes', 'incident'],
    );

    // Steps for WF-INSPECTION-VALIDATION
    await qr.query(
      `INSERT INTO workflow_definition_steps (workflow_definition_id, step_order, code, name, required_role_id, sla_hours)
       SELECT wd.id, 1, 'SUPERVISOR_REVIEW', 'Revisión Supervisor',
              (SELECT id FROM roles WHERE code = 'SUPERVISOR'), 48
       FROM workflow_definitions wd
       WHERE wd.code = 'WF-INSPECTION-VALIDATION'
       ON CONFLICT (workflow_definition_id, step_order) DO NOTHING`,
    );
    await qr.query(
      `INSERT INTO workflow_definition_steps (workflow_definition_id, step_order, code, name, required_role_id, sla_hours)
       SELECT wd.id, 2, 'APPROVER_APPROVAL', 'Aprobación Final',
              (SELECT id FROM roles WHERE code = 'APPROVER'), 24
       FROM workflow_definitions wd
       WHERE wd.code = 'WF-INSPECTION-VALIDATION'
       ON CONFLICT (workflow_definition_id, step_order) DO NOTHING`,
    );

    // Steps for WF-INCIDENT-VALIDATION
    await qr.query(
      `INSERT INTO workflow_definition_steps (workflow_definition_id, step_order, code, name, required_role_id, sla_hours)
       SELECT wd.id, 1, 'SUPERVISOR_REVIEW', 'Revisión Supervisor',
              (SELECT id FROM roles WHERE code = 'SUPERVISOR'), 24
       FROM workflow_definitions wd
       WHERE wd.code = 'WF-INCIDENT-VALIDATION'
       ON CONFLICT (workflow_definition_id, step_order) DO NOTHING`,
    );
    await qr.query(
      `INSERT INTO workflow_definition_steps (workflow_definition_id, step_order, code, name, required_role_id, sla_hours)
       SELECT wd.id, 2, 'APPROVER_APPROVAL', 'Aprobación Final',
              (SELECT id FROM roles WHERE code = 'APPROVER'), 12
       FROM workflow_definitions wd
       WHERE wd.code = 'WF-INCIDENT-VALIDATION'
       ON CONFLICT (workflow_definition_id, step_order) DO NOTHING`,
    );

    await qr.commitTransaction();
    console.log('Seed completed successfully.');
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}

AppDataSource.initialize()
  .then((ds) => seed(ds))
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
