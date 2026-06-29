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
    // ── Gerencia (requerida como FK opcional para areas) ──────────────────────
    await qr.query(
      `INSERT INTO gerencias (code, name, status)
       VALUES ('GER-OPS', 'Gerencia de Operaciones', 'active')
       ON CONFLICT (code) DO NOTHING`,
    );

    // ── Áreas (7) ─────────────────────────────────────────────────────────────
    const areas = [
      { code: 'AREA-MINA',         name: 'Mina' },
      { code: 'AREA-PLANTA',       name: 'Planta Procesos' },
      { code: 'AREA-EXPLORACION',  name: 'Exploraciones' },
      { code: 'AREA-MANTENCION',   name: 'Mantención' },
      { code: 'AREA-SERVICIOS',    name: 'Servicios Generales' },
      { code: 'AREA-SUSTAINING',   name: 'Sustaining' },
      { code: 'AREA-MAMBIENTE',    name: 'Medio Ambiente' },
    ];

    for (const a of areas) {
      await qr.query(
        `INSERT INTO areas (code, name, status)
         VALUES ($1, $2, 'active')
         ON CONFLICT (code) DO NOTHING`,
        [a.code, a.name],
      );
    }

    // ── Sectores (18) ─────────────────────────────────────────────────────────
    const sectors: { areaCode: string; code: string; name: string }[] = [
      // Mina
      { areaCode: 'AREA-MINA',        code: 'SECT-MN-NORTE',    name: 'Sector Norte' },
      { areaCode: 'AREA-MINA',        code: 'SECT-MN-PLAT2',    name: 'Plataforma 2' },
      { areaCode: 'AREA-MINA',        code: 'SECT-MN-SUR',      name: 'Sector Sur' },
      { areaCode: 'AREA-MINA',        code: 'SECT-MN-ACCESO',   name: 'Acceso principal' },
      // Planta Procesos
      { areaCode: 'AREA-PLANTA',      code: 'SECT-PL-MODC',     name: 'Módulo C' },
      { areaCode: 'AREA-PLANTA',      code: 'SECT-PL-MODA',     name: 'Módulo A' },
      { areaCode: 'AREA-PLANTA',      code: 'SECT-PL-LIX',      name: 'Lixiviación' },
      { areaCode: 'AREA-PLANTA',      code: 'SECT-PL-PTAS',     name: 'PTAS' },
      // Exploraciones
      { areaCode: 'AREA-EXPLORACION', code: 'SECT-EXP-NORTE',   name: 'Campaña Norte' },
      { areaCode: 'AREA-EXPLORACION', code: 'SECT-EXP-ESTE',    name: 'Campaña Este' },
      // Mantención
      { areaCode: 'AREA-MANTENCION',  code: 'SECT-MNT-TALL',    name: 'Talleres' },
      { areaCode: 'AREA-MANTENCION',  code: 'SECT-MNT-BODEGA',  name: 'Bodega repuestos' },
      // Servicios Generales
      { areaCode: 'AREA-SERVICIOS',   code: 'SECT-SRV-CAMP',    name: 'Campamento Antiguo' },
      { areaCode: 'AREA-SERVICIOS',   code: 'SECT-SRV-COMED',   name: 'Comedor' },
      { areaCode: 'AREA-SERVICIOS',   code: 'SECT-SRV-ACCESO',  name: 'Acceso faena' },
      // Sustaining
      { areaCode: 'AREA-SUSTAINING',  code: 'SECT-SUS-SECTOR',  name: 'Sector Sustaining' },
      // Medio Ambiente
      { areaCode: 'AREA-MAMBIENTE',   code: 'SECT-MA-PTAS',     name: 'PTAS' },
      { areaCode: 'AREA-MAMBIENTE',   code: 'SECT-MA-RELAVES',  name: 'Depósito relaves' },
    ];

    for (const s of sectors) {
      await qr.query(
        `INSERT INTO sectors (area_id, code, name, status)
         SELECT a.id, $1, $2, 'active'
         FROM areas a WHERE a.code = $3
         ON CONFLICT (code) DO NOTHING`,
        [s.code, s.name, s.areaCode],
      );
    }

    // ── Empresas contratistas (8 EECC) ────────────────────────────────────────
    const eecc = [
      { code: 'SOMACOR',     name: 'SOMACOR' },
      { code: 'STRACON',     name: 'STRACON' },
      { code: 'GARDECORPS',  name: 'GARDE CORPS' },
      { code: 'AGGREKO',     name: 'AGGREKO' },
      { code: 'RESITER',     name: 'RESITER' },
      { code: 'ATLASCOPCO',  name: 'ATLAS COPCO' },
      { code: 'NEWREST',     name: 'NEWREST' },
      { code: 'ENAEX',       name: 'ENAEX' },
    ];

    for (const c of eecc) {
      await qr.query(
        `INSERT INTO companies (code, name, is_contractor, status)
         VALUES ($1, $2, true, 'active')
         ON CONFLICT (code) DO NOTHING`,
        [c.code, c.name],
      );
    }

    // ── Usuarios demo ─────────────────────────────────────────────────────────
    // Gold Fields inspectors/supervisors
    const gfUsers = [
      { email: 'karen.opazo@goldfields.com',   first: 'Karen',   last: 'Opazo',    pos: 'Inspector Medio Ambiente' },
      { email: 'pedro.silva@goldfields.com',    first: 'Pedro',   last: 'Silva',    pos: 'Supervisor Medio Ambiente' },
      { email: 'carlos.aguirre@goldfields.com', first: 'Carlos',  last: 'Aguirre',  pos: 'Administrador Sistema' },
    ];

    for (const u of gfUsers) {
      await qr.query(
        `INSERT INTO users (email, first_name, last_name, position, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO NOTHING`,
        [u.email, u.first, u.last, u.pos],
      );

      await qr.query(
        `UPDATE users
         SET password_hash = $2,
             password_changed_at = NOW(),
             failed_login_attempts = 0,
             locked_until = NULL
         WHERE email = $1`,
        [u.email, demoPasswordHash],
      );
    }

    // GF user roles
    await qr.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id FROM users u, roles r
       WHERE u.email = 'karen.opazo@goldfields.com' AND r.code = 'INSPECTOR'
       ON CONFLICT DO NOTHING`,
    );
    await qr.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id FROM users u, roles r
       WHERE u.email = 'pedro.silva@goldfields.com' AND r.code = 'SUPERVISOR'
       ON CONFLICT DO NOTHING`,
    );
    await qr.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id FROM users u, roles r
       WHERE u.email = 'carlos.aguirre@goldfields.com' AND r.code = 'ADMIN'
       ON CONFLICT DO NOTHING`,
    );

    // GF users linked to CORP company
    for (const u of gfUsers) {
      await qr.query(
        `INSERT INTO user_companies (user_id, company_id)
         SELECT u.id, c.id FROM users u, companies c
         WHERE u.email = $1 AND c.code = 'CORP'
         ON CONFLICT DO NOTHING`,
        [u.email],
      );
    }

    // EECC users: [email, firstName, lastName, position, companyCode, rolCode]
    const eeccUsers: [string, string, string, string, string, string][] = [
      ['miguel.pizarro@somacor.com',   'Miguel',   'Pizarro',  'Supervisor Mina',    'SOMACOR',    'SUPERVISOR'],
      ['roberto.gonzalez@somacor.com', 'Roberto',  'González', 'Técnico Mina',       'SOMACOR',    'INSPECTOR'],
      ['carlos.lopez@somacor.com',     'Carlos',   'López',    'Operador',           'SOMACOR',    'INSPECTOR'],
      ['patricia.soto@somacor.com',    'Patricia', 'Soto',     'Técnico HSE',        'SOMACOR',    'INSPECTOR'],
      ['jorge.rojas@stracon.com',      'Jorge',    'Rojas',    'Supervisor',         'STRACON',    'SUPERVISOR'],
      ['ana.morales@stracon.com',      'Ana',      'Morales',  'Técnico',            'STRACON',    'INSPECTOR'],
      ['rodrigo.mendez@gardecorps.com','Rodrigo',  'Méndez',   'Supervisor',         'GARDECORPS', 'SUPERVISOR'],
      ['luis.vargas@gardecorps.com',   'Luis',     'Vargas',   'Operador',           'GARDECORPS', 'INSPECTOR'],
      ['carlos.rojas@aggreko.com',     'Carlos',   'Rojas',    'Técnico',            'AGGREKO',    'INSPECTOR'],
      ['maria.fuentes@aggreko.com',    'María',    'Fuentes',  'HSE',                'AGGREKO',    'INSPECTOR'],
      ['diego.perez@resiter.com',      'Diego',    'Pérez',    'Supervisor',         'RESITER',    'SUPERVISOR'],
      ['veronica.luna@resiter.com',    'Verónica', 'Luna',     'Operadora',          'RESITER',    'INSPECTOR'],
    ];

    for (const [email, first, last, pos, compCode, rol] of eeccUsers) {
      // Insert user
      await qr.query(
        `INSERT INTO users (email, first_name, last_name, position, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO NOTHING`,
        [email, first, last, pos],
      );

      await qr.query(
        `UPDATE users
         SET password_hash = $2,
             password_changed_at = NOW(),
             failed_login_attempts = 0,
             locked_until = NULL
         WHERE email = $1`,
        [email, demoPasswordHash],
      );

      // Assign role
      await qr.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT u.id, r.id FROM users u, roles r
         WHERE u.email = $1 AND r.code = $2
         ON CONFLICT DO NOTHING`,
        [email, rol],
      );

      // Link to company via user_companies
      await qr.query(
        `INSERT INTO user_companies (user_id, company_id)
         SELECT u.id, c.id FROM users u, companies c
         WHERE u.email = $1 AND c.code = $2
         ON CONFLICT DO NOTHING`,
        [email, compCode],
      );
    }

    // ── Tipos de inspección ───────────────────────────────────────────────────
    const inspectionTypes = [
      { code: 'HALLAZGO',        name: 'Hallazgo / Condición Subestándar',   description: 'Registro de hallazgo o condición subestándar detectada en terreno.' },
      { code: 'CHECKLIST_NORM',  name: 'Checklist Normativo',                description: 'Inspección basada en checklist normativo o regulatorio.' },
      { code: 'RUTINA',          name: 'Inspección de Rutina',               description: 'Inspección periódica planificada de rutina.' },
      { code: 'PREVENTIVA',      name: 'Inspección Preventiva',              description: 'Inspección orientada a prevención de accidentes.' },
      { code: 'REGULATORIA',     name: 'Inspección Regulatoria',             description: 'Inspección exigida por normativa ambiental o de seguridad.' },
    ];

    for (const t of inspectionTypes) {
      await qr.query(
        `INSERT INTO inspection_types (code, name, description, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (code) DO NOTHING`,
        [t.code, t.name, t.description],
      );
    }

    await qr.commitTransaction();
    console.log('Demo seed completed successfully.');
    console.log('  → 7 áreas, 18 sectores');
    console.log('  → 8 empresas contratistas (EECC)');
    console.log('  → 15 usuarios demo (12 EECC + 3 GF)');
    console.log('  → 5 tipos de inspección');
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
    console.error('Demo seed failed:', err);
    process.exit(1);
  });
