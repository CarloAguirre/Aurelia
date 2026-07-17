import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';

const expectedActiveRoles = [
  'ADMIN',
  'VIEWER',
  'INSPECTOR',
  'INSPECTION_RESPONSIBLE',
  'INSPECTION_CLOSURE_VERIFIER',
  'SPR_RESPONSIBLE',
  'SPR_AREA_MANAGER',
  'SPR_SUSTAINABILITY_SPECIALIST',
  'SPR_ENVIRONMENT_MANAGER',
  'INCIDENT_GENERATOR',
  'INCIDENT_ENV_VALIDATOR',
  'INCIDENT_ENV_COORDINATOR',
  'INCIDENT_SUPERINTENDENT',
  'INCIDENT_ICAM_LEAD',
  'CONTROL_VERIFIER',
  'CONTROL_OWNER',
  'CONTROL_SUPERINTENDENT',
  'CONTROL_MANAGER',
  'CONTROL_CORPORATE_APPROVER',
] as const;

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const dataSource = await AppDataSource.initialize();

  try {
    const activeRows = await dataSource.query(
      `SELECT code FROM roles WHERE is_active = true ORDER BY code`,
    ) as Array<{ code: string }>;
    const activeCodes = new Set(activeRows.map((row) => row.code));

    for (const code of expectedActiveRoles) {
      assert(activeCodes.has(code), `Active role ${code} is missing`);
    }

    const legacyRows = await dataSource.query(
      `SELECT code, is_active FROM roles WHERE code IN ('SUPERVISOR', 'APPROVER') ORDER BY code`,
    ) as Array<{ code: string; is_active: boolean }>;
    assert(legacyRows.length === 2, 'Legacy roles were not preserved for compatibility');
    assert(legacyRows.every((row) => row.is_active === false), 'Legacy roles must be inactive');

    const legacyAssignments = await dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE r.code IN ('SUPERVISOR', 'APPROVER')`,
    ) as Array<{ count: number }>;
    assert((legacyAssignments[0]?.count ?? 0) === 0, 'Legacy user role assignments still exist');

    const usersWithoutRole = await dataSource.query(
      `SELECT u.email
       FROM users u
       WHERE u.is_active = true
         AND NOT EXISTS (
           SELECT 1
           FROM user_roles ur
           INNER JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = u.id
             AND r.is_active = true
         )`,
    ) as Array<{ email: string }>;
    assert(usersWithoutRole.length === 0, `Active users without active roles: ${usersWithoutRole.map((row) => row.email).join(', ')}`);

    const invalidClosureVerifiers = await dataSource.query(
      `SELECT DISTINCT u.email
       FROM users u
       INNER JOIN user_roles ur ON ur.user_id = u.id
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE r.code = 'INSPECTION_CLOSURE_VERIFIER'
         AND NOT (
           lower(u.email) LIKE '%@goldfields.com'
           OR EXISTS (
             SELECT 1 FROM companies c
             WHERE c.id = u.company_id
               AND (c.code = 'CORP' OR c.is_contractor = false OR lower(c.name) LIKE '%gold field%')
           )
           OR EXISTS (
             SELECT 1
             FROM user_companies uc
             INNER JOIN companies c ON c.id = uc.company_id
             WHERE uc.user_id = u.id
               AND (c.code = 'CORP' OR c.is_contractor = false OR lower(c.name) LIKE '%gold field%')
           )
         )`,
    ) as Array<{ email: string }>;
    assert(invalidClosureVerifiers.length === 0, `Non-principal closure verifiers: ${invalidClosureVerifiers.map((row) => row.email).join(', ')}`);

    const reviewPermissionRows = await dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM role_permissions rp
       INNER JOIN roles r ON r.id = rp.role_id
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE r.code = 'INSPECTION_CLOSURE_VERIFIER'
         AND p.code = 'inspections:review'`,
    ) as Array<{ count: number }>;
    assert((reviewPermissionRows[0]?.count ?? 0) === 1, 'Closure verifier is missing inspections:review');

    console.log('Functional roles smoke test passed.');
  } finally {
    await dataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error('Functional roles smoke test failed:', error);
  process.exit(1);
});
