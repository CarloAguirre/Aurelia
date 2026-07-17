import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

config();

const companies = [
  ['CORP', 'Gold fields'],
  ['MUTUAL_SEGURIDAD', 'Mutual de Seguridad'],
  ['SOMACOR', 'SOMACOR'],
  ['STRACON', 'STRACON'],
  ['NEWREST', 'NEWREST'],
  ['ENAEX', 'ENAEX'],
  ['ATLASCOPCO', 'ATLAS COPCO'],
  ['RESITER', 'RESITER'],
  ['GARDECORPS', 'GARDE CORPS'],
  ['FAST_MODULAR', 'FAST MODULAR'],
  ['AGGREKO', 'AGGREKO'],
  ['ICV', 'ICV'],
  ['AKD', 'AKD'],
  ['PRELCO', 'PRELCO'],
  ['ECO_MINING', 'ECO MINING'],
  ['BITUMIX', 'BITUMIX'],
  ['BRINSA', 'BRINSA'],
  ['CESMEC', 'CESMEC'],
  ['CLARO', 'CLARO'],
  ['CEA', 'CEA'],
  ['COMPASS', 'COMPASS'],
  ['COPEC', 'COPEC'],
  ['DEVLE', 'DEVLE'],
  ['ECO_FRIENDLY', 'ECO FRIENDLY'],
  ['FLEX', 'FLEX'],
  ['GEODATA', 'GEODATA'],
  ['GEOMAV', 'GEOMAV'],
  ['GESTIONA', 'GESTIONA'],
  ['HIDROMOTORES', 'HIDROMOTORES'],
  ['HINTER', 'HINTER'],
  ['INSUCAM', 'INSUCAM'],
  ['KOM', 'KOM'],
  ['LINDE', 'LINDE'],
  ['MITTA', 'MITTA'],
  ['NALCO', 'NALCO'],
  ['NOMADE', 'NOMADE'],
  ['NORTEMIN', 'NORTEMIN'],
  ['PROATOM', 'PROATOM'],
  ['PUUCA', 'PUUCA'],
  ['RCH', 'RCH'],
  ['RENZOMAC', 'RENZOMAC'],
  ['RS_ING', 'RS ING'],
  ['SAN_RAFAEL', 'SAN RAFAEL'],
  ['SCAF', 'SCAF'],
  ['SEMINET', 'SEMINET'],
  ['SERVITUM', 'SERVITUM'],
  ['SK', 'SK'],
  ['SNF', 'SNF'],
  ['SODERO', 'SODERO'],
  ['SOTERCO', 'SOTERCO'],
  ['TANDEM', 'TANDEM'],
  ['TDM', 'TDM'],
  ['TECNISEC', 'TECNISEC'],
  ['TECNISERV', 'TECNISERV'],
  ['TREBIA', 'TREBIA'],
  ['TIERNO_VERDE', 'TIERNO VERDE'],
];

const gfUsers = [
  'karen.opazo@goldfields.com',
  'pedro.silva@goldfields.com',
  'carlos.aguirre@goldfields.com',
  'sofia.mendez@goldfields.com',
];

export async function runResponsiblesSeed(ds: DataSource): Promise<void> {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    for (const [code, name] of companies) {
      await qr.query(
        `INSERT INTO companies (code, name, is_contractor, status)
         VALUES ($1, $2, true, 'active')
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           is_contractor = true,
           status = 'active',
           updated_at = NOW()`,
        [code, name],
      );
    }

    for (const email of gfUsers) {
      await qr.query(
        `INSERT INTO user_companies (user_id, company_id)
         SELECT u.id, c.id FROM users u, companies c
         WHERE u.email = $1 AND c.code = 'CORP'
         ON CONFLICT DO NOTHING`,
        [email],
      );
    }

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
    await runResponsiblesSeed(ds);
  } finally {
    await ds.destroy();
  }
}

if (require.main === module) {
  void main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
