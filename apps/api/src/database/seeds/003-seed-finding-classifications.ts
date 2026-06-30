import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

config();

const severities = [
  {
    code: 'MENOR',
    name: 'Menor',
    description: 'Incumplimiento procedimental o documental con consecuencias menores. Sin afectación a componentes ambientales. Hallazgos evidenciados dentro del área inspeccionada',
    closureTimeLabel: 'A definir durante inspección',
    sortOrder: 1,
  },
  {
    code: 'MODERADO',
    name: 'Moderado',
    description: 'Incumplimiento legal o procedimental con consecuencias moderadas. Potencial afectación a componentes ambientales. Hallazgos evidenciados dentro del área inspeccionada',
    closureTimeLabel: 'A definir durante inspección',
    sortOrder: 2,
  },
  {
    code: 'GRAVE',
    name: 'Grave',
    description: 'Incumplimiento legal o procedimental con consecuencias graves, riesgo de sanciones externas o incumplimiento contractual. Afectación a componentes ambientales. Hallazgo evidenciado fuera del área o límite inspeccionado.',
    closureTimeLabel: 'A definir durante inspección',
    sortOrder: 3,
  },
];

const findingTypes = [
  { code: 'DESVIACION_EMISIONES_ATMOSFERICAS', name: 'Desviación en emisiones atmosféricas', sortOrder: 1 },
  { code: 'DESVIACION_CONTENCION_SUSTANCIAS', name: 'Desviación en contención de sustancias', sortOrder: 2 },
  { code: 'DESVIACION_SUELO_SITIOS_PATRIMONIALES', name: 'Desviación sobre suelo o sitios patrimoniales', sortOrder: 3 },
  { code: 'DESVIACION_SEGUIMIENTO_VEGETACION_FLORA_FAUNA', name: 'Desviación en seguimiento de medidas de vegetación, flora y fauna', sortOrder: 4 },
  { code: 'DESVIACION_GESTION_ELIMINACION_RESIDUOS', name: 'Desviación en la gestión o eliminación de residuos', sortOrder: 5 },
  { code: 'DESVIACION_EQUIPOS_INFRAESTRUCTURA', name: 'Desviación en el funcionamiento de equipos e infraestructura', sortOrder: 6 },
  { code: 'DESVIACION_RECURSO_HIDRICO', name: 'Desviación en manejo de recurso hídrico', sortOrder: 7 },
];

async function seed(ds: DataSource): Promise<void> {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    for (const item of findingTypes) {
      await qr.query(
        `INSERT INTO inspection_finding_types (code, name, sort_order, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           sort_order = EXCLUDED.sort_order,
           is_active = true,
           updated_at = NOW()`,
        [item.code, item.name, item.sortOrder],
      );
    }

    for (const item of severities) {
      await qr.query(
        `INSERT INTO inspection_finding_severities (code, name, description, closure_time_label, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           closure_time_label = EXCLUDED.closure_time_label,
           sort_order = EXCLUDED.sort_order,
           is_active = true,
           updated_at = NOW()`,
        [item.code, item.name, item.description, item.closureTimeLabel, item.sortOrder],
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

AppDataSource.initialize()
  .then(async (ds) => {
    await seed(ds);
    await ds.destroy();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
