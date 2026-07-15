import 'reflect-metadata';
import { config } from 'dotenv';
import type { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

config();

export async function runNotificationsPermissionsSeed(ds: DataSource): Promise<void> {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    await qr.query(
      `INSERT INTO permissions (code, name, module, action)
       VALUES
         ('notifications:read', 'Ver notificaciones', 'notifications', 'read'),
         ('notifications:write', 'Crear notificaciones', 'notifications', 'write')
       ON CONFLICT (code) DO NOTHING`,
    );

    await qr.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r, permissions p
       WHERE r.code = 'ADMIN'
         AND p.code IN ('notifications:read', 'notifications:write')
       ON CONFLICT DO NOTHING`,
    );

    await qr.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r, permissions p
       WHERE r.code IN ('SUPERVISOR', 'INSPECTOR', 'APPROVER', 'VIEWER')
         AND p.code = 'notifications:read'
       ON CONFLICT DO NOTHING`,
    );

    await qr.commitTransaction();
  } catch (error) {
    await qr.rollbackTransaction();
    throw error;
  } finally {
    await qr.release();
  }
}

async function main(): Promise<void> {
  const ds = await AppDataSource.initialize();
  try {
    await runNotificationsPermissionsSeed(ds);
    console.log('Notification permissions seed applied.');
  } finally {
    await ds.destroy();
  }
}

if (require.main === module) {
  void main().catch((err) => {
    console.error('Notification permissions seed failed:', err);
    process.exit(1);
  });
}
