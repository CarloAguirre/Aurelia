import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

config();

async function seed(ds: DataSource): Promise<void> {
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

    // Default admin user (no password — auth TBD in Phase 2)
    await qr.query(
      `INSERT INTO users (email, first_name, last_name, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@aurelia.local', 'Admin', 'Sistema'],
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
      { code: 'organization:read',  name: 'Ver organización',   module: 'organization', action: 'read'  },
      { code: 'organization:write', name: 'Editar organización', module: 'organization', action: 'write' },
      { code: 'users:read',         name: 'Ver usuarios',        module: 'users',        action: 'read'  },
      { code: 'users:write',        name: 'Editar usuarios',     module: 'users',        action: 'write' },
      { code: 'roles:read',         name: 'Ver roles',           module: 'roles',        action: 'read'  },
      { code: 'roles:write',        name: 'Editar roles',        module: 'roles',        action: 'write' },
      { code: 'permissions:read',   name: 'Ver permisos',        module: 'permissions',  action: 'read'  },
      { code: 'permissions:write',  name: 'Editar permisos',     module: 'permissions',  action: 'write' },
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
